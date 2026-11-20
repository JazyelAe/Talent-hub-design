"""Toma las capturas de la réplica con Chrome/Edge headless, sin dependencias externas.

Habla con el navegador por el protocolo DevTools (CDP) con un cliente WebSocket mínimo
escrito con la librería estándar. Así puede emular 390 px reales, esperar a que la página
termine de cargar sus datos y capturar la página completa.

Uso:  python tools/servidor.py 8000            (en otra terminal)
      python tools/capturas.py [base] [pantalla ...]
      python tools/capturas.py --revisar      (QA: desbordamiento a 390/768/1440 + tools/auditoria.js)

Guarda docs/capturas/<pantalla>-escritorio.png (1440 px) y <pantalla>-movil.png (390 px).
Usa un perfil temporal propio: no toca el navegador del usuario.
"""
import base64
import json
import os
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "docs" / "capturas"
BASE = sys.argv[1].rstrip("/") if len(sys.argv) > 1 and sys.argv[1].startswith("http") else "http://127.0.0.1:8000"
REVISAR = "--revisar" in sys.argv
SOLO = {a for a in sys.argv[1:] if not a.startswith("http") and not a.startswith("--")}
PUERTO = 9333

NAVEGADORES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "google-chrome", "chromium", "msedge",
]

# (nombre, ruta, segundos extra de espera)
PANTALLAS = [
    ("inicio", "index.html", 1),
    ("vacantes", "vacantes.html", 0),
    ("vacantes-filtros", "vacantes.html?modalidad=remoto&nivel=Mid&smin=25000", 0),
    ("vacantes-vacio", "vacantes.html?q=cobol", 0),
    ("vacantes-cargando", "vacantes.html?demo=lento", -6),   # negativo: capturar a mitad de la espera
    ("vacantes-error", "vacantes.html?demo=error", 0),
    ("vacante-detalle", "vacante.html?id=163", 0),
    ("planes", "planes.html", 0),
    ("empresas", "empresas.html", 0),
    ("privacidad", "privacidad.html", 0),
    ("404", "404.html", 0),
    ("login", "login.html", 0),
    ("registro", "registro.html", 0),
    ("recuperar", "recuperar.html", 0),
    ("mis-postulaciones", "mis-postulaciones.html?como=candidato", 0),
    ("perfil", "perfil.html?como=candidato", 0),
    ("empresa-vacantes", "empresa/vacantes.html?como=empresa", 0),
    ("empresa-publicar", "empresa/publicar.html?como=empresa", 0),
    ("empresa-postulaciones", "empresa/postulaciones.html?como=empresa", 0),
    ("componentes", "componentes.html", 0),
]


# ── Cliente WebSocket mínimo (RFC 6455, solo lo necesario para CDP) ──────────────
class WS:
    def __init__(self, url):
        host_port, ruta = url[len("ws://"):].split("/", 1)
        host, puerto = host_port.split(":")
        self.s = socket.create_connection((host, int(puerto)))
        clave = base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET /{ruta} HTTP/1.1\r\nHost: {host_port}\r\nUpgrade: websocket\r\n"
                        f"Connection: Upgrade\r\nSec-WebSocket-Key: {clave}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        resp = b""
        while b"\r\n\r\n" not in resp:
            resp += self.s.recv(1)
        self.id = 0

    def _recv_exact(self, n):
        datos = b""
        while len(datos) < n:
            parte = self.s.recv(n - len(datos))
            if not parte:
                raise ConnectionError("WebSocket cerrado")
            datos += parte
        return datos

    def enviar(self, texto):
        datos = texto.encode()
        cab = bytearray([0x81])
        n = len(datos)
        if n < 126:
            cab.append(0x80 | n)
        elif n < 65536:
            cab += bytes([0x80 | 126]) + n.to_bytes(2, "big")
        else:
            cab += bytes([0x80 | 127]) + n.to_bytes(8, "big")
        mascara = os.urandom(4)
        self.s.sendall(bytes(cab) + mascara + bytes(b ^ mascara[i % 4] for i, b in enumerate(datos)))

    def recibir(self):
        mensaje = b""
        while True:
            b1, b2 = self._recv_exact(2)
            n = b2 & 0x7F
            if n == 126:
                n = int.from_bytes(self._recv_exact(2), "big")
            elif n == 127:
                n = int.from_bytes(self._recv_exact(8), "big")
            mensaje += self._recv_exact(n)
            if b1 & 0x80:
                return mensaje.decode()

    def cmd(self, metodo, **params):
        self.id += 1
        mi_id = self.id
        self.enviar(json.dumps({"id": mi_id, "method": metodo, "params": params}))
        while True:
            m = json.loads(self.recibir())
            if m.get("id") == mi_id:
                if "error" in m:
                    raise RuntimeError(f"{metodo}: {m['error']}")
                return m.get("result", {})


def navegador():
    for n in NAVEGADORES:
        ruta = shutil.which(n) or (n if Path(n).exists() else None)
        if ruta:
            return ruta
    sys.exit("No encontré Chrome ni Edge.")


def esperar_lista(ws, extra):
    """Espera a que no haya skeletons ni peticiones pendientes (o 10 s como máximo).
    Con `extra` negativo no espera la carga: captura el estado de carga a los |extra| s."""
    if extra < 0:
        time.sleep(-extra)
        return
    fin = time.time() + 10
    while time.time() < fin:
        listo = ws.cmd("Runtime.evaluate", expression=(
            "document.readyState === 'complete' && document.fonts.status === 'loaded' && "
            "!document.querySelector('[aria-busy=true]')"), returnByValue=True)["result"].get("value")
        if listo:
            break
        time.sleep(0.25)
    time.sleep(0.6 + extra)


def capturar(ws, url, archivo, ancho, movil, extra):
    ws.cmd("Emulation.setDeviceMetricsOverride", width=ancho, height=900 if not movil else 844,
           deviceScaleFactor=1, mobile=movil)
    ws.cmd("Page.navigate", url=url)
    time.sleep(0.4)
    esperar_lista(ws, extra)
    ws.cmd("Runtime.evaluate", expression="document.documentElement.style.scrollBehavior='auto';scrollTo(0,0)")
    alto = ws.cmd("Runtime.evaluate", expression="Math.ceil(document.documentElement.scrollHeight)", returnByValue=True)["result"]["value"]
    datos = ws.cmd("Page.captureScreenshot", format="png", captureBeyondViewport=True,
                   clip={"x": 0, "y": 0, "width": ancho, "height": min(alto, 16000), "scale": 1})["data"]
    archivo.write_bytes(base64.b64decode(datos))


def revisar(ws, nombre, url):
    """Desbordamiento horizontal a 390/768/1440 px y auditoría de accesibilidad."""
    codigo = (RAIZ / "tools" / "auditoria.js").read_text(encoding="utf-8")
    codigo = "\n".join(l for l in codigo.splitlines() if not l.lstrip().startswith("//")).strip().rstrip(";")
    linea, detalle = [], []
    for ancho in (390, 768, 1440):
        ws.cmd("Runtime.evaluate", expression="try{localStorage.clear();sessionStorage.clear()}catch(e){}")
        ws.cmd("Emulation.setDeviceMetricsOverride", width=ancho, height=900, deviceScaleFactor=1, mobile=ancho < 768)
        ws.cmd("Page.navigate", url=url)
        time.sleep(0.4)
        esperar_lista(ws, 0)
        desborda = ws.cmd("Runtime.evaluate", returnByValue=True, expression=(
            "document.documentElement.scrollWidth > document.documentElement.clientWidth + 1"))["result"]["value"]
        linea.append(f"{ancho}px {'DESBORDA' if desborda else 'ok'}")
        if ancho == 1440:
            r = ws.cmd("Runtime.evaluate", expression=codigo, returnByValue=True)["result"]["value"]
            linea.append(f"a11y: {len(r['errores'])} errores, {len(r['avisos'])} avisos")
            detalle += r["errores"] + r["avisos"]
    print(f"{nombre:24} " + " | ".join(linea) + "".join(f"\n    - {d}" for d in detalle))


def main():
    exe = navegador()
    SALIDA.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as perfil:
        proc = subprocess.Popen([exe, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
                                 "--no-default-browser-check", f"--remote-debugging-port={PUERTO}",
                                 f"--user-data-dir={perfil}", "about:blank"],
                                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        try:
            destino = None
            for _ in range(50):
                try:
                    pestanas = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PUERTO}/json"))
                    destino = next(p for p in pestanas if p["type"] == "page")
                    break
                except Exception:
                    time.sleep(0.2)
            if not destino:
                sys.exit(f"Chrome no respondió en el puerto {PUERTO}. ¿Quedó otro proceso headless abierto?")
            ws = WS(destino["webSocketDebuggerUrl"])
            ws.cmd("Page.enable")
            ws.cmd("Runtime.enable")
            for nombre, ruta, extra in PANTALLAS:
                if SOLO and nombre not in SOLO:
                    continue
                if REVISAR:
                    revisar(ws, nombre, f"{BASE}/{ruta}")
                    continue
                for sufijo, ancho, movil in (("escritorio", 1440, False), ("movil", 390, True)):
                    # cada captura parte de una demo limpia (sin datos guardados por la anterior)
                    ws.cmd("Runtime.evaluate", expression="try{localStorage.clear();sessionStorage.clear()}catch(e){}")
                    archivo = SALIDA / f"{nombre}-{sufijo}.png"
                    capturar(ws, f"{BASE}/{ruta}", archivo, ancho, movil, extra)
                    print("ok", archivo.relative_to(RAIZ).as_posix())
        finally:
            proc.terminate()
            try:
                proc.wait(timeout=10)
            except subprocess.TimeoutExpired:
                proc.kill()


if __name__ == "__main__":
    main()
