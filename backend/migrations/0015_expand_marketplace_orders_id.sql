-- Onda 15: expandir campo id para varchar(128) para suportar orderIds customizados
ALTER TABLE marketplace_orders ALTER COLUMN id TYPE varchar(128);
ALTER TABLE marketplace_orders ALTER COLUMN external_reference TYPE varchar(128);
ALTER TABLE marketplace_order_items ALTER COLUMN order_id TYPE varchar(128);
ALTER TABLE marketplace_user_library ALTER COLUMN source_order_id TYPE varchar(128);
