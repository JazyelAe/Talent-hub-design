// Almacenamiento de la demo. Todo vive en el navegador de quien la usa:
// nada se envía a ningún servidor y nunca se guardan contraseñas.

const NS = "th-demo:";

function safe(fn, fallback) {
  try { return fn(); } catch { return fallback; } // modo privado o almacenamiento bloqueado
}

export const store = {
  get(key, fallback = null) {
    return safe(() => {
      const v = localStorage.getItem(NS + key);
      return v === null ? fallback : JSON.parse(v);
    }, fallback);
  },
  set(key, value) {
    safe(() => localStorage.setItem(NS + key, JSON.stringify(value)));
  },
  /** Borra todo lo que la demo guardó y la sesión simulada. */
  reset() {
    safe(() => {
      Object.keys(localStorage).filter((k) => k.startsWith(NS)).forEach((k) => localStorage.removeItem(k));
      sessionStorage.removeItem(NS + "rol");
    });
  },
};

/** Sesión simulada: solo el rol ("candidato" | "empresa"), sin credenciales. */
export const sesion = {
  rol: () => safe(() => sessionStorage.getItem(NS + "rol"), null),
  entrar(rol) { safe(() => sessionStorage.setItem(NS + "rol", rol)); },
  salir() { safe(() => sessionStorage.removeItem(NS + "rol")); },
};

export const USUARIO_DEMO = {
  candidato: { nombre: "Sofía Demo", usuario: "sofia.demo", correo: "sofia@correo.ejemplo" },
  empresa: { nombre: "Cenote Labs", usuario: "cenote.demo", correo: "talento@cenote.ejemplo", empresa_id: 1 },
};
