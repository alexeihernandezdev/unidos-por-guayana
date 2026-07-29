# Webhook de WhatsApp

Esta etapa conecta la aplicación con el canal por el que Meta informa que
ocurrió algo en WhatsApp. Primero permite que Meta compruebe que la dirección
pertenece al proyecto y, después, acepta únicamente avisos auténticos.

Para la demostración el webhook será intencionalmente mínimo: no guardará
mensajes, teléfonos ni estados de lectura. Su función es dejar preparada una
conexión segura sin añadir todavía procesos que el producto no necesita.

También se configurará en Meta una plantilla de autenticación para el inicio de
sesión. El mensaje utilizará el texto base controlado por WhatsApp, un botón para
copiar el código y una vigencia de 10 minutos. La generación y validación del
código dentro de la aplicación se realizará en una etapa posterior.

