"""Genera los datos ficticios de /data (determinista: misma semilla, mismos datos).

Uso:  python tools/gen_data.py
Todo es inventado: empresas, personas y textos no existen ni provienen del sitio real.
"""
import json
import random
import unicodedata
from datetime import date, timedelta
from pathlib import Path

random.seed(4902)
HOY = date(2026, 11, 18)
OUT = Path(__file__).resolve().parent.parent / "data"

EMPRESAS = [
    ("Cenote Labs", "Mérida, Yuc.", "Producto SaaS para logística"),
    ("Tule Software", "Oaxaca, Oax.", "Consultoría de software a la medida"),
    ("Jacaranda Tech", "Ciudad de México, CDMX", "Plataforma de pagos para comercios"),
    ("Maguey Digital", "Guadalajara, Jal.", "Agencia de productos digitales"),
    ("Huasteca Systems", "San Luis Potosí, S.L.P.", "Software industrial y de manufactura"),
    ("Tlali Data", "Monterrey, N.L.", "Analítica de datos para retail"),
    ("Cacao Works", "Puebla, Pue.", "Estudio de desarrollo móvil"),
    ("Pirul Studio", "Querétaro, Qro.", "Diseño y desarrollo web"),
    ("Ixtle Cloud", "Ciudad de México, CDMX", "Infraestructura en la nube"),
    ("Copal Software", "Tijuana, B.C.", "Software educativo"),
    ("Agave Analytics", "León, Gto.", "Ciencia de datos y modelos de riesgo"),
    ("Pochote Labs", "Chihuahua, Chih.", "Ciberseguridad para pymes"),
]

CIUDADES = [
    "Ciudad de México, CDMX", "Guadalajara, Jal.", "Monterrey, N.L.", "Querétaro, Qro.",
    "Puebla, Pue.", "León, Gto.", "Mérida, Yuc.", "Chihuahua, Chih.", "Tijuana, B.C.",
    "Toluca, Edo. Méx.", "Aguascalientes, Ags.", "Morelia, Mich.",
]

ROLES = {
    "Desarrollador Frontend": [["React", "TypeScript", "CSS"], ["Vue", "JavaScript", "Tailwind"], ["Angular", "TypeScript", "RxJS"]],
    "Desarrollador Backend": [["Node.js", "PostgreSQL", "Docker"], ["Python", "Django", "Redis"], ["Java", "Spring", "MySQL"], ["Go", "gRPC", "PostgreSQL"]],
    "Desarrollador Full Stack": [["Next.js", "TypeScript", "Prisma"], ["React", "Node.js", "MongoDB"], ["Laravel", "Vue", "MySQL"]],
    "Desarrollador Móvil": [["Kotlin", "Android", "Firebase"], ["Swift", "iOS", "SwiftUI"], ["Flutter", "Dart", "Firebase"], ["React Native", "TypeScript", "Expo"]],
    "Ingeniero de Datos": [["Python", "SQL", "Airflow"], ["Spark", "Scala", "AWS"], ["dbt", "BigQuery", "SQL"]],
    "Ingeniero DevOps": [["Kubernetes", "Terraform", "AWS"], ["Docker", "GitLab CI", "Linux"], ["Azure", "Terraform", "Ansible"]],
    "Analista QA": [["Playwright", "TypeScript", "CI/CD"], ["Cypress", "JavaScript", "Postman"], ["Selenium", "Java", "Jira"]],
    "Diseñador UX/UI": [["Figma", "Prototipado", "Design Systems"], ["Figma", "HTML", "CSS"]],
    "Científico de Datos": [["Python", "scikit-learn", "SQL"], ["Python", "PyTorch", "MLOps"]],
    "Especialista en Ciberseguridad": [["Linux", "Python", "Redes"], ["OWASP", "Burp Suite", "Python"]],
}

NIVELES = {"Jr": (14000, 24000, 1), "Mid": (24000, 40000, 3), "Sr": (40000, 70000, 5)}
MODALIDADES = ["remoto", "hibrido", "presencial"]

DESCRIPCIONES = [
    "Te sumarás a un equipo de producto que entrega cada semana y decide junto con diseño qué construir.",
    "Mantendrás y harás crecer la plataforma principal, con pruebas automáticas y revisiones de código en cada cambio.",
    "Trabajarás en un equipo pequeño donde tu código llega a producción el mismo día y escuchas a los usuarios de primera mano.",
    "Construirás funciones nuevas desde la idea hasta el despliegue, con autonomía y acompañamiento de personas senior.",
    "Participarás en la migración de sistemas heredados hacia una arquitectura moderna, documentando cada decisión.",
    "Colaborarás con clientes de distintos sectores y rotarás entre proyectos cortos con objetivos claros.",
]
EXTRAS = [
    "Inglés intermedio para leer documentación.",
    "Experiencia trabajando con metodologías ágiles.",
    "Gusto por escribir pruebas y documentación.",
    "Disponibilidad para visitar la oficina una vez al mes.",
    "Conocimientos básicos de accesibilidad web.",
    "Experiencia con control de versiones en Git.",
]
BENEFICIOS = [
    "Prestaciones de ley y superiores", "Seguro de gastos médicos mayores", "Vales de despensa",
    "Horario flexible", "Presupuesto anual de capacitación", "30 días de aguinaldo", "Equipo de cómputo",
]


def vacantes():
    out = []
    vid = 100
    for i in range(64):
        rol = random.choice(list(ROLES))
        nivel = random.choices(list(NIVELES), weights=[4, 4, 3])[0]
        lo, hi, exp = NIVELES[nivel]
        smin = random.randrange(lo, hi - 4000, 500)
        smax = smin + random.randrange(5000, 16000, 500)
        emp_id = random.randrange(1, len(EMPRESAS) + 1)
        modalidad = random.choices(MODALIDADES, weights=[4, 4, 2])[0]
        ciudad = EMPRESAS[emp_id - 1][1] if random.random() < 0.6 else random.choice(CIUDADES)
        vid += random.randrange(1, 5)
        out.append({
            "id": vid,
            "titulo": f"{rol} {nivel}",
            "rol": rol,
            "nivel": nivel,
            "empresa_id": emp_id,
            "modalidad": modalidad,
            "ciudad": ciudad,
            "salario_min": smin,
            "salario_max": smax,
            "tecnologias": random.choice(ROLES[rol]),
            "experiencia_anios": max(0, exp + random.choice([-1, 0, 0, 1])),
            "descripcion": random.choice(DESCRIPCIONES),
            "requisitos_extra": random.choice(EXTRAS),
            "beneficios": random.sample(BENEFICIOS, 3),
            "fecha_publicacion": (HOY - timedelta(days=random.randrange(0, 40))).isoformat(),
            "estado": "publicada",
        })
    # La empresa demo (id 1, Cenote Labs) tiene vacantes en distintos estados
    demo = [v for v in out if v["empresa_id"] == 1]
    if len(demo) < 4:
        for v in out[:4 - len(demo)]:
            v["empresa_id"] = 1
        demo = [v for v in out if v["empresa_id"] == 1]
    demo[-1]["estado"] = "en_revision"
    if len(demo) > 3:
        demo[-2]["estado"] = "pausada"
    out.sort(key=lambda v: v["fecha_publicacion"], reverse=True)
    return out


def empresas():
    return [{"id": i, "nombre": n, "ciudad": c, "giro": g}
            for i, (n, c, g) in enumerate(EMPRESAS, start=1)]


NOMBRES = ["Andrea Lozano", "Bruno Villaseñor", "Carla Méndez", "Diego Ortega", "Elena Ruiz",
           "Fernando Salas", "Gabriela Ríos", "Héctor Navarro", "Irene Campos", "Julián Paredes",
           "Karla Ibáñez", "Luis Cárdenas"]
PROFESIONES = ["Desarrolladora Frontend", "Desarrollador Backend", "Ingeniera de Datos",
               "Desarrollador Full Stack", "Analista QA", "Ingeniero DevOps"]


def candidatos(vs):
    demo_ids = [v["id"] for v in vs if v["empresa_id"] == 1 and v["estado"] == "publicada"]
    estados = ["sin_abrir", "sin_abrir", "en_revision", "en_revision", "aceptada", "rechazada"]
    out = []
    for i, nombre in enumerate(NOMBRES, start=1):
        base = unicodedata.normalize("NFD", nombre.split()[0].lower()).encode("ascii", "ignore").decode()
        usuario = base + str(random.randrange(10, 99))
        out.append({
            "id": i,
            "nombre": nombre,
            "usuario": usuario,
            "profesion": random.choice(PROFESIONES),
            "correo": f"{usuario}@correo.ejemplo",
            "telefono": f"55{random.randrange(10000000, 99999999)}",
            "vacante_id": random.choice(demo_ids),
            "estado": random.choice(estados),
            "fecha": (HOY - timedelta(days=random.randrange(0, 15))).isoformat(),
            "mensaje": random.choice(["", "", "Me interesa mucho el puesto; tengo experiencia en proyectos similares."]),
            "cv": f"CV-{usuario}.pdf",
        })
    return out


def postulaciones(vs):
    pub = [v for v in vs if v["estado"] == "publicada" and v["empresa_id"] != 1]
    elegidas = random.sample(pub, 5)
    plan = [
        ("enviada", []),
        ("en_revision", [("en_revision", 2)]),
        ("en_revision", [("en_revision", 6), ("entrevista", 3)]),
        ("aceptada", [("en_revision", 9), ("entrevista", 6), ("aceptada", 2)]),
        ("rechazada", [("en_revision", 12), ("rechazada", 8)]),
    ]
    out = []
    for i, (v, (estado, eventos)) in enumerate(zip(elegidas, plan), start=1):
        envio = HOY - timedelta(days=14 + i * 2)
        evs = [{"tipo": "enviada", "fecha": envio.isoformat()}]
        for tipo, hace in eventos:
            ev = {"tipo": tipo, "fecha": (HOY - timedelta(days=hace)).isoformat()}
            if tipo == "entrevista":
                ev["fecha_entrevista"] = (HOY + timedelta(days=3)).isoformat() + "T11:00"
            evs.append(ev)
        out.append({"id": i, "vacante_id": v["id"], "estado": estado, "fecha": envio.isoformat(), "eventos": evs})
    return out


PLANES = {
    "empresas": [
        {"id": "empresa-gratis", "nombre": "Gratis", "lema": "Publica tus primeras vacantes sin costo",
         "precio": 0, "rasgos": ["Hasta 500 candidatos por vacante", "Revisión de cada vacante", "Panel de postulaciones"]},
        {"id": "empresa-pro", "nombre": "Pro", "lema": "Encuentra talento más rápido", "precio": 399, "destacado": True,
         "rasgos": ["Hasta 5,000 candidatos por vacante", "Todo lo de Gratis", "Agenda de entrevistas"]},
        {"id": "empresa-enterprise", "nombre": "Enterprise", "lema": "La solución completa para reclutamiento", "precio": 1199,
         "rasgos": ["Hasta 10,000 candidatos por vacante", "Todo lo de Pro", "Varias personas en tu equipo"]},
    ],
    "aspirantes": [
        {"id": "aspirante-gratis", "nombre": "Gratis", "lema": "Empieza a explorar oportunidades de TI", "precio": 0,
         "rasgos": ["50 postulaciones por día", "Acceso completo al catálogo de TI"]},
        {"id": "aspirante-premium", "nombre": "Premium", "lema": "Maximiza tus oportunidades", "precio": 129, "destacado": True,
         "rasgos": ["Postulaciones ilimitadas", "Acceso completo al catálogo de TI", "Avisos al instante"]},
    ],
}


def main():
    OUT.mkdir(exist_ok=True)
    vs = vacantes()
    data = {
        "vacantes.json": vs,
        "empresas.json": empresas(),
        "candidatos.json": candidatos(vs),
        "postulaciones.json": postulaciones(vs),
        "planes.json": PLANES,
    }
    for nombre, contenido in data.items():
        (OUT / nombre).write_text(json.dumps(contenido, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(nombre, len(contenido))


if __name__ == "__main__":
    main()
