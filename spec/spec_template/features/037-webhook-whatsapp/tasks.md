# Tareas · 037 Webhook mínimo de WhatsApp

- [x] Aprobar el diseño.
- [x] Consultar la documentación local de Route Handlers de Next.js 16.2.10.
- [x] Implementar validación del challenge.
- [x] Implementar validación HMAC-SHA256 en tiempo constante.
- [x] Implementar `GET /api/webhooks/whatsapp`.
- [x] Implementar `POST /api/webhooks/whatsapp`.
- [x] Documentar variables de entorno.
- [x] Añadir pruebas unitarias y del Route Handler.
- [x] Ejecutar las pruebas específicas: 17 en verde.
- [x] Ejecutar `pnpm lint`: sin errores; una advertencia preexistente.
- [x] Ejecutar `pnpm build`: compilación en verde.
- [ ] Corregir las 13 pruebas globales preexistentes de solicitudes que no
      proporcionan la ubicación ahora obligatoria.
- [ ] Configurar Callback URL y suscripción `messages` en Meta.
