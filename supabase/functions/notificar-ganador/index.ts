// Edge Function: notifica al vendedor ganador cuando el comprador lo elige
// Invocar desde el cliente tras llamar a seleccionar_cotizacion_ganadora()

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://obrador.ar'

serve(async (req) => {
  try {
    const { cotizacion_id } = await req.json()
    if (!cotizacion_id) throw new Error('Falta cotizacion_id')

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Traer cotización con pedido y vendedor
    const { data: cotizacion } = await supabase
      .from('cotizaciones')
      .select(`
        *,
        pedido:pedidos(titulo, direccion_entrega, fecha_entrega, comprador_id),
        vendedor:perfiles(nombre, empresa)
      `)
      .eq('id', cotizacion_id)
      .single()

    if (!cotizacion) throw new Error('Cotización no encontrada')

    const pedido = cotizacion.pedido as {
      titulo: string
      direccion_entrega: string
      fecha_entrega: string
      comprador_id: string
    }
    const vendedor = cotizacion.vendedor as { nombre: string; empresa: string }

    // Email del vendedor
    const { data: { user: vendedorUser } } = await supabase.auth.admin.getUserById(cotizacion.vendedor_id)
    if (!vendedorUser?.email) throw new Error('No se encontró email del vendedor')

    // Email del comprador
    const { data: { user: compradorUser } } = await supabase.auth.admin.getUserById(pedido.comprador_id)
    const { data: compradorPerfil } = await supabase
      .from('perfiles')
      .select('nombre, empresa, telefono')
      .eq('id', pedido.comprador_id)
      .single()

    const linkCotizacion = `${SITE_URL}/vendedor/cotizaciones`
    const fechaEntrega = new Date(pedido.fecha_entrega).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    const emailHTML = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px 16px;">

    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #ea580c; font-size: 28px; font-weight: 800; margin: 0;">Obrador</h1>
    </div>

    <div style="background: white; border-radius: 12px; border: 1px solid #e5e7eb; padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <p style="font-size: 48px; margin: 0;">🏆</p>
        <h2 style="color: #15803d; font-size: 22px; font-weight: 700; margin: 12px 0 0;">
          ¡Tu cotización fue seleccionada!
        </h2>
      </div>

      <p style="color: #374151; font-size: 15px; margin: 0 0 20px;">
        Hola <strong>${vendedor.nombre}</strong> de <strong>${vendedor.empresa}</strong>,<br>
        el comprador eligió tu cotización para el siguiente pedido:
      </p>

      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: #111827;">${pedido.titulo}</p>
        <p style="margin: 0 0 4px; font-size: 14px; color: #374151;">📍 ${pedido.direccion_entrega}</p>
        <p style="margin: 0; font-size: 14px; color: #374151;">📅 Fecha de entrega: <strong>${fechaEntrega}</strong></p>
      </div>

      <div style="background: #eff6ff; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h3 style="font-size: 14px; font-weight: 600; color: #1e40af; margin: 0 0 8px;">
          Datos del comprador para coordinar la entrega:
        </h3>
        <p style="margin: 0 0 4px; font-size: 14px; color: #374151;">
          🏢 ${compradorPerfil?.empresa ?? 'N/D'}
        </p>
        <p style="margin: 0 0 4px; font-size: 14px; color: #374151;">
          👤 ${compradorPerfil?.nombre ?? 'N/D'}
        </p>
        ${compradorPerfil?.telefono ? `<p style="margin: 0; font-size: 14px; color: #374151;">📱 ${compradorPerfil.telefono}</p>` : ''}
        ${compradorUser?.email ? `<p style="margin: 4px 0 0; font-size: 14px; color: #374151;">✉️ ${compradorUser.email}</p>` : ''}
      </div>

      <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px;">
        La coordinación de la entrega es directa con el comprador. Obrador solo los conectó.
      </p>

      <div style="text-align: center;">
        <a href="${linkCotizacion}" style="display: inline-block; background-color: #15803d; color: white; text-decoration: none; font-size: 15px; font-weight: 600; padding: 12px 32px; border-radius: 8px;">
          Ver mis cotizaciones
        </a>
      </div>
    </div>

    <div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">
      <p style="margin: 0;">Obrador — Corrientes, Argentina</p>
    </div>
  </div>
</body>
</html>`

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Obrador <notificaciones@obrador.ar>',
        to: vendedorUser.email,
        subject: `🏆 Tu cotización fue seleccionada: ${pedido.titulo}`,
        html: emailHTML,
      }),
    })

    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (err) {
    console.error('Error en notificar-ganador:', err)
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 })
  }
})
