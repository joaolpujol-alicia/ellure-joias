/* ==============================================================
   Inicializa a conexao com o Supabase usando as chaves definidas
   em config.js. Esse arquivo carrega ANTES dos outros scripts.
   ============================================================== */
let supabaseClient = null;

(function initSupabase() {
    const url = ELLURE_CONFIG.SUPABASE_URL;
    const key = ELLURE_CONFIG.SUPABASE_ANON_KEY;

   const isConfigured =
         url && key &&
         !url.includes("COLE_AQUI") && !key.includes("COLE_AQUI");

   if (isConfigured && window.supabase) {
         supabaseClient = window.supabase.createClient(url, key);
   } else {
         console.warn(
                 "[Ellure Joias] Supabase ainda nao configurado - usando produtos de exemplo locais."
               );
   }
})();
