// Estado del Carrito y Configuración
let cart = [];
let pendingProductForModal = null;

let businessConfig = getActiveBusinessConfig();
let currentMenu = getActiveMenuData();
let availableExtras = getActiveExtras();

document.addEventListener("DOMContentLoaded", () => {
    applyBusinessConfig();
    renderMenu();
    restoreCustomerInfo();
    setupCartListeners();
    setupPaymentToggle();
    setupExtrasModal();
    setupReelsController();
    checkUrlAutoAdd();
});

// Detectar si vino desde menu.html con un producto preseleccionado (?add=id_producto)
function checkUrlAutoAdd() {
    try {
        const params = new URLSearchParams(window.location.search);
        const prodId = params.get("add");
        if (prodId) {
            setTimeout(() => {
                handleProductClick(prodId);
                // Limpiar la URL sin recargar
                window.history.replaceState({}, document.title, window.location.pathname);
            }, 350);
        }
    } catch (e) {
        console.warn("[Peretti] No se pudo procesar parámetro de URL", e);
    }
}

// Restaurar y autoguardar datos del cliente para agilizar futuros pedidos
function restoreCustomerInfo() {
    try {
        const savedName = localStorage.getItem("peretti_customer_name");
        const savedAddress = localStorage.getItem("peretti_customer_address");
        const nameInput = document.getElementById("nombre");
        const addressInput = document.getElementById("direccion");

        if (savedName && nameInput) nameInput.value = savedName;
        if (savedAddress && addressInput) addressInput.value = savedAddress;

        if (nameInput) {
            nameInput.addEventListener("input", (e) => {
                localStorage.setItem("peretti_customer_name", e.target.value.trim());
            });
        }
        if (addressInput) {
            addressInput.addEventListener("input", (e) => {
                localStorage.setItem("peretti_customer_address", e.target.value.trim());
            });
        }
    } catch (e) {
        console.warn("[Peretti] No se pudo acceder a datos previos de cliente", e);
    }
}

// Aplicar configuración de negocio en la interfaz
function applyBusinessConfig() {
    businessConfig = getActiveBusinessConfig();
    
    // Delivery
    const deliveryBadges = document.querySelectorAll(".badge-delivery-cost");
    deliveryBadges.forEach(b => b.textContent = `🛵 Envío: $${businessConfig.costoEnvio.toLocaleString("es-AR")}`);

    // Horarios
    const scheduleEl = document.getElementById("hero-schedule");
    if (scheduleEl) scheduleEl.textContent = `🕒 ${businessConfig.horarios}`;

    // Alias
    const aliasEl = document.getElementById("nav-alias");
    if (aliasEl) aliasEl.textContent = `💳 Alias: ${businessConfig.aliasTransferencia}`;
}

// Renderizar el Menú con Acordeón y Sticky Pills
function renderMenu() {
    const container = document.getElementById("menu-container");
    const pillsContainer = document.getElementById("category-pills-container");
    if (!container) return;
    container.innerHTML = "";
    if (pillsContainer) pillsContainer.innerHTML = "";

    currentMenu = getActiveMenuData();

    let categoryIndex = 0;

    for (const [categoria, productos] of Object.entries(currentMenu)) {
        // Filtrar solo los productos disponibles
        const productosVisibles = productos.filter(p => p.disponible !== false);
        if (productosVisibles.length === 0) continue;

        const catSlug = `cart-cat-${categoryIndex}`;
        const isOpenDefault = (categoryIndex === 0);

        // 1. Crear pill de categoría
        if (pillsContainer) {
            const pill = document.createElement("button");
            pill.type = "button";
            pill.className = `category-pill ${isOpenDefault ? 'active' : ''}`;
            pill.textContent = categoria;
            pill.dataset.target = catSlug;
            pill.addEventListener("click", () => {
                handleCartPillClick(catSlug, pill);
            });
            pillsContainer.appendChild(pill);
        }

        // 2. Crear sección Acordeón
        const catSection = document.createElement("div");
        catSection.className = `accordion-section ${isOpenDefault ? 'is-open' : ''}`;
        catSection.id = catSlug;

        // Cabecera interactiva
        const header = document.createElement("button");
        header.type = "button";
        header.className = "accordion-header";
        header.setAttribute("aria-expanded", isOpenDefault ? "true" : "false");
        header.innerHTML = `
            <div class="accordion-header-left">
                <h3 class="category-title">${categoria}</h3>
                <span class="accordion-count-badge">${productosVisibles.length} ${productosVisibles.length === 1 ? 'plato' : 'platos'}</span>
            </div>
            <div class="accordion-header-right">
                <span class="accordion-toggle-hint">${isOpenDefault ? 'Cerrar' : 'Ver platos'}</span>
                <svg class="accordion-chevron" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>
        `;

        // Contenido colapsable
        const content = document.createElement("div");
        content.className = "accordion-content";

        const inner = document.createElement("div");
        inner.className = "accordion-inner";

        const grid = document.createElement("div");
        grid.className = "products-grid";

        productosVisibles.forEach(prod => {
            const card = document.createElement("div");
            card.className = "product-card";

            const badgeHtml = prod.badge ? `<span class="product-badge">${prod.badge}</span>` : "";

            card.innerHTML = `
                <div class="product-img-wrapper">
                    <img src="${prod.img}" alt="${prod.nombre}" loading="lazy" class="product-img" onerror="this.src='img/menu/papas.jpg'">
                    ${badgeHtml}
                </div>
                <div class="product-info">
                    <h4 class="product-title">${prod.nombre}</h4>
                    <p class="product-desc">${prod.descripcion}</p>
                    <div class="product-footer">
                        <span class="product-price">$${prod.precio.toLocaleString("es-AR")}</span>
                        <button class="btn-add" onclick="handleProductClick('${prod.id}')">
                            <span class="btn-icon">+</span> Agregar
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        inner.appendChild(grid);
        content.appendChild(inner);

        // Toggle al tocar la cabecera
        header.addEventListener("click", () => {
            const currentlyOpen = catSection.classList.contains("is-open");
            if (currentlyOpen) {
                catSection.classList.remove("is-open");
                header.setAttribute("aria-expanded", "false");
                header.querySelector(".accordion-toggle-hint").textContent = "Ver platos";
            } else {
                catSection.classList.add("is-open");
                header.setAttribute("aria-expanded", "true");
                header.querySelector(".accordion-toggle-hint").textContent = "Cerrar";
            }
        });

        catSection.appendChild(header);
        catSection.appendChild(content);
        container.appendChild(catSection);

        categoryIndex++;
    }
}

// Clic en pill de categoría para el Carrito
function handleCartPillClick(targetId, pillElement) {
    document.querySelectorAll("#category-pills-container .category-pill").forEach(p => p.classList.remove("active"));
    pillElement.classList.add("active");

    pillElement.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });

    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        if (!targetSection.classList.contains("is-open")) {
            targetSection.classList.add("is-open");
            const h = targetSection.querySelector(".accordion-header");
            if (h) {
                h.setAttribute("aria-expanded", "true");
                const hint = h.querySelector(".accordion-toggle-hint");
                if (hint) hint.textContent = "Cerrar";
            }
        }

        const stickyBar = document.getElementById("sticky-category-bar");
        const offset = stickyBar ? stickyBar.offsetHeight + 14 : 70;
        const topPos = targetSection.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: topPos, behavior: "smooth" });
    }
}

// Buscar producto por ID
function findProduct(id) {
    for (const productos of Object.values(currentMenu)) {
        const found = productos.find(p => p.id === id);
        if (found) return found;
    }
    return null;
}

// Clic en producto: si permite extras abre el modal, sino agrega directo
function handleProductClick(id) {
    const prod = findProduct(id);
    if (!prod) return;

    if (prod.permiteExtras && availableExtras && availableExtras.length > 0) {
        openExtrasModal(prod);
    } else {
        addToCart(prod, []);
    }
}

// Abrir Modal de Adicionales
function openExtrasModal(prod) {
    pendingProductForModal = prod;
    const modal = document.getElementById("extras-modal");
    const modalTitle = document.getElementById("modal-product-name");
    const modalBasePrice = document.getElementById("modal-base-price");
    const extrasList = document.getElementById("modal-extras-list");
    const btnConfirm = document.getElementById("modal-confirm-btn");

    if (!modal) return;

    modalTitle.textContent = prod.nombre;
    modalBasePrice.textContent = `Precio base: $${prod.precio.toLocaleString("es-AR")}`;

    extrasList.innerHTML = "";
    availableExtras.forEach(extra => {
        const row = document.createElement("label");
        row.className = "extra-checkbox-row";
        row.innerHTML = `
            <input type="checkbox" class="extra-input" value="${extra.id}" data-precio="${extra.precio}" data-nombre="${extra.nombre}">
            <span class="extra-name">+ ${extra.nombre}</span>
            <span class="extra-price">+$${extra.precio.toLocaleString("es-AR")}</span>
        `;
        row.querySelector("input").addEventListener("change", updateModalTotalPrice);
        extrasList.appendChild(row);
    });

    updateModalTotalPrice();
    modal.classList.remove("hidden");
}

// Actualizar total en modal de extras
function updateModalTotalPrice() {
    if (!pendingProductForModal) return;
    const checkboxes = document.querySelectorAll(".extra-input:checked");
    let extraTotal = 0;
    checkboxes.forEach(cb => {
        extraTotal += parseFloat(cb.dataset.precio || 0);
    });

    const grandTotal = pendingProductForModal.precio + extraTotal;
    const btn = document.getElementById("modal-confirm-btn");
    if (btn) {
        btn.textContent = `Agregar al Pedido ($${grandTotal.toLocaleString("es-AR")})`;
    }
}

// Configuración de listeners del modal de extras
function setupExtrasModal() {
    const modal = document.getElementById("extras-modal");
    const btnClose = document.getElementById("modal-close-btn");
    const btnConfirm = document.getElementById("modal-confirm-btn");

    if (btnClose) {
        btnClose.addEventListener("click", () => {
            modal.classList.add("hidden");
            pendingProductForModal = null;
        });
    }

    if (btnConfirm) {
        btnConfirm.addEventListener("click", () => {
            if (!pendingProductForModal) return;
            const selectedCheckboxes = document.querySelectorAll(".extra-input:checked");
            const selectedExtras = [];
            selectedCheckboxes.forEach(cb => {
                selectedExtras.push({
                    id: cb.value,
                    nombre: cb.dataset.nombre,
                    precio: parseFloat(cb.dataset.precio)
                });
            });

            addToCart(pendingProductForModal, selectedExtras);
            modal.classList.add("hidden");
            pendingProductForModal = null;
        });
    }
}

// Agregar al Carrito (soporta ítems con adicionales)
function addToCart(prod, selectedExtras = []) {
    // Generar un ID único según los extras seleccionados
    const extraIds = selectedExtras.map(e => e.id).sort().join("-");
    const cartItemId = `${prod.id}_${extraIds}`;

    const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.precio, 0);
    const unitPrice = prod.precio + extrasTotal;

    const existing = cart.find(item => item.cartItemId === cartItemId);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({
            cartItemId: cartItemId,
            prodId: prod.id,
            nombre: prod.nombre,
            basePrice: prod.precio,
            unitPrice: unitPrice,
            extras: selectedExtras,
            qty: 1
        });
    }

    updateCartUI();
    showToast(`¡${prod.nombre} agregado!`);

    // Animación de pulso en la barra flotante
    const stickyBar = document.getElementById("sticky-cart-bar");
    if (stickyBar) {
        stickyBar.classList.remove("hidden");
        stickyBar.classList.remove("bar-pulse");
        void stickyBar.offsetWidth; // reiniciar animación
        stickyBar.classList.add("bar-pulse");
    }
}

// Abrir y cerrar Drawer de Checkout
function openCartDrawer() {
    const backdrop = document.getElementById("cart-drawer-backdrop");
    const drawer = document.getElementById("cart-drawer");
    if (!backdrop || !drawer) return;

    backdrop.classList.remove("hidden");
    document.body.classList.add("drawer-open");
    requestAnimationFrame(() => {
        drawer.classList.add("drawer-open-anim");
    });
}

function closeCartDrawer(event) {
    if (event && event.target) {
        const isBackdrop = event.target.id === "cart-drawer-backdrop";
        const isCloseBtn = event.target.closest && event.target.closest(".drawer-close-btn");
        const isAddMore = event.target.closest && event.target.closest(".btn-add-more");
        const isHandle = event.target.classList && event.target.classList.contains("drawer-handle");
        if (!isBackdrop && !isCloseBtn && !isAddMore && !isHandle) {
            return;
        }
    }
    const backdrop = document.getElementById("cart-drawer-backdrop");
    const drawer = document.getElementById("cart-drawer");
    if (!backdrop || !drawer) return;

    drawer.classList.remove("drawer-open-anim");
    setTimeout(() => {
        backdrop.classList.add("hidden");
        document.body.classList.remove("drawer-open");
    }, 280);
}

// Modificar cantidad
function changeQty(cartItemId, delta) {
    const item = cart.find(i => i.cartItemId === cartItemId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter(i => i.cartItemId !== cartItemId);
    }

    updateCartUI();
}

// Actualizar Interfaz del Carrito y Barra Flotante
function updateCartUI() {
    businessConfig = getActiveBusinessConfig();
    const deliveryFee = businessConfig.costoEnvio;

    const cartItemsEl = document.getElementById("cart-items");
    const subtotalEl = document.getElementById("cart-subtotal");
    const deliveryFeeEl = document.getElementById("cart-delivery");
    const totalEl = document.getElementById("cart-total");
    const drawerCountEl = document.getElementById("drawer-item-count");
    const btnDrawerTotalEl = document.getElementById("btn-drawer-total");

    const stickyBar = document.getElementById("sticky-cart-bar");
    const barCount = document.getElementById("cart-bar-count");
    const barTotal = document.getElementById("cart-bar-total");

    const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
    const subtotal = cart.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
    const totalFinal = subtotal > 0 ? subtotal + deliveryFee : 0;

    if (cart.length === 0) {
        if (cartItemsEl) cartItemsEl.innerHTML = '<li id="empty-cart-msg">Tu carrito está vacío. ¡Elegí lo que más te guste del menú!</li>';
        if (subtotalEl) subtotalEl.textContent = "$0";
        if (deliveryFeeEl) deliveryFeeEl.textContent = "$0";
        if (totalEl) totalEl.textContent = "$0";
        if (drawerCountEl) drawerCountEl.textContent = "0 ítems seleccionados";
        if (btnDrawerTotalEl) btnDrawerTotalEl.textContent = "$0";
        if (stickyBar) stickyBar.classList.add("hidden");
        updateCashChangeCalculation(0);
        return;
    }

    if (cartItemsEl) {
        cartItemsEl.innerHTML = "";
        cart.forEach(item => {
            const li = document.createElement("li");
            li.className = "cart-item";

            let extrasSummary = "";
            if (item.extras && item.extras.length > 0) {
                const extrasNames = item.extras.map(e => e.nombre).join(", ");
                extrasSummary = `<small class="cart-item-extras">+ ${extrasNames}</small>`;
            }

            li.innerHTML = `
                <div class="cart-item-info">
                    <strong>${item.nombre}</strong>
                    ${extrasSummary}
                    <span class="cart-item-price">$${(item.unitPrice * item.qty).toLocaleString("es-AR")}</span>
                </div>
                <div class="cart-item-controls">
                    <button type="button" class="qty-btn" onclick="changeQty('${item.cartItemId}', -1)" title="Restar">-</button>
                    <span class="qty-num">${item.qty}</span>
                    <button type="button" class="qty-btn" onclick="changeQty('${item.cartItemId}', 1)" title="Sumar">+</button>
                    <button type="button" class="remove-btn" onclick="changeQty('${item.cartItemId}', -${item.qty})" title="Eliminar">&times;</button>
                </div>
            `;
            cartItemsEl.appendChild(li);
        });
    }

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString("es-AR")}`;
    if (deliveryFeeEl) deliveryFeeEl.textContent = `$${deliveryFee.toLocaleString("es-AR")}`;
    if (totalEl) totalEl.textContent = `$${totalFinal.toLocaleString("es-AR")}`;
    if (drawerCountEl) drawerCountEl.textContent = `${totalQty} ${totalQty === 1 ? 'ítem seleccionado' : 'ítems seleccionados'}`;
    if (btnDrawerTotalEl) btnDrawerTotalEl.textContent = `$${totalFinal.toLocaleString("es-AR")}`;

    // Actualizar Barra Flotante
    if (stickyBar) {
        stickyBar.classList.remove("hidden");
        if (barCount) barCount.textContent = totalQty;
        if (barTotal) barTotal.textContent = `$${totalFinal.toLocaleString("es-AR")}`;
    }

    updateCashChangeCalculation(totalFinal);
}

// Configurar toggle y cálculo de Efectivo
function setupPaymentToggle() {
    const radios = document.querySelectorAll('input[name="forma_pago"]');
    const cashContainer = document.getElementById("cash-options-container");
    const cashInput = document.getElementById("monto_abona");
    const btnPagoJusto = document.getElementById("btn-pago-justo");

    radios.forEach(radio => {
        radio.addEventListener("change", (e) => {
            if (cashContainer) {
                if (e.target.value === "efectivo") {
                    cashContainer.classList.remove("hidden");
                } else {
                    cashContainer.classList.add("hidden");
                }
            }
        });
    });

    if (cashInput) {
        cashInput.addEventListener("input", () => {
            businessConfig = getActiveBusinessConfig();
            const subtotal = cart.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
            const total = subtotal > 0 ? subtotal + businessConfig.costoEnvio : 0;
            updateCashChangeCalculation(total);
        });
    }

    if (btnPagoJusto) {
        btnPagoJusto.addEventListener("click", () => {
            businessConfig = getActiveBusinessConfig();
            const subtotal = cart.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
            const total = subtotal > 0 ? subtotal + businessConfig.costoEnvio : 0;
            if (cashInput) cashInput.value = total > 0 ? total : "";
            updateCashChangeCalculation(total);
        });
    }
}

// Calcular vuelto de efectivo
function updateCashChangeCalculation(total) {
    const cashInput = document.getElementById("monto_abona");
    const changeFeedback = document.getElementById("cash-change-feedback");
    if (!cashInput || !changeFeedback) return;

    const val = parseFloat(cashInput.value);
    if (!val || val <= 0 || total <= 0) {
        changeFeedback.innerHTML = "";
        return;
    }

    if (val === total) {
        changeFeedback.innerHTML = `<span class="change-exact">✓ Pago justo (sin cambio)</span>`;
    } else if (val > total) {
        const vuelto = val - total;
        changeFeedback.innerHTML = `<span class="change-info">💵 El repartidor llevará tu vuelto de: <strong>$${vuelto.toLocaleString("es-AR")}</strong></span>`;
    } else {
        changeFeedback.innerHTML = `<span class="change-warn">⚠️ El monto ingresado es menor al total ($${total.toLocaleString("es-AR")})</span>`;
    }
}

// Enviar Pedido por WhatsApp
function setupCartListeners() {
    const btnWhatsapp = document.getElementById("whatsapp-button");
    if (!btnWhatsapp) return;

    btnWhatsapp.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Tu carrito está vacío. ¡Elegí algo rico del menú antes de enviar!");
            return;
        }

        const nombreInput = document.getElementById("nombre");
        const direccionInput = document.getElementById("direccion");
        const nombre = nombreInput ? nombreInput.value.trim() : "";
        if (!nombre) {
            if (nombreInput) {
                nombreInput.focus();
                nombreInput.classList.add("input-error");
                setTimeout(() => nombreInput.classList.remove("input-error"), 1500);
            }
            showToast("Por favor escribí tu nombre");
            return;
        }

        const direccion = direccionInput ? direccionInput.value.trim() : "";
        if (!direccion) {
            if (direccionInput) {
                direccionInput.focus();
                direccionInput.classList.add("input-error");
                setTimeout(() => direccionInput.classList.remove("input-error"), 1500);
            }
            showToast("Por favor ingresá tu dirección para el delivery");
            return;
        }

        try {
            localStorage.setItem("peretti_customer_name", nombre);
            localStorage.setItem("peretti_customer_address", direccion);
        } catch (e) {}

        businessConfig = getActiveBusinessConfig();
        const pagoRadio = document.querySelector('input[name="forma_pago"]:checked');
        const pagoSeleccionado = pagoRadio ? pagoRadio.value : "transferencia";
        const aclaracionesInput = document.getElementById("aclaraciones");
        const aclaraciones = aclaracionesInput ? aclaracionesInput.value.trim() : "";

        const subtotal = cart.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
        const total = subtotal + businessConfig.costoEnvio;

        let detallePago = "";
        if (pagoSeleccionado === "transferencia") {
            detallePago = `📱 Transferencia (Alias: ${businessConfig.aliasTransferencia})`;
        } else {
            const cashVal = parseFloat(document.getElementById("monto_abona").value);
            if (cashVal && cashVal > total) {
                const vuelto = cashVal - total;
                detallePago = `💵 Efectivo (pago con $${cashVal.toLocaleString("es-AR")} - vuelto de $${vuelto.toLocaleString("es-AR")})`;
            } else if (cashVal && cashVal === total) {
                detallePago = "💵 Efectivo (pago justo)";
            } else {
                detallePago = "💵 Efectivo";
            }
        }

        // Armado del mensaje en tono argentino cercano y profesional
        let mensaje = `🍔 *¡Hola Peretti! Quiero hacer un pedido:* 🍔\n\n`;
        mensaje += `👤 *Nombre:* ${nombre}\n`;
        mensaje += `🛵 *Entrega:* Delivery en Chacarita y alrededores\n`;
        mensaje += `🏠 *Dirección:* ${direccion}\n\n`;

        mensaje += `📋 *DETALLE DEL PEDIDO:*\n`;
        cart.forEach(item => {
            let extrasText = "";
            if (item.extras && item.extras.length > 0) {
                extrasText = ` (+ ${item.extras.map(e => e.nombre).join(", ")})`;
            }
            mensaje += ` • ${item.qty}x ${item.nombre}${extrasText} ($${(item.unitPrice * item.qty).toLocaleString("es-AR")})\n`;
        });

        mensaje += `\n📦 *Subtotal:* $${subtotal.toLocaleString("es-AR")}\n`;
        mensaje += `🛵 *Envío:* $${businessConfig.costoEnvio.toLocaleString("es-AR")}\n`;
        mensaje += `💰 *TOTAL A ABONAR:* $${total.toLocaleString("es-AR")}\n\n`;

        mensaje += `💳 *Forma de pago:* ${detallePago}\n`;
        if (aclaraciones) {
            mensaje += `📝 *Aclaraciones:* ${aclaraciones}\n`;
        }

        mensaje += `\n¡Muchas gracias! Aguardo confirmación y demora estimada. 🙌`;

        const encoded = encodeURIComponent(mensaje);
        const url = `https://wa.me/${businessConfig.telefonoWhatsApp}?text=${encoded}`;
        window.open(url, "_blank");
    });
}

// Toast de notificación rápido
function showToast(msg) {
    let toast = document.getElementById("peretti-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "peretti-toast";
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = "toast-show";
    setTimeout(() => {
        toast.className = "";
    }, 2000);
}

// Controlador de Reels (Autoplay, pausa interactiva, sonido individual e IntersectionObserver)
function setupReelsController() {
    const reelCards = document.querySelectorAll(".reel-card");
    const reelVideos = document.querySelectorAll(".reel-video");
    if (!reelCards.length) return;

    reelCards.forEach(card => {
        const video = card.querySelector(".reel-video");
        const soundBtn = card.querySelector(".reel-sound-btn");
        const soundIcon = soundBtn ? soundBtn.querySelector(".sound-icon") : null;
        const videoWrapper = card.querySelector(".reel-video-wrapper");

        if (!video || !videoWrapper) return;

        // Alternar pausa/reproducción al tocar el video
        videoWrapper.addEventListener("click", (e) => {
            if (e.target.closest(".reel-sound-btn") || e.target.closest(".reel-actions-row") || e.target.closest("a")) {
                return;
            }

            if (video.paused) {
                video.play().catch(() => {});
                card.classList.remove("is-paused");
            } else {
                video.pause();
                card.classList.add("is-paused");
            }
        });

        // Control individual de sonido (silencia a los otros al activar uno)
        if (soundBtn && soundIcon) {
            soundBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                if (video.muted) {
                    reelVideos.forEach(v => {
                        v.muted = true;
                        const otherCard = v.closest(".reel-card");
                        const otherIcon = otherCard ? otherCard.querySelector(".sound-icon") : null;
                        if (otherIcon) otherIcon.textContent = "🔇";
                    });
                    video.muted = false;
                    soundIcon.textContent = "🔊";
                } else {
                    video.muted = true;
                    soundIcon.textContent = "🔇";
                }
            });
        }
    });

    // Reproducción automática inteligente (IntersectionObserver)
    if ("IntersectionObserver" in window) {
        const reelsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const vid = entry.target.querySelector("video");
                if (!vid) return;
                if (entry.isIntersecting) {
                    if (!entry.target.classList.contains("is-paused")) {
                        vid.play().catch(() => {});
                    }
                } else {
                    vid.pause();
                }
            });
        }, { threshold: 0.35 });

        reelCards.forEach(card => reelsObserver.observe(card));
    }
}

