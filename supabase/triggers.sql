-- ============================================================
-- TRIGGERS y webhooks para invocar Edge Functions
-- Ejecutar en Supabase SQL Editor DESPUÉS del schema.sql
-- ============================================================

-- Activar la extensión pg_net para hacer HTTP requests desde triggers
-- (viene incluida en Supabase)
-- create extension if not exists pg_net;

-- ============================================================
-- TRIGGER: notificar vendedores cuando se publica un pedido
-- ============================================================

create or replace function notificar_pedido_publicado()
returns trigger
language plpgsql
security definer
as $$
declare
  v_url text;
  v_service_role_key text;
begin
  -- Solo actuar cuando el estado cambia a "publicado"
  if new.estado = 'publicado' and (old.estado is null or old.estado != 'publicado') then

    v_url := current_setting('app.supabase_functions_url', true);
    v_service_role_key := current_setting('app.service_role_key', true);

    -- Invocar Edge Function via HTTP
    perform net.http_post(
      url := v_url || '/notificar-pedido',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_role_key
      ),
      body := jsonb_build_object(
        'type', 'UPDATE',
        'table', 'pedidos',
        'record', row_to_json(new),
        'old_record', row_to_json(old)
      )
    );

  end if;
  return new;
end;
$$;

create trigger trg_notificar_pedido_publicado
  after update on pedidos
  for each row
  execute function notificar_pedido_publicado();

-- ============================================================
-- NOTA ALTERNATIVA: Supabase Database Webhooks (recomendado)
-- En el dashboard de Supabase ir a:
-- Database → Webhooks → Create a new hook
--
-- Tabla: pedidos
-- Eventos: UPDATE
-- URL: https://[tu-proyecto].supabase.co/functions/v1/notificar-pedido
-- HTTP Headers:
--   Authorization: Bearer [anon_key]
-- ============================================================
