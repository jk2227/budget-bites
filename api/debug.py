import os
import json
from http.server import BaseHTTPRequestHandler
from urllib.request import Request, urlopen


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        key = os.environ.get("SPOONACULAR_API_KEY", "")
        result = {"key_set": bool(key), "key_preview": key[:4] + "..." if key else ""}

        url = "https://api.spoonacular.com/recipes/complexSearch?query=pasta&number=1"
        req = Request(url, headers={
            "x-api-key": key,
            "User-Agent": "BudgetBites/1.0",
        })
        try:
            with urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode())
                result["status"] = "success"
                result["recipe_count"] = len(data.get("results", []))
        except Exception as e:
            result["status"] = "error"
            result["error"] = str(e)
            if hasattr(e, "read"):
                try:
                    result["error_body"] = e.read().decode()[:200]
                except Exception:
                    pass

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())
