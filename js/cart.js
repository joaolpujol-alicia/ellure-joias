/* ==============================================================
   Sacola de compras.
   Guardada no localStorage do navegador do cliente (não é um
   banco de dados — é só a "sacola" dele enquanto navega no site).
   Ao finalizar, o pedido é registrado na tabela "orders" do
   Supabase (se configurado) e o cliente é levado ao WhatsApp
   com a mensagem já pronta.
   ============================================================== */

const CART_KEY = "ellure_cart_v1";

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product, qty = 1) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url,
      qty,
    });
  }
  saveCart(cart);
}

function updateCartQty(id, qty) {
  let cart = getCart();
  cart = cart
    .map((item) => (item.id === id ? { ...item, qty } : item))
    .filter((item) => item.qty > 0);
  saveCart(cart);
}

function removeFromCart(id) {
  const cart = getCart().filter((item) => item.id !== id);
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

function getCartTotal(cart = getCart()) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartCount(cart = getCart()) {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartBadge() {
  const count = getCartCount();
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = count;
    el.style.display = count > 0 ? "flex" : "none";
  });
}

function buildWhatsAppMessage(cart, customerName) {
  const lines = [];
  lines.push(`Olá! Meu nome é ${customerName || "___"} e gostaria de fazer o seguinte pedido na *Ellure Joias*:`);
  lines.push("");
  cart.forEach((item) => {
    lines.push(`• ${item.qty}x ${item.name} — ${formatPrice(item.price * item.qty)}`);
  });
  lines.push("");
  lines.push(`*Total: ${formatPrice(getCartTotal(cart))}*`);
  lines.push("");
  lines.push("Aguardo confirmação de disponibilidade e forma de pagamento/entrega 💎");
  return lines.join("\n");
}

async function registerOrder(cart, customerName, customerPhone) {
  if (!supabaseClient) return; // sem Supabase configurado, pula o registro
  try {
    await supabaseClient.from("orders").insert({
      customer_name: customerName || null,
      customer_phone: customerPhone || null,
      items: cart,
      total: getCartTotal(cart),
    });
  } catch (e) {
    console.error("[Ellure Joias] não foi possível registrar o pedido:", e);
  }
}

async function checkoutToWhatsApp(customerName, customerPhone) {
  const cart = getCart();
  if (cart.length === 0) return;
  await registerOrder(cart, customerName, customerPhone);
  const message = buildWhatsAppMessage(cart, customerName);
  const url = `https://wa.me/${ELLURE_CONFIG.WHATSAPP_VENDAS}?text=${encodeURIComponent(message)}`;
  clearCart();
  window.location.href = url;
}

window.EllureCart = {
  getCart,
  addToCart,
  updateCartQty,
  removeFromCart,
  clearCart,
  getCartTotal,
  getCartCount,
  updateCartBadge,
  checkoutToWhatsApp,
};

document.addEventListener("DOMContentLoaded", updateCartBadge);
