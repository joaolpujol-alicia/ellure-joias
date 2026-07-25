/* ==============================================================
   Comportamento geral de UI compartilhado por todas as páginas.
   ============================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // Menu mobile
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => nav.classList.remove("open"))
    );
  }

  // Marca o link ativo do menu
  const current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    if (a.getAttribute("href") === current) a.classList.add("active");
  });

  // Botão flutuante do WhatsApp
  const floatBtn = document.querySelector(".whatsapp-float");
  if (floatBtn) {
    const msg = encodeURIComponent(ELLURE_CONFIG.WHATSAPP_MENSAGEM_PADRAO);
    floatBtn.href = `https://wa.me/${ELLURE_CONFIG.WHATSAPP_VENDAS}?text=${msg}`;
  }

  // Preenche links do Instagram
  document.querySelectorAll("[data-instagram-link]").forEach((el) => {
    el.href = `https://instagram.com/${ELLURE_CONFIG.INSTAGRAM_HANDLE}`;
  });
  document.querySelectorAll("[data-instagram-handle]").forEach((el) => {
    el.textContent = `@${ELLURE_CONFIG.INSTAGRAM_HANDLE}`;
  });

  // Ano no rodapé
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
});
