import json
import os
from http.server import BaseHTTPRequestHandler
from urllib.request import Request, urlopen
from urllib.parse import urlparse, urlencode
import importlib.util, pathlib

_api_dir = pathlib.Path(__file__).resolve().parent.parent
_spec = importlib.util.spec_from_file_location("korean_recipes", _api_dir / "korean_recipes.py")
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)
KOREAN_RECIPES = _mod.KOREAN_RECIPES

SPOONACULAR_BASE = "https://api.spoonacular.com"


def get_api_key():
    return os.environ.get("SPOONACULAR_API_KEY", "")


def spoonacular_get(path, params=None):
    key = get_api_key()
    if not key:
        return None
    params = params or {}
    qs = urlencode(params)
    url = f"{SPOONACULAR_BASE}{path}?{qs}" if qs else f"{SPOONACULAR_BASE}{path}"
    req = Request(url, headers={"x-api-key": key, "User-Agent": "BudgetBites/1.0"})
    try:
        with urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode())
    except Exception:
        return None


def normalize_spoonacular_recipe(raw):
    nutrients = {}
    for n in raw.get("nutrition", {}).get("nutrients", []):
        name = n["name"].lower()
        if name == "calories":
            nutrients["calories"] = round(n["amount"])
        elif name == "protein":
            nutrients["protein"] = round(n["amount"])
        elif name == "carbohydrates":
            nutrients["carbs"] = round(n["amount"])
        elif name == "fat":
            nutrients["fat"] = round(n["amount"])
        elif name == "fiber":
            nutrients["fiber"] = round(n["amount"])
    ingredients = []
    for ing in raw.get("extendedIngredients", []):
        ingredients.append({
            "name": ing.get("nameClean") or ing.get("name", ""),
            "amount": ing.get("original", ""),
            "price": None,
        })
    steps = []
    for section in raw.get("analyzedInstructions", []):
        for step in section.get("steps", []):
            steps.append(step["step"])
    price_per_serving = raw.get("pricePerServing")
    if price_per_serving is not None:
        price_per_serving = round(price_per_serving / 100, 2)
    return {
        "id": f"sp-{raw['id']}",
        "title": raw.get("title", ""),
        "image": raw.get("image"),
        "emoji": None,
        "readyInMinutes": raw.get("readyInMinutes"),
        "servings": raw.get("servings"),
        "pricePerServing": price_per_serving,
        "cuisines": raw.get("cuisines", []),
        "diets": raw.get("diets", []),
        "summary": raw.get("summary", ""),
        "nutrition": nutrients,
        "ingredients": ingredients,
        "steps": steps,
    }


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        parts = parsed.path.strip("/").split("/")
        recipe_id = parts[2] if len(parts) >= 3 else ""

        result = None
        status = 200

        if recipe_id.startswith("kr-"):
            for r in KOREAN_RECIPES:
                if r["id"] == recipe_id:
                    result = r
                    break
            if not result:
                result = {"error": "Recipe not found"}
                status = 404

        elif recipe_id.startswith("sp-") and get_api_key():
            sp_id = recipe_id.replace("sp-", "")
            data = spoonacular_get(f"/recipes/{sp_id}/information", {
                "includeNutrition": "true",
            })
            if data:
                result = normalize_spoonacular_recipe(data)
            else:
                result = {"error": "Failed to fetch recipe"}
                status = 502
        else:
            result = {"error": "Recipe not found"}
            status = 404

        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())
