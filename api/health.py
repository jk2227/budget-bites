import os
import json
from http.server import BaseHTTPRequestHandler


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        key = os.environ.get("SPOONACULAR_API_KEY", "")
        body = json.dumps({
            "status": "ok",
            "spoonacular_configured": bool(key),
        })
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(body.encode())
