import json
import os
from http.server import BaseHTTPRequestHandler
from urllib.request import Request, urlopen
from urllib.parse import urlparse, parse_qs, urlencode

# Inline Korean recipes import
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


def filter_korean(diet=None, max_price=None):
    results = []
    for r in KOREAN_RECIPES:
        if diet and diet not in r["diets"]:
            continue
        if max_price and r["pricePerServing"] > max_price:
            continue
        results.append(r)
    return results


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)

        query = params.get("query", [""])[0]
        cuisine = params.get("cuisine", [""])[0]
        diet = params.get("diet", [""])[0]
        max_price_str = params.get("max_price", ["0"])[0]
        sort = params.get("sort", [""])[0]
        number = int(params.get("number", ["12"])[0])

        max_price = float(max_price_str) if max_price_str else 0
        results = []

        # Include Korean recipes when relevant
        include_korean = (
            not cuisine
            or cuisine.lower() == "korean"
            or "korean" in query.lower()
        )
        if include_korean:
            korean = filter_korean(
                diet=diet if diet else None,
                max_price=max_price if max_price > 0 else None,
            )
            results.extend(korean)

        # Spoonacular search
        if get_api_key():
            sp_params = {
                "number": number,
                "addRecipeNutrition": "true",
                "addRecipeInformation": "true",
                "fillIngredients": "true",
                "instructionsRequired": "true",
            }
            if query:
                sp_params["query"] = query
            if cuisine:
                if cuisine.lower() == "korean":
                    sp_params["cuisine"] = "korean"
                    if not query:
                        sp_params["query"] = "korean"
                else:
                    sp_params["cuisine"] = cuisine
            if diet:
                sp_params["diet"] = diet
            if max_price > 0:
                sp_params["maxPrice"] = str(max_price)
            if sort:
                sort_map = {"price": "price", "time": "time", "calories": "calories", "popularity": "popularity"}
                if sort in sort_map:
                    sp_params["sort"] = sort_map[sort]

            data = spoonacular_get("/recipes/complexSearch", sp_params)
            if data:
                for raw in data.get("results", []):
                    results.append(normalize_spoonacular_recipe(raw))

        # Sort results
        if sort == "price":
            results.sort(key=lambda r: r.get("pricePerServing") or 999)
        elif sort == "time":
            results.sort(key=lambda r: r.get("readyInMinutes") or 999)
        elif sort == "calories":
            results.sort(key=lambda r: r.get("nutrition", {}).get("calories") or 999)

        body = json.dumps({"results": results, "total": len(results)})
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(body.encode())
