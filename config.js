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

  // 2) Notificaciones push al celular (clave PÚBLICA). Ver LEEME.md
  PUSH: {
    VAPID_PUBLIC_KEY: "BFVhhcnInQ5drFTNNNd_t7sDeXjP_Pd0kTsXgh3_X7L1ydgz6pu8fB1RBZHATFa_GQcNUnI9IKduJSMbxLEpM0Q"
  },

  // URL pública del sitio (para abrir la pieza al tocar una notificación).
  // Si lo dejas vacío usa la URL desde donde se abre la página.
  SITE_URL: "",

  // Equipo
  PEOPLE: [
    { id: "flavio", name: "Flavio", color: "#6C5CE7" },
    { id: "maca",   name: "Maca",   color: "#E84393" },
    { id: "javi",   name: "Javi",   color: "#0E9F8E" }
  ],

  // Flujo de trabajo de cada pieza (en este orden)
  STATUSES: [
    { id: "idea",       name: "Idea",        color: "#8A8799" },
    { id: "diseno",     name: "En diseño",   color: "#8B5CF6" },
    { id: "revision",   name: "En revisión", color: "#F59E0B" },
    { id: "cambios",    name: "Cambios",     color: "#EF4444" },
    { id: "aprobado",   name: "Aprobado",    color: "#10B981" },
    { id: "programado", name: "Programado",  color: "#3B82F6" },
    { id: "publicado",  name: "Publicado",   color: "#0D9488" }
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
