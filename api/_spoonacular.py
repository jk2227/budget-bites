"""Shared Spoonacular helpers for serverless functions."""

import os
from urllib.request import Request, urlopen
from urllib.parse import urlencode
import json

SPOONACULAR_BASE = "https://api.spoonacular.com"


def get_api_key():
    return os.environ.get("SPOONACULAR_API_KEY", "")


def spoonacular_get(path, params=None):
    """Make a GET request to the Spoonacular API. Returns parsed JSON or None on failure."""
    key = get_api_key()
    if not key:
        return None

    params = params or {}
    qs = urlencode(params)
    url = f"{SPOONACULAR_BASE}{path}?{qs}" if qs else f"{SPOONACULAR_BASE}{path}"

    req = Request(url, headers={"x-api-key": key})
    try:
        with urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        return {"_error": str(e)}


def normalize_spoonacular_recipe(raw):
    """Convert a Spoonacular recipe into our standard format."""
    nutrients = {}
    for n in raw.get("nutrition", {}).get("nutrients", []):
        key = n["name"].lower()
        if key == "calories":
            nutrients["calories"] = round(n["amount"])
        elif key == "protein":
            nutrients["protein"] = round(n["amount"])
        elif key == "carbohydrates":
            nutrients["carbs"] = round(n["amount"])
        elif key == "fat":
            nutrients["fat"] = round(n["amount"])
        elif key == "fiber":
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
