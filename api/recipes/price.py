import json
import sys
import os
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from korean_recipes import KOREAN_RECIPES
from _spoonacular import spoonacular_get, get_api_key


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
