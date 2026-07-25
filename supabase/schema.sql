-- ============================================================
-- ELLURE JOIAS — Schema do Supabase
-- ============================================================
-- Como usar:
-- 1. Crie um projeto em https://supabase.com (gratuito)
-- 2. No painel, vá em "SQL Editor" > "New query"
-- 3. Cole todo este arquivo e clique em "Run"
-- 4. Pronto: as tabelas, as regras de segurança e os produtos
--    de exemplo já estarão criados.
-- ============================================================

-- Extensão para gerar IDs únicos
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- Tabela de categorias
-- ------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  sort_order int default 0
);

-- ------------------------------------------------------------
-- Tabela de produtos
-- ------------------------------------------------------------
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  compare_at_price numeric(10,2), -- preço "de/por" (opcional)
  category_id uuid references categories(id),
  image_url text,
  images text[], -- galeria de imagens extras (opcional)
  material text, -- ex: "Banhado a ouro 18k", "Prata 925"
  stock int default 1,
  is_active boolean default true,
  is_featured boolean default false,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- Tabela de pedidos (registrados quando o cliente finaliza
-- a sacola e é levado ao WhatsApp — fica um histórico salvo)
-- ------------------------------------------------------------
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  customer_name text,
  customer_phone text,
  items jsonb not null,       -- [{product_id, name, price, qty}]
  total numeric(10,2) not null,
  status text default 'novo', -- novo | atendido | concluido | cancelado
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- Segurança (RLS) — o site usa a chave pública (anon key),
-- então as regras abaixo controlam exatamente o que essa
-- chave pode fazer.
-- ------------------------------------------------------------
alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;

-- Qualquer visitante pode LER categorias e produtos ativos
create policy "categorias visiveis para todos"
  on categories for select
  using (true);

create policy "produtos ativos visiveis para todos"
  on products for select
  using (is_active = true);

-- Qualquer visitante pode CRIAR um pedido (ninguém pode ler,
-- alterar ou apagar pedidos pela chave pública — isso só é
-- feito por vocês, logados no painel do Supabase)
create policy "visitante pode criar pedido"
  on orders for insert
  with check (true);

-- ------------------------------------------------------------
-- Categorias iniciais
-- ------------------------------------------------------------
insert into categories (name, slug, sort_order) values
  ('Anéis', 'aneis', 1),
  ('Colares', 'colares', 2),
  ('Brincos', 'brincos', 3),
  ('Pulseiras', 'pulseiras', 4)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- Produtos de exemplo (substituam por fotos e preços reais
-- direto pelo painel do Supabase, em "Table Editor" > products)
-- ------------------------------------------------------------
insert into products (name, description, price, compare_at_price, category_id, image_url, material, is_featured)
select
  p.name, p.description, p.price, p.compare_at_price,
  (select id from categories where slug = p.cat_slug),
  p.image_url, p.material, p.is_featured
from (values
  ('Anel Solitário Cristal', 'Anel fino banhado a ouro com cristal central, acabamento delicado.', 89.90, 119.90, 'aneis', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800', 'Banhado a ouro 18k', true),
  ('Anel Duo Argolas', 'Composição de duas argolas finas sobrepostas, uso diário.', 69.90, null, 'aneis', 'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=800', 'Banhado a ouro 18k', false),
  ('Colar Ponto de Luz', 'Colar delicado com pingente de zircônia, corrente fina ajustável.', 99.90, 129.90, 'colares', 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800', 'Banhado a ouro 18k', true),
  ('Colar Gargantilha Veneziana', 'Gargantilha em malha veneziana, fecho reforçado.', 84.90, null, 'colares', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800', 'Prata 925', false),
  ('Brinco Argola Texturizada', 'Argola média com textura martelada artesanal.', 59.90, null, 'brincos', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800', 'Banhado a ouro 18k', true),
  ('Brinco Ponto de Luz Zircônia', 'Brinco pequeno para uso diário, tamanho único.', 49.90, 69.90, 'brincos', 'https://images.unsplash.com/photo-1589207212797-cfd0870c0a3f?w=800', 'Prata 925', false),
  ('Pulseira Riviera Cristais', 'Pulseira com cristais cravejados, fecho lagosta.', 94.90, null, 'pulseiras', 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=800', 'Banhado a ouro 18k', true),
  ('Pulseira Berloques Coração', 'Pulseira delicada com berloque em formato de coração.', 74.90, 99.90, 'pulseiras', 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800', 'Banhado a ouro 18k', false)
) as p(name, description, price, compare_at_price, cat_slug, image_url, material, is_featured)
where not exists (select 1 from products where products.name = p.name);
