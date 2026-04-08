import json
import os
from http.server import BaseHTTPRequestHandler
from urllib.request import Request, urlopen
from urllib.parse import urlparse, parse_qs, urlencode
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


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        recipe_id = params.get("id", [""])[0]

        result = None
        status = 200

        if recipe_id.startswith("kr-"):
            for r in KOREAN_RECIPES:
                if r["id"] == recipe_id:
                    total = sum(i["price"] for i in r["ingredients"])
                    result = {
                        "ingredients": r["ingredients"],
                        "totalCost": round(total, 2),
                        "pricePerServing": r["pricePerServing"],
                    }
                    break
            if not result:
                result = {"error": "Recipe not found"}
                status = 404

        elif recipe_id.startswith("sp-") and get_api_key():
            sp_id = recipe_id.replace("sp-", "")
            data = spoonacular_get(f"/recipes/{sp_id}/priceBreakdownWidget.json")
            if data:
                ingredients = []
                for ing in data.get("ingredients", []):
                    ingredients.append({
                        "name": ing.get("name", ""),
                        "amount": str(ing.get("amount", {}).get("us", {}).get("value", "")),
                        "price": round(ing.get("price", 0) / 100, 2),
                    })
                result = {
                    "ingredients": ingredients,
                    "totalCost": round(data.get("totalCost", 0) / 100, 2),
                    "pricePerServing": round(data.get("totalCostPerServing", 0) / 100, 2),
                }
            else:
                result = {"error": "Failed to fetch price data"}
                status = 502
        else:
            result = {"error": "Recipe not found"}
            status = 404

        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())
