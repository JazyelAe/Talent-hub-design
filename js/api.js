// API simulada. Lee /data/*.json y mezcla lo que la demo guardó en localStorage.
// Parámetros de URL para demostrar estados:
//   ?demo=lento  → la respuesta tarda 9 s (aparece "Despertando el servidor")
//   ?demo=error  → la petición falla (estado de error con "Reintentar")
//   ?demo=vacio  → las listas llegan vacías (estado vacío)
import { ROOT, HOY_DEMO } from "./utils.js";
import { store } from "./store.js";

const DEMO = new URLSearchParams(location.search).get("demo");
const cache = new Map();
let pendientes = 0;

function avisar(delta) {
  pendientes += delta;
  window.dispatchEvent(new CustomEvent("api:cargando", { detail: pendientes > 0 }));
}

async function cargar(nombre) {
  if (!cache.has(nombre)) {
    cache.set(nombre, fetch(`${ROOT}data/${nombre}.json`).then((r) => {
      if (!r.ok) throw new Error(`No se pudo leer ${nombre}`);
      return r.json();
    }));
  }
  return structuredClone(await cache.get(nombre));
}

/** Envuelve cada llamada con retardo de red y los modos de demo. */
async function red(fn, { lista = false } = {}) {
  avisar(+1);
  try {
    const espera = DEMO === "lento" ? 9000 : 350 + Math.random() * 350;
    await new Promise((r) => setTimeout(r, espera));
    if (DEMO === "error") throw new Error("La conexión con el servidor falló. Puede ser temporal.");
    const res = await fn();
    return DEMO === "vacio" && lista ? [] : res;
  } finally {
    avisar(-1);
  }
}

const hoyISO = () => HOY_DEMO.toISOString().slice(0, 10);

// ── Vacantes ──────────────────────────────────────────────────────────
async function todasLasVacantes() {
  const base = await cargar("vacantes");
  const propias = store.get("vacantes-nuevas", []);
  const cambios = store.get("vacantes-cambios", {});
  return [...propias, ...base]
    .filter((v) => cambios[v.id] !== "eliminada")
    .map((v) => (cambios[v.id] ? { ...v, estado: cambios[v.id] } : v));
}

async function conEmpresa(vs) {
  const empresas = await cargar("empresas");
  const porId = Object.fromEntries(empresas.map((e) => [e.id, e]));
  return vs.map((v) => ({ ...v, empresa: porId[v.empresa_id] }));
}

export const api = {
  vacantes: () => red(async () => conEmpresa((await todasLasVacantes()).filter((v) => v.estado === "publicada")), { lista: true }),

  vacante: (id) => red(async () => {
    const v = (await todasLasVacantes()).find((x) => x.id === Number(id));
    return v ? (await conEmpresa([v]))[0] : null;
  }),

  planes: () => red(() => cargar("planes")),

  // ── Candidato ───────────────────────────────────────────────────────
  postulaciones: () => red(async () => {
    const base = await cargar("postulaciones");
    const propias = store.get("postulaciones-nuevas", []);
    const cambios = store.get("postulaciones-cambios", {});
    const vs = await conEmpresa(await todasLasVacantes());
    const porId = Object.fromEntries(vs.map((v) => [v.id, v]));
    return [...propias, ...base]
      .map((p) => (cambios[p.id] ? { ...p, ...cambios[p.id] } : p))
      .map((p) => ({ ...p, vacante: porId[p.vacante_id] }))
      .filter((p) => p.vacante);
  }, { lista: true }),

  yaPostulado: async (vacanteId) => {
    const base = await cargar("postulaciones");
    return [...store.get("postulaciones-nuevas", []), ...base].some((p) => p.vacante_id === Number(vacanteId));
  },

  postular: (vacanteId, datos) => red(async () => {
    const nuevas = store.get("postulaciones-nuevas", []);
    const p = {
      id: Date.now(), vacante_id: Number(vacanteId), estado: "enviada", fecha: hoyISO(),
      eventos: [{ tipo: "enviada", fecha: hoyISO() }], cv: datos.cv, mensaje: datos.mensaje,
    };
    store.set("postulaciones-nuevas", [p, ...nuevas]);
    return p;
  }),

  perfil: () => red(async () => store.get("perfil", {
    usuario: "sofia.demo", correo: "sofia@correo.ejemplo", telefono: "", profesion: "Desarrolladora Frontend",
    resumen: "", habilidades: ["JavaScript", "CSS", "Accesibilidad"], cv: "CV-Sofia-Demo.pdf",
  })),
  guardarPerfil: (perfil) => red(async () => { store.set("perfil", perfil); return perfil; }),

  // ── Empresa ─────────────────────────────────────────────────────────
  vacantesEmpresa: (empresaId) => red(async () =>
    conEmpresa((await todasLasVacantes()).filter((v) => v.empresa_id === empresaId)), { lista: true }),

  crearVacante: (datos) => red(async () => {
    const nuevas = store.get("vacantes-nuevas", []);
    const v = { ...datos, id: 1000 + nuevas.length + 1, estado: "en_revision", fecha_publicacion: hoyISO() };
    store.set("vacantes-nuevas", [v, ...nuevas]);
    return v;
  }),

  cambiarEstadoVacante: (id, estado) => red(async () => {
    const cambios = store.get("vacantes-cambios", {});
    cambios[id] = estado;
    store.set("vacantes-cambios", cambios);
  }),

  // Las postulaciones del candidato demo a vacantes de la empresa demo (Cenote Labs, id 1)
  // aparecen en el panel de la empresa; lo que la empresa decide vuelve a "Mis postulaciones".
  candidatos: () => red(async () => {
    const base = await cargar("candidatos");
    const cambios = store.get("candidatos-cambios", {});
    const vs = await todasLasVacantes();
    const porId = Object.fromEntries(vs.map((v) => [v.id, v]));
    const perfil = store.get("perfil", { usuario: "sofia.demo", correo: "sofia@correo.ejemplo", telefono: "", profesion: "Desarrolladora Frontend", cv: "CV-Sofia-Demo.pdf" });
    const demo = store.get("postulaciones-nuevas", [])
      .filter((p) => porId[p.vacante_id]?.empresa_id === 1)
      .map((p) => ({
        id: `p${p.id}`, postulacion_id: p.id, demo: true, nombre: "Sofía Demo (tú, como candidato)",
        usuario: perfil.usuario, profesion: perfil.profesion, correo: perfil.correo, telefono: perfil.telefono,
        vacante_id: p.vacante_id, estado: "sin_abrir", fecha: p.fecha, mensaje: p.mensaje || "", cv: p.cv,
      }));
    return [...demo, ...base].map((c) => ({ ...c, ...(cambios[c.id] || {}), vacante: porId[c.vacante_id] }));
  }, { lista: true }),

  actualizarCandidato: (id, cambio) => red(async () => {
    const cambios = store.get("candidatos-cambios", {});
    cambios[id] = { ...(cambios[id] || {}), ...cambio };
    store.set("candidatos-cambios", cambios);
    // Si es la postulación del candidato demo, se refleja en su seguimiento
    if (String(id).startsWith("p")) {
      const postId = Number(String(id).slice(1));
      const post = store.get("postulaciones-nuevas", []).find((p) => p.id === postId);
      if (!post) return;
      const cambiosPost = store.get("postulaciones-cambios", {});
      const actual = cambiosPost[postId] || {};
      const eventos = [...(actual.eventos || post.eventos)];
      const hoy = hoyISO();
      const ESTADO = { sin_abrir: "enviada", en_revision: "en_revision", aceptada: "aceptada", rechazada: "rechazada" };
      let estado = actual.estado || post.estado;
      if (cambio.estado) {
        estado = ESTADO[cambio.estado];
        eventos.push({ tipo: estado, fecha: hoy });
      }
      if (cambio.entrevista) eventos.push({ tipo: "entrevista", fecha: hoy, fecha_entrevista: cambio.entrevista });
      cambiosPost[postId] = { estado, eventos };
      store.set("postulaciones-cambios", cambiosPost);
    }
  }),
};

export const modoDemo = DEMO;
