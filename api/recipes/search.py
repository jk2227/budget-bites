import json
import sys
import os
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Add parent dir so we can import shared modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from korean_recipes import KOREAN_RECIPES
from _spoonacular import spoonacular_get, normalize_spoonacular_recipe, get_api_key


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
