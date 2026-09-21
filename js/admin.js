// Estado en memoria para el panel admin
let adminMenu = {};
let adminExtras = [];
let adminConfig = {};

document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    setupAuthListeners();
    setupTabNavigation();
    setupSaveAndReset();
});

// Comprobar autenticación
function checkAuth() {
    const isLogged = sessionStorage.getItem("peretti_admin_logged");
    const loginScreen = document.getElementById("login-screen");
    const dashboard = document.getElementById("admin-dashboard");

    if (isLogged === "true") {
        loginScreen.classList.add("hidden");
        dashboard.classList.remove("hidden");
        loadDataIntoAdmin();
    } else {
        loginScreen.classList.remove("hidden");
        dashboard.classList.add("hidden");
    }
}

// Configurar login y logout
function setupAuthListeners() {
    const btnLogin = document.getElementById("btn-login");
    const pinInput = document.getElementById("admin-pin-input");
    const errorMsg = document.getElementById("login-error");
    const btnLogout = document.getElementById("btn-logout");

    btnLogin.addEventListener("click", () => {
        const enteredPin = pinInput.value.trim();
        const currentCfg = getActiveBusinessConfig();
        const correctPin = currentCfg.adminPin || "2026";

        if (enteredPin === correctPin) {
            sessionStorage.setItem("peretti_admin_logged", "true");
            errorMsg.classList.add("hidden");
            checkAuth();
        } else {
            errorMsg.classList.remove("hidden");
            pinInput.value = "";
            pinInput.focus();
        }
    });

    pinInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") btnLogin.click();
    });

    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            sessionStorage.removeItem("peretti_admin_logged");
            location.reload();
        });
    }
}

// Navegación entre pestañas
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.dataset.tab;
            tabButtons.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));

            btn.classList.add("active");
            const activeContent = document.getElementById(target);
            if (activeContent) activeContent.classList.add("active");
        });
    });

    // Copiar link QR
    const btnCopy = document.getElementById("btn-copy-qr-url");
    const qrInput = document.getElementById("qr-target-url");
    if (btnCopy && qrInput) {
        btnCopy.addEventListener("click", () => {
            qrInput.select();
            navigator.clipboard.writeText(qrInput.value);
            showAdminToast("¡Link copiado al portapapeles!");
        });
    }
}

// Cargar datos en el panel
function loadDataIntoAdmin() {
    adminConfig = JSON.parse(JSON.stringify(getActiveBusinessConfig()));
    adminMenu = JSON.parse(JSON.stringify(getActiveMenuData()));
    adminExtras = JSON.parse(JSON.stringify(getActiveExtras()));

    renderAdminProducts();
    renderAdminExtras();
    renderAdminConfig();
}

// Renderizar lista de platos para edición
function renderAdminProducts() {
    const container = document.getElementById("admin-products-list");
    if (!container) return;
    container.innerHTML = "";

    for (const [catName, productos] of Object.entries(adminMenu)) {
        const catBlock = document.createElement("div");
        catBlock.className = "admin-category-block";

        const title = document.createElement("h4");
        title.className = "admin-category-title";
        title.textContent = catName;
        catBlock.appendChild(title);

        productos.forEach(prod => {
            const card = document.createElement("div");
            card.className = "admin-product-card";
            card.dataset.prodId = prod.id;

            const isPromo = prod.badge && prod.badge.includes("⭐") || prod.badge === "Promo ⭐";

            card.innerHTML = `
                <img src="${prod.img}" alt="${prod.nombre}" class="admin-product-thumb" id="thumb-${prod.id}" onerror="this.src='img/menu/papas.jpg'">
                <div class="admin-product-details">
                    <h4 contenteditable="true" class="editable-name" data-id="${prod.id}">${prod.nombre}</h4>
                    <p contenteditable="true" class="editable-desc" data-id="${prod.id}">${prod.descripcion}</p>
                </div>
                <div class="admin-product-controls">
                    <div class="price-edit-box">
                        <span>$</span>
                        <input type="number" class="price-input" data-id="${prod.id}" value="${prod.precio}" step="500" min="0">
                    </div>
                    <label class="toggle-label">
                        <input type="checkbox" class="stock-toggle" data-id="${prod.id}" ${prod.disponible !== false ? 'checked' : ''}>
                        Disponible
                    </label>
                    <label class="toggle-label">
                        <input type="checkbox" class="promo-toggle" data-id="${prod.id}" ${isPromo ? 'checked' : ''}>
                        ⭐ Promo
                    </label>
                    <label class="btn-secondary-outline" style="cursor: pointer; padding: 6px 10px; font-size: 0.75rem;">
                        📷 Foto
                        <input type="file" accept="image/*" class="file-photo-input" data-id="${prod.id}" style="display: none;">
                    </label>
                </div>
            `;
            catBlock.appendChild(card);
        });

        container.appendChild(catBlock);
    }

    setupPhotoUploaders();
}

// Configurar uploader de fotos con auto-crop a formato cuadrado
function setupPhotoUploaders() {
    const inputs = document.querySelectorAll(".file-photo-input");
    inputs.forEach(input => {
        input.addEventListener("change", (e) => {
            const file = e.target.files[0];
            const prodId = input.dataset.id;
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // Recorte cuadrado automático en canvas
                    const canvas = document.createElement("canvas");
                    const size = 500;
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext("2d");

                    const minDim = Math.min(img.width, img.height);
                    const sx = (img.width - minDim) / 2;
                    const sy = (img.height - minDim) / 2;

                    ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
                    const squareDataUrl = canvas.toDataURL("image/jpeg", 0.9);

                    // Actualizar en el objeto de datos y en la vista
                    updateProductField(prodId, "img", squareDataUrl);
                    const thumb = document.getElementById(`thumb-${prodId}`);
                    if (thumb) thumb.src = squareDataUrl;

                    showAdminToast("¡Foto recortada y actualizada!");
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    });
}

// Actualizar campo en el objeto adminMenu
function updateProductField(prodId, field, value) {
    for (const productos of Object.values(adminMenu)) {
        const prod = productos.find(p => p.id === prodId);
        if (prod) {
            prod[field] = value;
            return;
        }
    }
}

// Renderizar adicionales (Extras)
function renderAdminExtras() {
    const container = document.getElementById("admin-extras-list");
    if (!container) return;
    container.innerHTML = "";

    adminExtras.forEach((extra, index) => {
        const row = document.createElement("div");
        row.className = "admin-product-card";
        row.style.marginBottom = "10px";
        row.innerHTML = `
            <div style="flex: 1;">
                <strong>${extra.nombre}</strong>
            </div>
            <div class="price-edit-box">
                <span>$</span>
                <input type="number" class="extra-price-input" data-index="${index}" value="${extra.precio}" step="100" min="0">
            </div>
            <button type="button" class="remove-btn" onclick="removeExtra(${index})" title="Eliminar">&times;</button>
        `;
        container.appendChild(row);
    });

    const btnAdd = document.getElementById("btn-add-extra");
    if (btnAdd) {
        btnAdd.onclick = () => {
            const nombre = prompt("Nombre del nuevo adicional (ej: Cheddar Extra):");
            if (!nombre) return;
            const precioStr = prompt("Precio (ej: 500):", "500");
            const precio = parseFloat(precioStr) || 0;
            const newId = `extra_${Date.now()}`;
            adminExtras.push({ id: newId, nombre: nombre, precio: precio });
            renderAdminExtras();
        };
    }
}

function removeExtra(index) {
    adminExtras.splice(index, 1);
    renderAdminExtras();
}

// Renderizar configuración de negocio
function renderAdminConfig() {
    document.getElementById("cfg-delivery-fee").value = adminConfig.costoEnvio || 1000;
    document.getElementById("cfg-phone").value = adminConfig.telefonoWhatsApp || "5491138530778";
    document.getElementById("cfg-alias").value = adminConfig.aliasTransferencia || "peretti.mp";
    document.getElementById("cfg-schedules").value = adminConfig.horarios || "";
    document.getElementById("cfg-coverage").value = adminConfig.zonaCobertura || "";
    document.getElementById("cfg-admin-pin").value = adminConfig.adminPin || "2026";
}

// Guardar y Restablecer
function setupSaveAndReset() {
    const btnSave = document.getElementById("btn-save-changes");
    const btnReset = document.getElementById("btn-reset-defaults");

    btnSave.addEventListener("click", () => {
        // 1. Recoger precios, nombres, descripciones y toggles de productos
        for (const [catName, productos] of Object.entries(adminMenu)) {
            productos.forEach(prod => {
                const priceInput = document.querySelector(`.price-input[data-id="${prod.id}"]`);
                if (priceInput) prod.precio = parseFloat(priceInput.value) || 0;

                const nameEl = document.querySelector(`.editable-name[data-id="${prod.id}"]`);
                if (nameEl) prod.nombre = nameEl.textContent.trim();

                const descEl = document.querySelector(`.editable-desc[data-id="${prod.id}"]`);
                if (descEl) prod.descripcion = descEl.textContent.trim();

                const stockCb = document.querySelector(`.stock-toggle[data-id="${prod.id}"]`);
                if (stockCb) prod.disponible = stockCb.checked;

                const promoCb = document.querySelector(`.promo-toggle[data-id="${prod.id}"]`);
                if (promoCb) {
                    prod.badge = promoCb.checked ? "Promo ⭐" : (prod.badge && prod.badge.includes("⭐") ? "" : prod.badge);
                }
            });
        }

        // 2. Recoger precios de extras
        adminExtras.forEach((extra, idx) => {
            const input = document.querySelector(`.extra-price-input[data-index="${idx}"]`);
            if (input) extra.precio = parseFloat(input.value) || 0;
        });

        // 3. Recoger configuración de negocio
        adminConfig.costoEnvio = parseFloat(document.getElementById("cfg-delivery-fee").value) || 1000;
        adminConfig.telefonoWhatsApp = document.getElementById("cfg-phone").value.trim();
        adminConfig.aliasTransferencia = document.getElementById("cfg-alias").value.trim();
        adminConfig.horarios = document.getElementById("cfg-schedules").value.trim();
        adminConfig.zonaCobertura = document.getElementById("cfg-coverage").value.trim();
        adminConfig.adminPin = document.getElementById("cfg-admin-pin").value.trim() || "2026";

        // 4. Guardar en localStorage
        localStorage.setItem("peretti_menu_data", JSON.stringify(adminMenu));
        localStorage.setItem("peretti_extras", JSON.stringify(adminExtras));
        localStorage.setItem("peretti_business_config", JSON.stringify(adminConfig));
        if (typeof PERETTI_DATA_VERSION !== "undefined") {
            localStorage.setItem("peretti_data_version", PERETTI_DATA_VERSION);
        }

        // 5. Guardar en Servidor Central Flask / SQLite si está disponible
        fetch("/api/admin/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                pin: adminConfig.adminPin || "2026",
                config: adminConfig,
                extras: adminExtras,
                menu: adminMenu
            })
        }).then(res => {
            if (res.ok) console.log("Guardado en SQLite central!");
        }).catch(err => {
            console.log("Modo estático (GitHub Pages / localStorage local)");
        });

        showAdminToast("¡Todos los cambios fueron guardados con éxito!");
    });

    btnReset.addEventListener("click", () => {
        if (confirm("¿Estás seguro de restablecer el menú a los valores originales de fábrica? Se perderán las modificaciones no guardadas.")) {
            localStorage.removeItem("peretti_menu_data");
            localStorage.removeItem("peretti_extras");
            localStorage.removeItem("peretti_business_config");
            loadDataIntoAdmin();
            showAdminToast("Valores restablecidos de fábrica.");
        }
    });
}

// Toast de notificación en el panel admin
function showAdminToast(msg) {
    const toast = document.getElementById("admin-toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2400);
}
