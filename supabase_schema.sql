-- LIGA DE PÁDEL EVEREST - Schema Supabase
-- Ejecutar este SQL en el editor de Supabase (SQL Editor)

create table grupos (
  id serial primary key,
  nombre text not null,
  orden int not null
);

insert into grupos (nombre, orden) values
  ('Intermedia', 1),
  ('Intermedia Alta', 2),
  ('Avanzada', 3);

create table parejas (
  id serial primary key,
  jugador1 text not null,
  jugador2 text not null,
  grupo text not null check (grupo in ('intermedia', 'intermedia_alta', 'avanzada'))
);

-- INTERMEDIA
insert into parejas (jugador1, jugador2, grupo) values
  ('Contreras', 'Marchant', 'intermedia'),
  ('Brahm', 'Pizarro', 'intermedia'),
  ('Del Río', 'Abogabir', 'intermedia'),
  ('Ortelli', 'Rojas', 'intermedia'),
  ('Barceló', 'Jacob', 'intermedia'),
  ('Carvallo', 'Gellona', 'intermedia'),
  ('Arrieta', 'Rodríguez', 'intermedia'),
  ('Macchiavello', 'Delallera', 'intermedia');

-- INTERMEDIA ALTA
insert into parejas (jugador1, jugador2, grupo) values
  ('Izquierdo', 'Papic', 'intermedia_alta'),
  ('Garafulic', 'Escárate', 'intermedia_alta'),
  ('Donoso', 'Peñafiel', 'intermedia_alta'),
  ('Arenas', 'Indacochea', 'intermedia_alta'),
  ('Valenzuela', 'Alemparte', 'intermedia_alta'),
  ('De Aguirre', 'Loyola', 'intermedia_alta'),
  ('Romero', 'Fuenzalida', 'intermedia_alta'),
  ('Ayala', 'Birrell', 'intermedia_alta');

-- AVANZADA
insert into parejas (jugador1, jugador2, grupo) values
  ('Valdés', 'Ferrer', 'avanzada'),
  ('Godoy', 'Parga', 'avanzada'),
  ('Salgado', 'Artaza', 'avanzada'),
  ('Saenz', 'Canedo', 'avanzada'),
  ('Alliende', 'Spoerer', 'avanzada'),
  ('Alegria', 'Irribarren', 'avanzada'),
  ('Voigt', 'Valenzuela', 'avanzada'),
  ('Peñalba', 'Mitjans', 'avanzada');

create table fechas (
  id serial primary key,
  numero int not null,
  fecha date not null,
  label text not null
);

insert into fechas (numero, fecha, label) values
  (4, '2026-04-07', '4ª Fecha'),
  (5, '2026-04-14', '5ª Fecha'),
  (6, '2026-04-21', '6ª Fecha'),
  (7, '2026-04-28', '7ª Fecha'),
  (8, '2026-05-05', '8ª Fecha'),
  (9, '2026-05-12', '9ª Fecha'),
  (10, '2026-05-19', '10ª Fecha'),
  (11, '2026-05-26', '11ª Fecha'),
  (12, '2026-06-02', '12ª Fecha'),
  (13, '2026-06-09', '13ª Fecha'),
  (14, '2026-06-16', '14ª Fecha');

create table partidos (
  id serial primary key,
  fecha_id int references fechas(id),
  pareja1_id int references parejas(id),
  pareja2_id int references parejas(id),
  set1_p1 int,
  set1_p2 int,
  set2_p1 int,
  set2_p2 int,
  tb_p1 int,
  tb_p2 int,
  lugar text,
  cancha text,
  hora text,
  jugado boolean default false
);

-- Habilitar Row Level Security (lectura pública, escritura con clave)
alter table parejas enable row level security;
alter table fechas enable row level security;
alter table partidos enable row level security;
alter table grupos enable row level security;

create policy "Lectura publica" on parejas for select using (true);
create policy "Lectura publica" on fechas for select using (true);
create policy "Lectura publica" on partidos for select using (true);
create policy "Lectura publica" on grupos for select using (true);

-- Escritura solo con service key (admin)
create policy "Admin insert" on partidos for insert with check (true);
create policy "Admin update" on partidos for update using (true);
