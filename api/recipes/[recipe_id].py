import json
import sys
import os
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from korean_recipes import KOREAN_RECIPES
from _spoonacular import spoonacular_get, normalize_spoonacular_recipe, get_api_key


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        # Path: /api/recipes/<recipe_id>
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
