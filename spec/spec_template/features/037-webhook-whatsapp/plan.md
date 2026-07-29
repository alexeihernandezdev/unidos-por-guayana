# Plan · 037 Webhook mínimo de WhatsApp

1. Crear utilidades de servidor para validar el challenge y la firma HMAC sin
   parsear el cuerpo antes de verificarlo.
2. Crear el Route Handler `src/app/api/webhooks/whatsapp/route.ts`.
3. Añadir las variables del webhook y de `login_otp` a `.env.example`.
4. Cubrir challenge, firma, configuración ausente y endpoint con Vitest.
5. Validar con pruebas, lint y build.
6. Configurar en Meta la Callback URL, el verify token y la suscripción
   `messages` después del despliegue.

## Diseño técnico

La utilidad vive en `src/shared/lib/whatsapp-webhook.ts`, una zona transversal
permitida para la presentación. Usa `node:crypto`, exige el prefijo
`sha256=` y compara buffers de igual longitud con `timingSafeEqual`.

El Route Handler utiliza las Web APIs nativas descritas por Next.js 16.2.10:
`new URL(request.url)`, `request.text()` y `new Response()`. Se declara
`runtime = "nodejs"` porque la validación depende de `node:crypto`.

El POST no interpreta JSON ni escribe logs con el payload. El objetivo es
reconocer con rapidez la entrega auténtica y responder 200.

