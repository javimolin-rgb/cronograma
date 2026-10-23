/* ============================================================
   CONFIGURACIÓN — es el único archivo que necesitas editar.
   Aquí no van claves secretas: todo lo de este archivo es público.
   ============================================================ */
window.CRONO_CONFIG = {
  APP_NAME: "Cronograma de contenido",

  // 1) Dónde se guarda todo: este mismo repositorio de GitHub.
  //    Si la página está publicada en usuario.github.io/repositorio/
  //    se detecta solo y puedes dejar OWNER y REPO vacíos.
  //    Los datos van a datos/contenido.json y los archivos a archivos/.
  GITHUB: {
    OWNER: "javimolin-rgb",
    REPO: "cronograma",
    BRANCH: "main",
    DATA: "datos/contenido.json",
    FILES: "archivos"
  },

  // 2) Notificaciones push al celular (clave PÚBLICA). Ver README.md
  PUSH: {
    VAPID_PUBLIC_KEY: "BFv9No2myL8rqHE1ch3ZuvVsZHPnlSjPG3UW5IBWV-AKPNZpJe06l5IAuYaGFnXUyoyiXe2nwHnQEI9_aHmbqlk"
  },

  // URL pública del sitio (para abrir la pieza al tocar una notificación).
  // Si lo dejas vacío usa la URL desde donde se abre la página.
  SITE_URL: "",

  // Contexto de marca que se incluye en los prompts para la IA
  MARCA: "Neorigen: casas prediseñadas de madera, diseñadas y construidas a medida en Chile. Estética natural, cálida y sobria; luz natural, madera a la vista, integración con el entorno. Paleta azul marino (#1F2A44), verde oliva (#4E5D3C) y blanco. Lema: Vive lo natural.",

  // Quién administra (deja preparada la entrada del equipo y ve las opciones avanzadas)
  ADMIN_PEOPLE: ["javi"],

  // Perfiles que piden contraseña al elegirlos (aquí va su huella, no la contraseña).
  // Para cambiarla: en la consola del navegador, await Crono.huella('javi', 'nueva-clave')
  PERFIL_CLAVE: {
    javi: "85cf6d2a77fcb75fbab867b2a30dd0b991d8e56e024f6a080286805a50ea6cd8"
  },

  // Quién puede importar conversaciones de WhatsApp (el resto no ve el botón)
  IMPORT_PEOPLE: ["javi"],

  // Cómo se llama cada persona en WhatsApp, para asignarle sus mensajes
  WHATSAPP_ALIAS: {
    "Javi Molin": "javi",
    "Javiera Molin": "javi",
    "Javiera": "javi",
    "Macarena Miquel NEO": "maca",
    "Macarena Miquel": "maca",
    "Maca": "maca",
    "Flavio Simonetti NEO": "flavio",
    "Flavio Simonetti": "flavio",
    "Flavio": "flavio"
  },

  // Equipo
  PEOPLE: [
    { id: "flavio", name: "Flavio", color: "#3C5A82" },
    { id: "maca",   name: "Maca",   color: "#A8554E" },
    { id: "javi",   name: "Javi",   color: "#5E7142" }
  ],

  // Flujo de trabajo de cada pieza (en este orden)
  STATUSES: [
    { id: "idea",       name: "Idea",        color: "#8C8A93" },
    { id: "diseno",     name: "En diseño",   color: "#5A6B8C" },
    { id: "revision",   name: "En revisión", color: "#B4701B" },
    { id: "cambios",    name: "Cambios",     color: "#C2453E" },
    { id: "aprobado",   name: "Aprobado",    color: "#5E7142" },
    { id: "programado", name: "Programado",  color: "#3C5A82" },
    { id: "publicado",  name: "Publicado",   color: "#2F5D50" }
  ],

  PLATFORMS: [
    { id: "instagram", name: "Instagram", short: "IG",  color: "#E1306C" },
    { id: "tiktok",    name: "TikTok",    short: "TT",  color: "#111111" },
    { id: "facebook",  name: "Facebook",  short: "FB",  color: "#1877F2" },
    { id: "linkedin",  name: "LinkedIn",  short: "IN",  color: "#0A66C2" },
    { id: "youtube",   name: "YouTube",   short: "YT",  color: "#E62117" },
    { id: "web",       name: "Web / Blog",short: "WEB", color: "#475569" },
    { id: "impreso",   name: "Impreso",   short: "IMP", color: "#8B5E34" },
    { id: "email",     name: "Newsletter",short: "MAIL",color: "#D97706" },
    { id: "otro",      name: "Otro",      short: "···", color: "#7C7A89" }
  ],

  FORMATS: [
    { id: "post",     name: "Post" },
    { id: "carrusel", name: "Carrusel" },
    { id: "reel",     name: "Reel / Video corto" },
    { id: "story",    name: "Story" },
    { id: "video",    name: "Video largo" },
    { id: "banner",   name: "Banner / Gráfica" },
    { id: "articulo", name: "Artículo" },
    { id: "web",      name: "Página web" },
    { id: "pdf",      name: "PDF / Documento" },
    { id: "grafica",  name: "Pieza impresa" },
    { id: "otro",     name: "Otro" }
  ]
};
