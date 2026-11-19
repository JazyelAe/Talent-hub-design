"""Servidor local sin caché para desarrollo: python tools/servidor.py [puerto]"""
import http.server
import sys
from functools import partial
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent


class SinCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    handler = partial(SinCache, directory=str(RAIZ))
    print(f"Sirviendo {RAIZ} en http://127.0.0.1:{puerto}")
    http.server.ThreadingHTTPServer(("127.0.0.1", puerto), handler).serve_forever()
