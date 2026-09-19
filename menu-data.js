// Configuración general del negocio (Editable desde el Panel /admin)
const defaultBusinessConfig = {
    nombreNegocio: "PERETTI",
    slogan: "SÁNDWICHES, HAMBURGUESAS & MINUTAS",
    telefonoWhatsApp: "5491138530778",
    costoEnvio: 1000,
    aliasTransferencia: "peretti.mp",
    zonaCobertura: "Chacarita, Colegiales, Villa Crespo y Palermo Hollywood",
    horarios: "Lun a Jue: 12:30 a 14:30 y 19:00 a 22:00 | Vie y Sáb: 19:00 a 00:00",
    adminPin: "2026",
    instagram: "@peretti.delivery",
    qrUrl: "https://sir8633.github.io/peretti/menu.html"
};

// Adicionales / Extras seleccionables
const defaultExtras = [
    { id: "extra_huevo", nombre: "Huevo Frito", precio: 400 },
    { id: "extra_salchicha", nombre: "Salchicha", precio: 300 },
    { id: "extra_bacon", nombre: "Bacon Crocante", precio: 700 },
    { id: "extra_cheddar", nombre: "Queso Cheddar Fundido", precio: 500 }
];

// Menú Oficial Peretti (Octubre 2026)
const defaultMenuData = {
    "Combos Estrella c/ Fritas": [
        {
            id: "combo_mila_carne",
            nombre: "Combo Sándwich Mila Carne Completo",
            descripcion: "Milanesa de carne casera gigante, jamón, queso derretido, huevo a la plancha, lechuga y tomate en pan baguette tostado. ¡Sale con papas fritas!",
            precio: 14000,
            img: "img/menu/mila_completo.jpg",
            badge: "Más Pedido 🔥",
            disponible: true,
            permiteExtras: true
        },
        {
            id: "combo_lomito",
            nombre: "Combo Sándwich Lomito Completo",
            descripcion: "Bife de lomo tierno a la plancha, jamón, queso derretido, huevo, lechuga y tomate en pan tostado suave. ¡Sale con papas fritas!",
            precio: 12000,
            img: "img/menu/lomito_completo.jpg",
            badge: "Recomendado ⭐",
            disponible: true,
            permiteExtras: true
        },
        {
            id: "combo_mila_pollo",
            nombre: "Combo Sándwich Mila Pollo Completo",
            descripcion: "Suprema de pollo empanada crocante, jamón, queso derretido, huevo, lechuga y tomate fresco en pan baguette. ¡Sale con papas fritas!",
            precio: 12000,
            img: "img/menu/mila_completo.jpg",
            badge: "",
            disponible: true,
            permiteExtras: true
        }
    ],
    "Hamburguesas c/ Fritas": [
        {
            id: "burger_doble",
            nombre: "Hamburguesa Doble Cheddar & Bacon",
            descripcion: "Doble medallón de carne jugosa a la plancha, abundante queso cheddar fundido, 3 tiras de bacon crocante, lechuga y tomate en pan suave tostado. ¡Incluye papas fritas!",
            precio: 12000,
            img: "img/menu/hamb_doble.jpg",
            badge: "Estrella 🍔",
            disponible: true,
            permiteExtras: true
        },
        {
            id: "burger_completa",
            nombre: "Hamburguesa Completa c/ Fritas",
            descripcion: "Medallón de carne casero a la plancha, jamón cocido, queso derretido, huevo a la plancha, lechuga y tomate. ¡Incluye papas fritas!",
            precio: 10000,
            img: "img/menu/hamb_completa.jpg",
            badge: "Clásica",
            disponible: true,
            permiteExtras: true
        },
        {
            id: "burger_simple",
            nombre: "Hamburguesa Simple c/ Fritas",
            descripcion: "Medallón de carne con lechuga fresca y rodajas de tomate en pan suave artesanal. ¡Incluye papas fritas!",
            precio: 8000,
            img: "img/menu/hamb_completa.jpg",
            badge: "",
            disponible: true,
            permiteExtras: true
        }
    ],
    "Sándwiches Tradicionales": [
        {
            id: "sandw_completo",
            nombre: "Sándwich Completo (Mila / Pollo / Lomito)",
            descripcion: "A elección: milanesa de carne, pollo o bife de lomo con jamón, queso, huevo a la plancha, lechuga y tomate.",
            precio: 12000,
            img: "img/menu/lomito_completo.jpg",
            badge: "Casero",
            disponible: true,
            permiteExtras: true
        },
        {
            id: "sandw_simple",
            nombre: "Sándwich Simple (Mila / Pollo / Lomito)",
            descripcion: "A elección: milanesa de carne, pollo o bife de lomo con lechuga fresca y tomate.",
            precio: 10000,
            img: "img/menu/lomito_completo.jpg",
            badge: "",
            disponible: true,
            permiteExtras: true
        }
    ],
    "Milanesas c/ Fritas": [
        {
            id: "milanesa_peretti",
            nombre: "Milanesa Especial Peretti c/ Fritas Cheddar",
            descripcion: "Nuestra creación especial: milanesa gigante napolitana al horno con salsa especial, mozzarella gratinada, jamón cocido, rodajas de tomate y huevos fritos, servida sobre colchón de papas fritas con salsa cheddar.",
            precio: 22000,
            img: "img/menu/milapizza.jpg",
            badge: "Especial de la Casa 👑",
            disponible: true,
            permiteExtras: true
        },
        {
            id: "milanesa_caballo",
            nombre: "Milanesa a Caballo c/ Fritas",
            descripcion: "Milanesa gigante napolitana con salsa casera de tomate, abundante mozzarella gratinada y 2 huevos fritos a caballo + papas fritas doradas.",
            precio: 20000,
            img: "img/menu/milapizza.jpg",
            badge: "Para Compartir",
            disponible: true,
            permiteExtras: true
        },
        {
            id: "milanesa_simple",
            nombre: "Milanesa Clásica c/ Fritas",
            descripcion: "Milanesa gigante con salsa suave de tomate, mozzarella gratinada y orégano + colchón de papas fritas doradas.",
            precio: 18000,
            img: "img/menu/milapizza.jpg",
            badge: "",
            disponible: true,
            permiteExtras: true
        }
    ],
    "Pizzas Chicas al Molde": [
        {
            id: "pizza_muzza_chica",
            nombre: "Pizza Mozzarella Chica",
            descripcion: "Masa artesanal al molde recién horneada, salsa de tomate de la casa, abundante queso mozzarella gratinado y orégano.",
            precio: 8000,
            img: "img/menu/pizza_muzza.jpg",
            badge: "¡Nueva! 🍕",
            disponible: true,
            permiteExtras: true
        },
        {
            id: "pizza_jamon_chica",
            nombre: "Pizza de Jamón Chica",
            descripcion: "Masa suave al molde, salsa casera, queso mozzarella fundido, jamón cocido seleccionado y orégano.",
            precio: 9500,
            img: "img/menu/pizza_jamon.jpg",
            badge: "¡Nueva! 🍕",
            disponible: true,
            permiteExtras: true
        }
    ],
    "Papas Fritas & Salchipapas": [
        {
            id: "salchipapa_grande",
            nombre: "Salchipapa Especial Grande",
            descripcion: "Generosa porción de papas fritas crocantes mezcladas con rodajas de salchicha dorada a la plancha.",
            precio: 5500,
            img: "img/menu/papas_cheddar.jpg",
            badge: "Top Salchipapa 🔥",
            disponible: true,
            permiteExtras: true
        },
        {
            id: "salchipapa_chica",
            nombre: "Salchipapa Chica",
            descripcion: "Porción individual de papas fritas doradas con salchichas a la plancha.",
            precio: 3500,
            img: "img/menu/papas_cheddar.jpg",
            badge: "",
            disponible: true,
            permiteExtras: true
        },
        {
            id: "papas_grande",
            nombre: "Papas Fritas Grandes",
            descripcion: "Bandeja grande de papas crujientes por fuera y suaves por dentro recién hechas.",
            precio: 4500,
            img: "img/menu/papas.jpg",
            badge: "",
            disponible: true,
            permiteExtras: true
        },
        {
            id: "papas_chica",
            nombre: "Papas Fritas Chicas",
            descripcion: "Porción individual de papas fritas crocantes.",
            precio: 2500,
            img: "img/menu/papas.jpg",
            badge: "",
            disponible: true,
            permiteExtras: true
        }
    ],
    "Bebidas": [
        {
            id: "coca_1_5",
            nombre: "Coca-Cola 1.5L",
            descripcion: "Sabor original, bien fría.",
            precio: 4500,
            img: "img/menu/coca.jpg",
            badge: "",
            disponible: true,
            permiteExtras: false
        },
        {
            id: "agua_500",
            nombre: "Agua Mineral 500ml",
            descripcion: "Sin gas, bien fresca.",
            precio: 3000,
            img: "img/menu/agua.jpg",
            badge: "",
            disponible: true,
            permiteExtras: false
        }
    ]
};

// Función para obtener los datos activos (localStorage si fue editado por admin, o por defecto)
function getActiveBusinessConfig() {
    const saved = localStorage.getItem("peretti_business_config");
    return saved ? JSON.parse(saved) : defaultBusinessConfig;
}

function getActiveMenuData() {
    const saved = localStorage.getItem("peretti_menu_data");
    return saved ? JSON.parse(saved) : defaultMenuData;
}

function getActiveExtras() {
    const saved = localStorage.getItem("peretti_extras");
    return saved ? JSON.parse(saved) : defaultExtras;
}

// Sincronización automática con Servidor Central (Plan B / Flask / SQLite / peretti.ar)
async function syncWithServerIfAvailable() {
    try {
        const resp = await fetch("/api/data");
        if (resp.ok) {
            const data = await resp.json();
            if (data && data.menu) {
                localStorage.setItem("peretti_business_config", JSON.stringify(data.config));
                localStorage.setItem("peretti_menu_data", JSON.stringify(data.menu));
                localStorage.setItem("peretti_extras", JSON.stringify(data.extras));
                return true;
            }
        }
    } catch (e) {
        // En GitHub Pages opera puramente en modo estático
    }
    return false;
}

