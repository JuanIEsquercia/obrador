# Obrador — Guía de instalación y puesta en marcha

## 1. Crear proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com) y creá un proyecto nuevo
2. Anotá la **Project URL** y las claves **anon** y **service_role**

## 2. Ejecutar el schema SQL

En el SQL Editor de Supabase, ejecutá estos archivos en orden:

```
supabase/schema.sql     → tablas, RLS, datos iniciales
supabase/triggers.sql   → triggers de notificación (opcional si usás Webhooks)
```

## 3. Configurar variables de entorno

Copiá `.env.example` a `.env.local` y completá los valores:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
RESEND_API_KEY=re_tu_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 4. Instalar dependencias y levantar

```bash
cd obrador
npm install
npm run dev
```

## 5. Deploy de Edge Functions a Supabase

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Linkear al proyecto
supabase link --project-ref TU_PROJECT_REF

# Setear secrets de las funciones
supabase secrets set RESEND_API_KEY=re_tu_api_key
supabase secrets set SITE_URL=https://tu-dominio.com

# Deploy de las funciones
supabase functions deploy notificar-pedido
supabase functions deploy notificar-ganador
```

## 6. Configurar notificaciones (recomendado: Database Webhooks)

En el dashboard de Supabase ir a **Database → Webhooks → Create a new hook**:

- **Nombre:** notificar_pedido_publicado
- **Tabla:** pedidos
- **Eventos:** UPDATE
- **URL:** `https://[tu-proyecto].supabase.co/functions/v1/notificar-pedido`
- **Headers:**
  - `Authorization: Bearer [anon_key]`
  - `Content-Type: application/json`

## 7. Configurar Resend

1. Registrate en [resend.com](https://resend.com)
2. Verificá tu dominio (o usá el sandbox para dev)
3. Copiá la API key a `.env.local`
4. Actualizá el `from` en las Edge Functions a tu dominio verificado

## 8. Deploy a Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Setear variables de entorno en Vercel Dashboard o:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add RESEND_API_KEY
vercel env add NEXT_PUBLIC_SITE_URL
```

## Estructura del proyecto

```
obrador/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/           → Página de login
│   │   │   ├── registro/        → Registro con selector de rol
│   │   │   └── onboarding/      → Selección de familias (vendedores)
│   │   └── (dashboard)/
│   │       ├── dashboard/       → Redirección inteligente por rol
│   │       ├── comprador/
│   │       │   └── pedidos/     → Lista + detalle + nuevo pedido
│   │       └── vendedor/
│   │           ├── pedidos/     → Pedidos disponibles + cotizar
│   │           └── cotizaciones/→ Historial de cotizaciones
│   ├── components/
│   │   ├── ui/                  → Navegación, componentes comunes
│   │   └── cotizaciones/        → Vista comparativa
│   ├── lib/
│   │   ├── supabase/            → Clientes SSR/browser/middleware
│   │   └── utils.ts             → Helpers de formato
│   └── types/                   → Tipos TypeScript centrales
├── supabase/
│   ├── schema.sql               → Schema completo con RLS
│   ├── triggers.sql             → Triggers de notificación
│   └── functions/
│       ├── notificar-pedido/    → Email a vendedores al publicar
│       └── notificar-ganador/   → Email al vendedor ganador
└── SETUP.md
```
