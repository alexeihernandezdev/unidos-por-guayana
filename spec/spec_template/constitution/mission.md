# Misión

Este proyecto llamado "Unidos por Guayana" es una forma de ayudar en el problema logístico que surge en las ayudas humanitarias provenientes de la región Guayana. Actualmente motivado por el terremoto ocurrido en la región central del país (Caracas, Vargas, Aragua, etc.) el 24/06/2026.

## Qué construimos

Aplicación enfocada a: organizar, brindar transparencia y recolectar ayuda del tipo suministros, personal dispuesto a colaborar, camiones para realizar los envíos, entre otro tipo de ayuda necesaria.

1. **Página de bienvenida (landing)** — Presenta el proyecto, qué busca y cuál es el objetivo; invita a colaborar o solicitar ayuda.
2. **Login y registro** — Permite verificar qué tipo de usuario inicia sesión o se registra (administrador, colaborador o solicitante) y habilitar las acciones que le corresponden.
3. **Ayudas / Envío** — Entidad central del proyecto. Es muy parecida a un envío que necesita cierta cantidad de recursos para poder salir: tiene una fecha y unas metas de recursos por cumplir. Solo el administrador puede crearla.
4. **Seguimiento del envío** — Traza el estado de cada Ayuda a lo largo de su ciclo de vida (`recolectando → listo → en tránsito → entregado`), con evidencia de entrega, para dar visibilidad de origen a destino.
5. **Aporte** — Permite al usuario colaborador cargar al sistema qué tipo de ayuda quiere aportar (suministros, transporte/camiones, personal o ayuda monetaria) y asociarlo a una Ayuda/Envío para avanzar sus metas. El dinero se dona por un canal externo (no dentro de la app); ver "Donaciones monetarias externas".
6. **Solicitudes de ayuda** — Permite al usuario solicitante crear y listar peticiones de ayuda por sector (qué se necesita, urgencia y ubicación). Alimenta la decisión del administrador sobre qué enviar.
7. **Panel de administración** — Tablero donde el administrador ve el estado de cada envío, cuánto falta para las metas y las solicitudes abiertas, y decide qué envío sale primero.
8. **Tablero público de transparencia** — Vista abierta (sin necesidad de iniciar sesión) con qué se recolectó, el progreso de cada envío y a dónde fue cada ayuda.

**Módulos de apoyo** _(a ordenar en el roadmap):_

- **Puntos de acopio** — Centros físicos donde el colaborador entrega suministros: dirección, horarios y qué reciben.
- **Catálogo de recursos** — Define los tipos y unidades de recurso (agua, medicinas, alimentos…) contra los que se miden las metas de un envío.
- **Notificaciones** — Avisan a los colaboradores de un nuevo envío que necesita recursos o cuando se cumple una meta.
- **Verificación de usuarios** — Valida a colaboradores y solicitantes (en especial quien aporta camiones o pide ayuda) para dar confianza.
- **Donaciones monetarias externas** — Muestra los medios externos para donar dinero (cuenta bancaria, PayPal, Zelle, etc.). El pago siempre ocurre por fuera de la app; el administrador registra manualmente los montos ya recibidos para reflejarlos en la transparencia. La app no procesa el cobro.

## Para quién

- **Administrador** — Persona encargada de gestionar las ayudas y decidir cuándo sale el próximo envío y con qué recursos.
- **Colaboradores** — Personas dispuestas a aportar cualquier tipo de ayuda, ya sea sumándose como voluntarios, entregando suministros o poniendo transporte/camiones a disposición.
- **Usuario Solicitante** — Quien requiere o hace una petición de ayuda específica para algún sector, especificando qué se necesita.

## Principios

_Las ideas rectoras que guían las decisiones de producto y técnicas._

- **Transparencia** — Cualquiera puede ver qué se recolectó, cuánto falta y a dónde fue cada ayuda.
- **Trazabilidad** — Cada aporte y cada envío queda registrado y es auditable de origen a destino.
- **Simplicidad de uso** — Usable por personas sin experiencia técnica, en momentos de crisis y con conexión limitada.
- **Priorizar la urgencia** — El sistema apoya la decisión de qué envío sale primero según la necesidad real y los recursos disponibles.

## Qué NO es

_Acota el alcance: lo que el proyecto deliberadamente no pretende ser. Evita malentendidos y feature creep._

- **No reemplaza a los organismos oficiales** — Es apoyo logístico comunitario; no sustituye a Protección Civil, bomberos ni entes del Estado.
- **No es una pasarela de pagos** — La app no procesa pagos ni transacciones financieras dentro del sistema: no integra APIs de cobro, tarjetas, ni saldos. La ayuda monetaria sí es bienvenida, pero se canaliza **por fuera** de la app (transferencia, PayPal, Zelle, etc.); la app solo muestra esos medios externos y registra —de forma manual y para transparencia— los montos ya recibidos.
- **No es de alcance nacional/global** — Se enfoca en la ayuda que sale desde la región Guayana; no pretende ser una plataforma general para todo el país.
