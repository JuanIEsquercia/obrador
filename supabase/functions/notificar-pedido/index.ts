// Edge Function de Supabase: se dispara cuando un pedido se publica
// Notifica por email a todos los vendedores que tienen familias en común

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://obrador.ar'

serve(async (req) => {
  try {
    const payload = await req.json()

    // Solo procesar cuando el estado cambia a "publicado"
    const { type, table, record, old_record } = payload

    if (
      table !== 'pedidos' ||
      type !== 'UPDATE' ||
      record.estado !== 'publicado' ||
      old_record?.estado === 'publicado'
    ) {
      return new Response(JSON.stringify({ ok: true, mensaje: 'No aplica' }), { status: 200 })
    }

    const pedido = record

    // Cliente con service role para acceso total
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Familias del pedido
    const { data: familiasPedido } = await supabase
      .from('lineas_pedido')
      .select('familia_id')
      .eq('pedido_id', pedido.id)

    if (!familiasPedido || familiasPedido.length === 0) {
      return new Response(JSON.stringify({ ok: true, mensaje: 'Pedido sin ítems' }), { status: 200 })
    }

    const familiaIds = [...new Set(familiasPedido.map(f => f.familia_id))]

    // Vendedores que comercializan al menos una de esas familias
    const { data: vendedoresMatch } = await supabase
      .from('vendedor_familias')
      .select('vendedor_id')
      .in('familia_id', familiaIds)

    if (!vendedoresMatch || vendedoresMatch.length === 0) {
      return new Response(JSON.stringify({ ok: true, mensaje: 'Sin vendedores que notificar' }), { status: 200 })
    }

    const vendedorIds = [...new Set(vendedoresMatch.map(v => v.vendedor_id))]

    // Obtener email + nombre de cada vendedor desde auth.users
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const vendedoresANotificar = users.filter(u => vendedorIds.includes(u.id))

    // Obtener info del comprador
    const { data: comprador } = await supabase
      .from('perfiles')
      .select('empresa')
      .eq('id', pedido.comprador_id)
      .single()

    // Obtener líneas del pedido para el email
    const { data: lineas } = await supabase
      .from('lineas_pedido')
      .select('descripcion, cantidad, unidad, familia:familias_producto(nombre)')
      .eq('pedido_id', pedido.id)
      .order('orden')

    // Construir el HTML del email
    const itemsHTML = lineas?.map(l => `
      <tr>
        <td style="padding: 6px 12px; border-bottom: 1px solid #f3f4f6; font-size: 14px;">
          ${l.descripcion}
        </td>
        <td style="padding: 6px 12px; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #6b7280;">
          ${l.cantidad} ${l.unidad}
        </td>
        <td style="padding: 6px 12px; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #6b7280;">
          ${(l.familia as { nombre: string })?.nombre ?? ''}
        </td>
      </tr>
    `).join('') ?? ''

    // Enviar email a cada vendedor
    const resultados = await Promise.allSettled(
      vendedoresANotificar.map(async (vendedor) => {
        const nombre = vendedor.user_metadata?.nombre ?? vendedor.email?.split('@')[0] ?? 'Proveedor'
        const linkPedido = `${SITE_URL}/vendedor/pedidos/${pedido.id}`

        const emailHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px 16px;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #ea580c; font-size: 28px; font-weight: 800; margin: 0;">Obrador</h1>
      <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0;">Materiales de construcción, sin vueltas</p>
    </div>

    <!-- Card principal -->
    <div style="background: white; border-radius: 12px; border: 1px solid #e5e7eb; padding: 32px; margin-bottom: 16px;">
      <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0 0 8px;">
        Nuevo pedido disponible para cotizar
      </h2>
      <p style="color: #6b7280; font-size: 15px; margin: 0 0 24px;">
        Hola <strong>${nombre}</strong>, hay un pedido nuevo que coincide con tus materiales.
      </p>

      <!-- Datos del pedido -->
      <div style="background: #fff7ed; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0 0 6px; font-size: 16px; font-weight: 600; color: #111827;">
          ${pedido.titulo}
        </p>
        <p style="margin: 0 0 4px; font-size: 14px; color: #6b7280;">
          🏢 Comprador: <strong>${comprador?.empresa ?? 'N/D'}</strong>
        </p>
        <p style="margin: 0 0 4px; font-size: 14px; color: #6b7280;">
          📍 Entrega: ${pedido.direccion_entrega}
        </p>
        <p style="margin: 0; font-size: 14px; color: #6b7280;">
          📅 Fecha límite de entrega: <strong>${new Date(pedido.fecha_entrega).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
        </p>
      </div>

      <!-- Ítems -->
      <h3 style="font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 12px;">
        Materiales solicitados:
      </h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="background: #f9fafb;">
            <th style="text-align: left; padding: 8px 12px; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Ítem</th>
            <th style="text-align: left; padding: 8px 12px; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Cantidad</th>
            <th style="text-align: left; padding: 8px 12px; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Familia</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <!-- CTA -->
      <div style="text-align: center;">
        <a
          href="${linkPedido}"
          style="display: inline-block; background-color: #ea580c; color: white; text-decoration: none; font-size: 15px; font-weight: 600; padding: 12px 32px; border-radius: 8px;"
        >
          Ver pedido y cotizar →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0 0 4px;">Recibís este mail porque estás registrado como proveedor en Obrador.</p>
      <p style="margin: 0;">Corrientes, Argentina</p>
    </div>

  </div>
</body>
</html>`

        const respResend = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Obrador <notificaciones@obrador.ar>',
            to: vendedor.email!,
            subject: `Nuevo pedido: ${pedido.titulo}`,
            html: emailHTML,
          }),
        })

        if (!respResend.ok) {
          const errBody = await respResend.text()
          throw new Error(`Error Resend para ${vendedor.email}: ${errBody}`)
        }

        return { email: vendedor.email, ok: true }
      })
    )

    const exitosos = resultados.filter(r => r.status === 'fulfilled').length
    const fallidos = resultados.filter(r => r.status === 'rejected').length

    console.log(`Notificaciones: ${exitosos} enviadas, ${fallidos} fallidas`)

    return new Response(
      JSON.stringify({ ok: true, exitosos, fallidos }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Error en notificar-pedido:', err)
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
