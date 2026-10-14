"""Abre el simulador con Python estándar; no instala paquetes ni usa Internet."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Timer
import webbrowser

if __name__ == '__main__':
    handler = partial(SimpleHTTPRequestHandler, directory=str(Path(__file__).resolve().parent))
    with ThreadingHTTPServer(('127.0.0.1', 8787), handler) as server:
        url = f'http://127.0.0.1:{server.server_port}/index.html'
        print(f'Simulador Sky: {url}\nDeja esta ventana abierta. Ctrl+C para cerrar.', flush=True)
        Timer(0.5, lambda: webbrowser.open(url)).start()
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print('\nSimulador cerrado.')
