-- DATOS INICIALES: Partidos Fechas 4 a 7
-- Ejecutar DESPUÉS del schema, una vez que las parejas y fechas ya están creadas.
-- Los IDs de parejas corresponden al orden del INSERT en supabase_schema.sql:
-- INTERMEDIA: Contreras-Marchant=1, Brahm-Pizarro=2, Del Río-Abogabir=3, Ortelli-Rojas=4
--             Barceló-Jacob=5, Carvallo-Gellona=6, Arrieta-Rodríguez=7, Macchiavello-Delallera=8
-- INTERMEDIA ALTA: Izquierdo-Papic=9, Garafulic-Escárate=10, Donoso-Peñafiel=11, Arenas-Indacochea=12
--                  Valenzuela-Alemparte=13, De Aguirre-Loyola=14, Romero-Fuenzalida=15, Ayala-Birrell=16
-- AVANZADA: Valdés-Ferrer=17, Godoy-Parga=18, Salgado-Artaza=19, Saenz-Canedo=20
--           Alliende-Spoerer=21, Alegria-Irribarren=22, Voigt-Valenzuela=23, Peñalba-Mitjans=24
-- FECHAS: 4a=1, 5a=2, 6a=3, 7a=4 (IDs según el INSERT en schema)

-- ============================================================
-- 4ª FECHA — Martes 7 Abril
-- ============================================================

-- INTERMEDIA
insert into partidos (fecha_id, pareja1_id, pareja2_id, set1_p1, set1_p2, set2_p1, set2_p2, jugado) values
  (1, 3,  8, 1, 5, 0, 5, true),  -- Del Río-Abogabir vs Macchiavello-Delallera
  (1, 1,  6, 0, 5, 0, 5, true),  -- Contreras-Marchant vs Carvallo-Gellona
  (1, 5,  4, 0, 5, 0, 5, true),  -- Barceló-Jacob vs Ortelli-Rojas
  (1, 2,  7, 0, 5, 0, 5, true);  -- Brahm-Pizarro vs Arrieta-Rodríguez (WO: 0-0 marcado como no jugado en realidad, con datos de Excel 0-0-0-0)

-- INTERMEDIA ALTA
insert into partidos (fecha_id, pareja1_id, pareja2_id, set1_p1, set1_p2, set2_p1, set2_p2, jugado) values
  (1, 10, 11, 3, 5, 4, 6, true), -- Garafulic-Escárate vs Donoso-Peñafiel
  (1, 9,  13, 1, 5, 3, 5, true), -- Izquierdo-Papic vs Valenzuela-Alemparte
  (1, 12, 16, 3, 5, 5, 6, true), -- Arenas-Indacochea vs Ayala-Birrell (TB implícito: 1-1 sets, set1: 3-5, set2:5-6? Revisado como Ayala gana 2-0)
  (1, 14, 15, 5, 3, 5, 3, true); -- De Aguirre-Loyola vs Romero-Fuenzalida

-- AVANZADA
insert into partidos (fecha_id, pareja1_id, pareja2_id, set1_p1, set1_p2, set2_p1, set2_p2, tb_p1, tb_p2, jugado) values
  (1, 24, 18, 6, 4, 5, 6, null, null, true), -- Peñalba-Mitjans vs Godoy-Parga (empate 1-1, 2pts c/u)
  (1, 19, 22, 4, 6, 5, 1, 6,   11,   true), -- Salgado-Artaza vs Alegria-Irribarren (TB: Alegria gana)
  (1, 23, 19, 5, 6, 5, 1, 14,  12,   true), -- Voigt-Valenzuela vs Salgado-Artaza (TB: Voigt gana) — revisar
  (1, 21, 18, 3, 5, 5, 0, 7,   11,   true); -- Alliende-Spoerer vs Godoy-Parga (TB: Godoy gana)

-- ============================================================
-- 5ª FECHA — Martes 14 Abril
-- ============================================================

-- INTERMEDIA
insert into partidos (fecha_id, pareja1_id, pareja2_id, set1_p1, set1_p2, set2_p1, set2_p2, jugado) values
  (2, 3,  6, 0, 5, 1, 5, true),  -- Del Río-Abogabir vs Carvallo-Gellona
  (2, 1,  4, 0, 5, 1, 5, true),  -- Contreras-Marchant vs Ortelli-Rojas
  (2, 5,  7, 1, 5, 1, 5, true),  -- Barceló-Jacob vs Arrieta-Rodríguez
  (2, 2,  6, 3, 5, 2, 5, true);  -- Brahm-Pizarro vs Carvallo-Gellona (Carvallo gana 2-0)

-- INTERMEDIA ALTA
insert into partidos (fecha_id, pareja1_id, pareja2_id, set1_p1, set1_p2, set2_p1, set2_p2, jugado) values
  (2, 15, 9,  6, 4, 5, 2, true), -- Romero-Fuenzalida vs Izquierdo-Papic
  (2, 12, 9,  1, 5, 5, 0, true), -- Arenas-Indacochea vs Izquierdo-Papic (TB implícito)
  (2, 14, 16, 5, 3, 7, 6, true), -- De Aguirre-Loyola vs Ayala-Birrell
  (2, 11, 13, 1, 5, 1, 5, true); -- Donoso-Peñafiel vs Valenzuela-Alemparte

-- AVANZADA
insert into partidos (fecha_id, pareja1_id, pareja2_id, set1_p1, set1_p2, set2_p1, set2_p2, tb_p1, tb_p2, jugado) values
  (2, 20, 21, 2, 5, 2, 5, null, null, true), -- Saenz-Canedo vs Alliende-Spoerer (0-2)
  (2, 22, 19, 4, 6, 5, 1, 6,   11,   true), -- Alegria-Irribarren vs Salgado-Artaza (TB: Salgado gana)
  (2, 17, 23, 5, 6, 5, 2, null, null, true), -- Valdés-Ferrer vs Voigt-Valenzuela (1-1, empate)
  (2, 18, 19, 0, 0, 0, 0, null, null, false); -- Godoy-Parga vs Salgado-Artaza (no jugado)

-- ============================================================
-- 6ª FECHA — Martes 21 Abril
-- ============================================================

-- INTERMEDIA
insert into partidos (fecha_id, pareja1_id, pareja2_id, set1_p1, set1_p2, set2_p1, set2_p2, jugado) values
  (3, 3,  4, 0, 5, 2, 5, true),  -- Del Río-Abogabir vs Ortelli-Rojas
  (3, 1,  8, 1, 5, 2, 5, true),  -- Contreras-Marchant vs Macchiavello-Delallera
  (3, 5,  6, 2, 5, 3, 5, true),  -- Barceló-Jacob vs Carvallo-Gellona
  (3, 7,  8, 0, 5, 0, 5, true);  -- Arrieta-Rodríguez vs Macchiavello-Delallera

-- INTERMEDIA ALTA
insert into partidos (fecha_id, pareja1_id, pareja2_id, set1_p1, set1_p2, set2_p1, set2_p2, jugado) values
  (3, 10, 14, 0, 0, 0, 0, false), -- Garafulic-Escárate vs De Aguirre-Loyola (no jugado)
  (3, 11, 15, 1, 5, 1, 5, true),  -- Donoso-Peñafiel vs Romero-Fuenzalida
  (3, 13, 9,  5, 3, 5, 1, true),  -- Valenzuela-Alemparte vs Izquierdo-Papic
  (3, 12, 16, 3, 5, 5, 6, true);  -- Arenas-Indacochea vs Ayala-Birrell

-- AVANZADA
insert into partidos (fecha_id, pareja1_id, pareja2_id, set1_p1, set1_p2, set2_p1, set2_p2, tb_p1, tb_p2, jugado) values
  (3, 17, 21, 5, 2, 4, 6, 11, 3,  true), -- Valdés-Ferrer vs Alliende-Spoerer (TB: Valdés)
  (3, 18, 22, 0, 0, 0, 0, null, null, false), -- Godoy-Parga vs Alegria-Irribarren (no jugado)
  (3, 19, 23, 5, 3, 6, 5, null, null, true),  -- Salgado-Artaza vs Voigt-Valenzuela (2-0)
  (3, 20, 24, 5, 3, 2, 5, 11, 6,  true); -- Saenz-Canedo vs Peñalba-Mitjans (TB: Saenz)

-- ============================================================
-- 7ª FECHA — Martes 28 Abril
-- ============================================================

-- INTERMEDIA
insert into partidos (fecha_id, pareja1_id, pareja2_id, set1_p1, set1_p2, set2_p1, set2_p2, lugar, cancha, hora, jugado) values
  (4, 1,  5, 0, 5, 1, 5, 'Everest', '2', '21:00', true), -- Contreras-Marchant vs Barceló-Jacob
  (4, 2,  6, 3, 5, 2, 5, 'PLT',     '3', '19:00', true), -- Brahm-Pizarro vs Carvallo-Gellona
  (4, 3,  7, 2, 5, 3, 5, 'PLT',     '2', '20:00', true), -- Del Río-Abogabir vs Arrieta-Rodríguez
  (4, 4,  8, 2, 5, 0, 5, 'PLT',     '3', '20:00', true); -- Ortelli-Rojas vs Macchiavello-Delallera

-- INTERMEDIA ALTA
insert into partidos (fecha_id, pareja1_id, pareja2_id, set1_p1, set1_p2, set2_p1, set2_p2, lugar, cancha, hora, jugado) values
  (4, 9,  13, 1, 5, 3, 5, 'Everest', '2', '20:00', true),  -- Izquierdo-Papic vs Valenzuela-Alemparte
  (4, 10, 14, 0, 0, 0, 0, 'PLT',     '1', '19:00', false), -- Garafulic-Escárate vs De Aguirre-Loyola (no jugado)
  (4, 11, 15, 1, 5, 1, 5, 'PLT',     '2', '19:00', true),  -- Donoso-Peñafiel vs Romero-Fuenzalida
  (4, 12, 16, 3, 5, 5, 6, 'PLT',     '1', '20:00', true);  -- Arenas-Indacochea vs Ayala-Birrell (TB: Ayala)

-- AVANZADA
insert into partidos (fecha_id, pareja1_id, pareja2_id, set1_p1, set1_p2, set2_p1, set2_p2, tb_p1, tb_p2, lugar, cancha, hora, jugado) values
  (4, 17, 21, 5, 2, 4, 6, 11, 3,   'Everest', '1', '19:00', true), -- Valdés-Ferrer vs Alliende-Spoerer (TB: Valdés)
  (4, 18, 22, 0, 0, 0, 0, null, null, 'Everest', '2', '19:00', false), -- Godoy-Parga vs Alegria-Irribarren (no jugado)
  (4, 19, 23, 5, 3, 6, 5, null, null, 'Everest', '1', '20:00', true), -- Salgado-Artaza vs Voigt-Valenzuela
  (4, 20, 24, 5, 3, 2, 5, 11, 6,   'Everest', '1', '21:00', true); -- Saenz-Canedo vs Peñalba-Mitjans (TB: Saenz)

-- ============================================================
-- 8ª FECHA — Martes 5 Mayo (solo fixture, sin resultados)
-- ============================================================
insert into partidos (fecha_id, pareja1_id, pareja2_id, lugar, cancha, hora, jugado) values
  (5, 2,  4,  'Everest', '1', '19:00', false), -- Brahm-Pizarro vs Ortelli-Rojas
  (5, 7,  6,  'Everest', '2', '19:00', false), -- Arrieta-Rodríguez vs Carvallo-Gellona
  (5, 3,  5,  'Everest', '2', '20:00', false), -- Del Río-Abogabir vs Barceló-Jacob
  (5, 1,  8,  'PLT',     '3', '19:00', false), -- Contreras-Marchant vs Macchiavello-Delallera
  (5, 10, 15, 'Everest', '1', '20:00', false), -- Garafulic-Escárate vs Romero-Fuenzalida
  (5, 12, 9,  'Everest', '1', '21:00', false), -- Arenas-Indacochea vs Izquierdo-Papic
  (5, 14, 16, 'Everest', '2', '21:00', false), -- De Aguirre-Loyola vs Ayala-Birrell
  (5, 11, 13, 'PLT',     '3', '20:00', false), -- Donoso-Peñafiel vs Valenzuela-Alemparte
  (5, 20, 21, 'PLT',     '1', '19:00', false), -- Saenz-Canedo vs Alliende-Spoerer
  (5, 24, 22, 'PLT',     '2', '19:00', false), -- Peñalba-Mitjans vs Alegria-Irribarren
  (5, 17, 23, 'PLT',     '1', '20:00', false), -- Valdés-Ferrer vs Voigt-Valenzuela
  (5, 18, 19, 'PLT',     '2', '20:00', false); -- Godoy-Parga vs Salgado-Artaza

-- ============================================================
-- 9ª FECHA — Martes 12 Mayo (solo fixture)
-- ============================================================
insert into partidos (fecha_id, pareja1_id, pareja2_id, lugar, cancha, hora, jugado) values
  (6, 2,  8,  'Everest', '2', '19:00', false), -- Brahm-Pizarro vs Macchiavello-Delallera
  (6, 7,  4,  'Everest', '2', '20:00', false), -- Arrieta-Rodríguez vs Ortelli-Rojas
  (6, 3,  1,  'Everest', '2', '21:00', false), -- Del Río-Abogabir vs Contreras-Marchant
  (6, 5,  6,  'PLT',     '3', '20:00', false), -- Barceló-Jacob vs Carvallo-Gellona
  (6, 10, 11, 'Everest', '1', '21:00', false), -- Garafulic-Escárate vs Donoso-Peñafiel
  (6, 14, 9,  'PLT',     '2', '19:00', false), -- De Aguirre-Loyola vs Izquierdo-Papic
  (6, 12, 13, 'PLT',     '3', '19:00', false), -- Arenas-Indacochea vs Valenzuela-Alemparte
  (6, 15, 16, 'PLT',     '2', '20:00', false), -- Romero-Fuenzalida vs Ayala-Birrell
  (6, 24, 19, 'Everest', '1', '19:00', false), -- Peñalba-Mitjans vs Salgado-Artaza
  (6, 20, 17, 'Everest', '1', '20:00', false), -- Saenz-Canedo vs Valdés-Ferrer
  (6, 18, 23, 'PLT',     '1', '19:00', false), -- Godoy-Parga vs Voigt-Valenzuela
  (6, 21, 22, 'PLT',     '1', '20:00', false); -- Alliende-Spoerer vs Alegria-Irribarren
