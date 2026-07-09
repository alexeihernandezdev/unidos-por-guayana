# Feature 006 · Aportes

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/006-aportes/`._

---

## En una frase

Permitir a los **colaboradores** sumarse a un envío diciendo **qué van a aportar y cuánto**, y al **Administrador** confirmar cuándo esa ayuda **llegó de verdad**, para que el progreso de cada envío refleje lo real y no solo lo prometido.

## Qué aporta

Esta etapa da vida a los envíos: por primera vez el progreso de las metas empieza a moverse.

- **El Colaborador aporta a un envío en preparación** — elige una Ayuda que esté en "Recolectando", uno de los recursos que ese envío necesita (agua, alimentos, un camión, una donación en USD…) y **cuánto** puede aportar. Puede añadir una nota. El aporte queda registrado como **"comprometido"**.
- **El Administrador confirma cuando llega** — cuando la entrega se materializa (o cuando confirma un ingreso monetario por transferencia, PayPal, Zelle, etc.), marca el aporte como **"recibido"**. Solo a partir de ese momento suma al progreso de la meta.
- **"Comprometido" y "recibido" se ven por separado** — el panel muestra por cada meta cuánto está prometido y cuánto está realmente recibido. Así se distingue la intención del hecho.
- **El colaborador puede cancelar mientras esté comprometido** — si cambió de idea o se equivocó. Una vez recibido, ya no.
- **El Administrador puede corregir** — si marcó "recibido" por error, puede revertir a "comprometido". Es una corrección puntual, no un flujo habitual.
- **Cada colaborador ve sus aportes** — una vista "Mis aportes" con el estado de cada uno.

## Por qué importa

Es el **eslabón que convierte un envío en algo que avanza**. Sin aportes, las metas son solo cifras deseables; con aportes registrados y confirmados, se puede decir "faltan 200 de 500 litros de agua para que este envío salga". Además, el paso en dos etapas (comprometido → recibido) protege la confianza: nadie infla el progreso sin que el equipo gestor haya visto llegar la ayuda.

## Qué queda fuera (por ahora)

- Las **notificaciones** al colaborador cuando su aporte se marca como recibido llegan en una etapa posterior.
- La **evidencia de entrega** (foto, comprobante, nota estructurada) es parte del seguimiento posterior del envío.
- Los **puntos de acopio** físicos donde el colaborador entrega los suministros se integran más adelante; por ahora el aporte no exige elegir uno.
- El **registro manual** de dinero recibido por fuera **sin colaborador identificado** (por ejemplo, una transferencia anónima) se resuelve en la feature de donaciones monetarias externas.
- **No se aportan** recursos que el envío no necesita, ni se aporta a envíos que ya salieron de "Recolectando".

## Resultado para el cliente

Al terminar, la plataforma **muestra el progreso real** de cada envío: cuánto se prometió, cuánto se ha recibido y cuánto falta para cada recurso. El equipo gestor tiene control sobre qué se cuenta como recibido, y los colaboradores tienen una forma clara de participar y ver el estado de su aporte. Es la base sobre la que se construye la transparencia pública.
