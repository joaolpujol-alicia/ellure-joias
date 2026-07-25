/* ==============================================================
   Camada de dados de produtos.
   Se o Supabase estiver configurado, busca de la.
   Caso contrario, usa um catalogo de exemplo local.
   ============================================================== */

const ELLURE_CATEGORIES_FALLBACK = [
  { id: "aneis", slug: "aneis", name: "Aneis", sort_order: 1 },
  { id: "colares", slug: "colares", name: "Colares", sort_order: 2 },
  { id: "brincos", slug: "brincos", name: "Brincos", sort_order: 3 },
  { id: "pulseiras", slug: "pulseiras", name: "Pulseiras", sort_order: 4 },
  ];

const ELLURE_PRODUCTS_FALLBACK = [
  { id: "p1", name: "Anel Solitario Cristal", description: "Anel fino banhado a ouro com cristal central, acabamento delicado.", price: 89.90, compare_at_price: 119.90, category_id: "aneis", image_url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800", material: "Banhado a ouro 18k", is_featured: true },
  { id: "p2", name: "Anel Duo Argolas", description: "Composicao de duas argolas finas sobrepostas, uso diario.", price: 69.90, compare_at_price: null, category_id: "aneis", image_url: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=800", material: "Banhado a ouro 18k", is_featured: false },
  { id: "p3", name: "Colar Ponto de Luz", description: "Colar delicado com pingente de zirconia e corrente fina ajustavel.", price: 99.90, compare_at_price: 129.90, category_id: "colares", image_url: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800", material: "Banhado a ouro 18k", is_featured: true },
  { id: "p4", name: "Colar Gargantilha Veneziana", description: "Gargantilha em malha veneziana com fecho reforcado.", price: 84.90, compare_at_price: null, category_id: "colares", image_url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800", material: "Prata 925", is_featured: false },
  { id: "p5", name: "Brinco Argola Texturizada", description: "Argola media com textura martelada artesanal.", price: 59.90, compare_at_price: null, category_id: "brincos", image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800", material: "Banhado a ouro 18k", is_featured: true },
  { id: "p6", name: "Brinco Ponto de Luz Zirconia", description: "Brinco pequeno para uso diario, tamanho unico.", price: 49.90, compare_at_price: 69.90, category_id: "brincos", image_url: "https://images.unsplash.com/photo-1589207212797-cfd0870c0a3f?w=800", material: "Prata 925", is_featured: false },
  { id: "p7", name: "Pulseira Riviera Cristais", description: "Pulseira com cristais cravejados, fecho lagosta.", price: 94.90, compare_at_price: null, category_id: "pulseiras", image_url: "https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=800", material: "Banhado a ouro 18k", is_featured: true },
  { id: "p8", name: "Pulseira Berloques Coracao", description: "Pulseira delicada com berloque em formato de coracao.", price: 74.90, compare_at_price: 99.90, category_id: "pulseiras", image_url: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800", material: "Banhado a ouro 18k", is_featured: false },
  ];

function formatPrice(value) {
    const num = Number(value || 0);
    return ELLURE_CONFIG.MOEDA + " " + num.toFixed(2).replace(".", ",");
}

async function fetchCategories() {
    if (!supabaseClient) return ELLURE_CATEGORIES_FALLBACK;
    const { data, error } = await supabaseClient
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
          console.error("[Ellure Joias] erro ao buscar categorias:", error);
          return ELLURE_CATEGORIES_FALLBACK;
    }
    return data && data.length ? data : ELLURE_CATEGORIES_FALLBACK;
}

async function fetchProducts(opts) {
    opts = opts || {};
    const categorySlug = opts.categorySlug || null;
    const featuredOnly = opts.featuredOnly || false;
    const limit = opts.limit || null;

  if (!supabaseClient) {
        let list = ELLURE_PRODUCTS_FALLBACK.slice();
        if (categorySlug) list = list.filter(function(p) { return p.category_id === categorySlug; });
        if (featuredOnly) list = list.filter(function(p) { return p.is_featured; });
        if (limit) list = list.slice(0, limit);
        return list;
  }

  let query = supabaseClient
      .from("products")
      .select("*, categories(name, slug)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

  if (featuredOnly) query = query.eq("is_featured", true);
    if (limit) query = query.limit(limit);

  const { data, error } = await query;
    if (error) {
          console.error("[Ellure Joias] erro ao buscar produtos:", error);
          return [];
    }

  let list = data || [];
    if (categorySlug) {
          list = list.filter(function(p) { return p.categories && p.categories.slug === categorySlug; });
    }
    return list;
}

async function fetchProductById(id) {
    if (!supabaseClient) {
          return ELLURE_PRODUCTS_FALLBACK.find(function(p) { return p.id === id; }) || null;
    }
    const { data, error } = await supabaseClient
      .from("products")
      .select("*, categories(name, slug)")
      .eq("id", id)
      .single();
    if (error) {
          console.error("[Ellure Joias] erro ao buscar produto:", error);
          return null;
    }
    return data;
}

function getCategorySlug(product) {
    if (product.categories && product.categories.slug) return product.categories.slug;
    return product.category_id;
}

function productCardHTML(product) {
    const img = product.image_url || "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800";
    const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
    const tagHtml = hasDiscount ? '<span class="product-tag">Oferta</span>' : "";
    const oldPriceHtml = hasDiscount ? '<span class="price-old">' + formatPrice(product.compare_at_price) + '</span>' : "";
    return (
          '<a class="product-card" href="produto.html?id=' + product.id + '">' +
          '<div class="product-media">' + tagHtml +
          '<img src="' + img + '" alt="' + product.name + '" loading="lazy"></div>' +
          '<div class="product-info">' +
          '<div class="material">' + (product.material || "") + '</div>' +
          '<h3>' + product.name + '</h3>' +
          '<div class="price-row"><span class="price-now">' + formatPrice(product.price) + '</span>' + oldPriceHtml + '</div>' +
          '</div></a>'
        );
}

window.EllureData = {
    fetchCategories: fetchCategories,
    fetchProducts: fetchProducts,
    fetchProductById: fetchProductById,
    getCategorySlug: getCategorySlug,
    formatPrice: formatPrice,
    productCardHTML: productCardHTML,
};
