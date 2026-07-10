# Unidos por la Guaira — Resumen del proyecto

_Documento de presentación para el cliente. Explica en lenguaje llano qué se va a construir, para quién y por qué. El detalle técnico vive en la carpeta `spec/`._

---

## 1. El problema

Tras el terremoto ocurrido el **24/06/2026** en la región central del país (Caracas, Vargas, Aragua, entre otros), La Guaira se ha organizado para enviar ayuda humanitaria. Pero esa ayuda enfrenta un problema **logístico y de coordinación**:

- No hay una forma clara de saber **qué se necesita**, **cuánto se ha reunido** y **cuánto falta** para poder enviar.
- Los colaboradores quieren ayudar, pero **no siempre saben qué aportar ni a dónde**.
- Falta **transparencia**: quien dona no ve el destino de su aporte, y eso resta confianza.
- Las decisiones sobre **qué envío sale primero** se toman de forma manual y dispersa.

## 2. La solución

**Unidos por la Guaira** es una aplicación web que **organiza, da transparencia y facilita la recolección** de ayuda humanitaria que sale desde La Guaira. Coordina tres tipos de recursos:

- **Suministros** (agua, medicinas, alimentos…).
- **Transporte** (camiones para los envíos).
- **Personal** (voluntarios dispuestos a colaborar).

La pieza central es el **Envío de ayuda**: un despacho con una fecha, un destino y unas **metas de recursos** por cumplir. Los colaboradores aportan hasta completar esas metas, y todo el proceso queda visible y registrado.

## 3. Para quién

| Rol                     | Qué hace en la plataforma                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| **Administrador**       | Gestiona los envíos, define las metas de recursos y decide cuándo sale el próximo y con qué.  |
| **Colaborador**         | Aporta ayuda (suministros, transporte o personal) a un envío para ayudar a cumplir sus metas. |
| **Solicitante**         | Pide ayuda para un sector específico, indicando qué se necesita y con qué urgencia.           |

## 4. Qué se va a construir

La plataforma se compone de estos módulos:

### Cara al público y acceso

- **Página de bienvenida** que presenta el proyecto e invita a colaborar o solicitar ayuda.
- **Registro e inicio de sesión** que identifica a cada tipo de usuario y habilita lo que le corresponde.

### Corazón del sistema

- **Envíos de ayuda** con sus metas de recursos, fecha y sector destino.
- **Aportes** de los colaboradores, que suman a las metas de cada envío.
- **Solicitudes de ayuda** que canalizan lo que cada sector necesita.

### Gestión y confianza

- **Panel de administración** para ver el estado de cada envío, el progreso de las metas y decidir prioridades.
- **Tablero público de transparencia**: cualquiera, sin registrarse, puede ver qué se recolectó, cuánto falta y a dónde fue cada ayuda.
- **Seguimiento del envío** de principio a fin (recolectando → listo → en tránsito → entregado), con evidencia de entrega.

### Apoyo logístico

- **Puntos de acopio** donde entregar los suministros.
- **Catálogo de recursos** para medir las metas de forma clara.
- **Notificaciones** para avisar de nuevos envíos o metas cumplidas.
- **Verificación de usuarios** para dar confianza a quien aporta o solicita.

## 5. Nuestros compromisos (por qué confiar)

- **Transparencia** — Cualquiera puede ver qué se recolectó, cuánto falta y a dónde fue cada ayuda.
- **Trazabilidad** — Cada aporte y cada envío queda registrado y es auditable de origen a destino.
- **Simplicidad de uso** — Pensada para personas sin experiencia técnica, en momentos de crisis y con conexión limitada.
- **Priorizar la urgencia** — El sistema apoya la decisión de qué envío sale primero según la necesidad real.

## 6. Qué NO es (alcance)

Para evitar malentendidos, la plataforma **deliberadamente**:

- **No reemplaza a los organismos oficiales** — Es apoyo logístico comunitario; no sustituye a Protección Civil, bomberos ni entes del Estado.
- **No procesa pagos dentro de la app** — La ayuda monetaria es bienvenida, pero se canaliza por medios externos (transferencia, PayPal, Zelle…); la aplicación no cobra ni gestiona transacciones: solo muestra esos medios y registra, para transparencia, los montos ya recibidos.
- **No es de alcance nacional** — Se enfoca en la ayuda que sale desde La Guaira.

## 7. Plan de entrega por fases

La construcción es incremental: cada fase entrega valor utilizable antes de pasar a la siguiente.

| Fase                          | Incluye                                                        | Resultado para el cliente                                   |
| ----------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------- |
| **1 · Base**                  | Infraestructura, acceso por roles y página de bienvenida.     | La plataforma existe, es segura y presentable.              |
| **2 · Flujo central**         | Catálogo, envíos, aportes y solicitudes.                      | Ya se pueden crear envíos, recibir aportes y pedir ayuda.   |
| **3 · Gestión y transparencia** | Panel de administración, tablero público y seguimiento.       | El administrador decide con datos; el público ve todo.      |
| **4 · Apoyo**                 | Puntos de acopio, notificaciones y verificación de usuarios.  | La operación gana alcance, confianza y comunicación.        |

## 8. En una frase

> Una plataforma sencilla y transparente para que La Guaira **organice y demuestre** su ayuda humanitaria: se ve qué se necesita, quién aporta y a dónde llega cada envío.
