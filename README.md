# Ellure Joias — Site

Site completo da loja, publicado no GitHub Pages e conectado a um banco de
dados no Supabase. Estrutura: catalogo por categoria, pagina de produto,
sacola de compras e finalizacao de pedido direto no WhatsApp.

Nao depende de nenhum servidor proprio: e um site estatico (HTML/CSS/JS) que
fala diretamente com o Supabase pelo navegador do cliente.

## Status

- Banco de dados no Supabase: pronto e configurado.
- Site publicado no GitHub: pronto.
- GitHub Pages: ativar em Settings > Pages para gerar o link publico.

## Estrutura de arquivos

ellure-joias/
index.html          -> Pagina inicial
produtos.html        -> Catalogo com filtro por categoria
produto.html          -> Pagina de detalhe de um produto (?id=...)
sacola.html            -> Carrinho / sacola + finalizar no WhatsApp
sobre.html               -> Sobre, contato e perguntas frequentes
config.js                  -> unico arquivo que voces precisam editar
css/style.css
js/supabase-client.js, products.js, cart.js, main.js
assets/logo.png
supabase/schema.sql   -> script que ja foi executado no Supabase

## Contatos configurados

- WhatsApp de vendas: (11) 96956-0141
- WhatsApp de suporte: (11) 98459-4249
- Instagram: @ellure_joias

Se algum desses dados mudar no futuro, e so editar o arquivo config.js.

## Sobre integrar o Instagram de verdade (sincronizacao automatica)

O site ja linka diretamente para o perfil de voces em varios pontos. Para
os posts do feed aparecerem automaticamente dentro do site, o caminho
oficial e a Instagram Graph API da Meta, que exige conta comercial vinculada
a uma Pagina do Facebook e um app aprovado pela Meta. Isso so pode ser feito
por quem e dono da conta.

## Proximos passos possiveis

- Pagamento online integrado (Pix automatico / cartao)
- Cupons de desconto e frete calculado automaticamente
- Painel proprio de pedidos (hoje os pedidos ficam salvos na tabela orders
  do Supabase e tambem chegam prontos no WhatsApp)
