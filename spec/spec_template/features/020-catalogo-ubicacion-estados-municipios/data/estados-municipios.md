# Datos de referencia · Estados y municipios de Venezuela

> **Fuente para el seeder** de la feature 020. Es el listado autoritativo que la
> siembra (`prisma/seed.ts`) debe cargar en las tablas `estados` y `municipios`.
>
> **24 entidades federales** y **≈335 municipios**.
>
> ⚠️ **Reconciliar antes de sembrar.** Los nombres de estados están consolidados;
> el listado de municipios es exhaustivo pero puede tener divergencias puntuales de
> nombre o alta/baja reciente. El agente que implemente la feature **debe verificar
> el listado y los conteos contra una fuente oficial (INE / Gaceta Oficial)** y
> corregir aquí cualquier discrepancia antes de cargar el seed. El total esperado es
> ~335 municipios; si el conteo real difiere, manda la fuente oficial, no este archivo.

## Convenciones de datos

- **Estado.codigo** — se usa el código ISO 3166-2:VE (`VE-A`, `VE-B`, …) como
  identificador estable y único del estado. Sirve de clave natural para que la
  siembra sea **idempotente** (upsert por `codigo`).
- **Municipio.codigo** — `<codigoEstado>-<nn>` con `nn` correlativo de dos dígitos
  dentro del estado (p. ej. `VE-A-01`). Único global. Se genera a partir del orden
  de esta lista; si se reordena, mantener el código ya asignado para no romper FKs.
- **nombre** — nombre oficial del municipio o estado, con acentuación en español.

## Entidades federales (24)

| codigo | nombre           |
| ------ | ---------------- |
| VE-A   | Distrito Capital |
| VE-Z   | Amazonas         |
| VE-B   | Anzoátegui       |
| VE-C   | Apure            |
| VE-D   | Aragua           |
| VE-E   | Barinas          |
| VE-F   | Bolívar          |
| VE-G   | Carabobo         |
| VE-H   | Cojedes          |
| VE-Y   | Delta Amacuro    |
| VE-I   | Falcón           |
| VE-J   | Guárico          |
| VE-K   | Lara             |
| VE-L   | Mérida           |
| VE-M   | Miranda          |
| VE-N   | Monagas          |
| VE-O   | Nueva Esparta    |
| VE-P   | Portuguesa       |
| VE-R   | Sucre            |
| VE-S   | Táchira          |
| VE-T   | Trujillo         |
| VE-X   | La Guaira        |
| VE-U   | Yaracuy          |
| VE-V   | Zulia            |

> Nota: **La Guaira** es la denominación vigente del antiguo estado **Vargas** (ISO
> `VE-X`). Se guarda como `La Guaira`. Es el estado de origen de los envíos (ver
> `mission.md`).

## Municipios por estado

### VE-A · Distrito Capital (1)
1. Libertador

### VE-Z · Amazonas (7)
1. Alto Orinoco
2. Atabapo
3. Atures
4. Autana
5. Manapiare
6. Maroa
7. Río Negro

### VE-B · Anzoátegui (21)
1. Anaco
2. Aragua
3. Diego Bautista Urbaneja
4. Fernando de Peñalver
5. Francisco del Carmen Carvajal
6. Francisco de Miranda
7. Guanta
8. Independencia
9. José Gregorio Monagas
10. Juan Antonio Sotillo
11. Juan Manuel Cajigal
12. Libertad
13. Manuel Ezequiel Bruzual
14. Pedro María Freites
15. Píritu
16. San José de Guanipa
17. San Juan de Capistrano
18. Santa Ana
19. Simón Bolívar
20. Simón Rodríguez
21. Sir Arthur McGregor

### VE-C · Apure (7)
1. Achaguas
2. Biruaca
3. Muñoz
4. Páez
5. Pedro Camejo
6. Rómulo Gallegos
7. San Fernando

### VE-D · Aragua (18)
1. Bolívar
2. Camatagua
3. Francisco Linares Alcántara
4. Girardot
5. José Ángel Lamas
6. José Félix Ribas
7. José Rafael Revenga
8. Libertador
9. Mario Briceño Iragorry
10. Ocumare de la Costa de Oro
11. San Casimiro
12. San Sebastián
13. Santiago Mariño
14. Santos Michelena
15. Sucre
16. Tovar
17. Urdaneta
18. Zamora

### VE-E · Barinas (12)
1. Alberto Arvelo Torrealba
2. Andrés Eloy Blanco
3. Antonio José de Sucre
4. Arismendi
5. Barinas
6. Bolívar
7. Cruz Paredes
8. Ezequiel Zamora
9. Obispos
10. Pedraza
11. Rojas
12. Sosa

### VE-F · Bolívar (11)
1. Caroní
2. Cedeño
3. El Callao
4. Gran Sabana
5. Heres
6. Padre Pedro Chien
7. Piar
8. Raúl Leoni
9. Roscio
10. Sifontes
11. Sucre

### VE-G · Carabobo (14)
1. Bejuma
2. Carlos Arvelo
3. Diego Ibarra
4. Guacara
5. Juan José Mora
6. Libertador
7. Los Guayos
8. Miranda
9. Montalbán
10. Naguanagua
11. Puerto Cabello
12. San Diego
13. San Joaquín
14. Valencia

### VE-H · Cojedes (9)
1. Anzoátegui
2. Ezequiel Zamora
3. Girardot
4. Lima Blanco
5. Pao de San Juan Bautista
6. Ricaurte
7. Rómulo Gallegos
8. Tinaco
9. Tinaquillo

### VE-Y · Delta Amacuro (4)
1. Antonio Díaz
2. Casacoima
3. Pedernales
4. Tucupita

### VE-I · Falcón (25)
1. Acosta
2. Bolívar
3. Buchivacoa
4. Cacique Manaure
5. Carirubana
6. Colina
7. Dabajuro
8. Democracia
9. Falcón
10. Federación
11. Jacura
12. José Laurencio Silva
13. Los Taques
14. Mauroa
15. Miranda
16. Monseñor Iturriza
17. Palmasola
18. Petit
19. Píritu
20. San Francisco
21. Sucre
22. Tocópero
23. Unión
24. Urumaco
25. Zamora

### VE-J · Guárico (15)
1. Camaguán
2. Chaguaramas
3. El Socorro
4. Francisco de Miranda
5. José Félix Ribas
6. José Tadeo Monagas
7. Juan Germán Roscio
8. Julián Mellado
9. Las Mercedes
10. Leonardo Infante
11. Ortiz
12. Pedro Zaraza
13. San Gerónimo de Guayabal
14. San José de Guaribe
15. Santa María de Ipire

### VE-K · Lara (9)
1. Andrés Eloy Blanco
2. Crespo
3. Iribarren
4. Jiménez
5. Morán
6. Palavecino
7. Simón Planas
8. Torres
9. Urdaneta

### VE-L · Mérida (23)
1. Alberto Adriani
2. Andrés Bello
3. Antonio Pinto Salinas
4. Aricagua
5. Arzobispo Chacón
6. Campo Elías
7. Caracciolo Parra Olmedo
8. Cardenal Quintero
9. Guaraque
10. Julio César Salas
11. Justo Briceño
12. Libertador
13. Miranda
14. Obispo Ramos de Lora
15. Padre Noguera
16. Pueblo Llano
17. Rangel
18. Rivas Dávila
19. Santos Marquina
20. Sucre
21. Tovar
22. Tulio Febres Cordero
23. Zea

### VE-M · Miranda (21)
1. Acevedo
2. Andrés Bello
3. Baruta
4. Brión
5. Buroz
6. Carrizal
7. Chacao
8. Cristóbal Rojas
9. El Hatillo
10. Guaicaipuro
11. Independencia
12. Lander
13. Los Salias
14. Páez
15. Paz Castillo
16. Pedro Gual
17. Plaza
18. Simón Bolívar
19. Sucre
20. Urdaneta
21. Zamora

### VE-N · Monagas (13)
1. Acosta
2. Aguasay
3. Bolívar
4. Caripe
5. Cedeño
6. Ezequiel Zamora
7. Libertador
8. Maturín
9. Piar
10. Punceres
11. Santa Bárbara
12. Sotillo
13. Uracoa

### VE-O · Nueva Esparta (11)
1. Antolín del Campo
2. Arismendi
3. Díaz
4. García
5. Gómez
6. Maneiro
7. Marcano
8. Mariño
9. Península de Macanao
10. Tubores
11. Villalba

### VE-P · Portuguesa (14)
1. Agua Blanca
2. Araure
3. Esteller
4. Guanare
5. Guanarito
6. Monseñor José Vicente de Unda
7. Ospino
8. Páez
9. Papelón
10. San Genaro de Boconoíto
11. San Rafael de Onoto
12. Santa Rosalía
13. Sucre
14. Turén

### VE-R · Sucre (15)
1. Andrés Eloy Blanco
2. Andrés Mata
3. Arismendi
4. Benítez
5. Bermúdez
6. Bolívar
7. Cajigal
8. Cruz Salmerón Acosta
9. Libertador
10. Mariño
11. Mejía
12. Montes
13. Ribero
14. Sucre
15. Valdez

### VE-S · Táchira (29)
1. Andrés Bello
2. Antonio Rómulo Costa
3. Ayacucho
4. Bolívar
5. Cárdenas
6. Córdoba
7. Fernández Feo
8. Francisco de Miranda
9. García de Hevia
10. Guásimos
11. Independencia
12. Jáuregui
13. José María Vargas
14. Junín
15. Libertad
16. Libertador
17. Lobatera
18. Michelena
19. Panamericano
20. Pedro María Ureña
21. Rafael Urdaneta
22. Samuel Darío Maldonado
23. San Cristóbal
24. San Judas Tadeo
25. Seboruco
26. Simón Rodríguez
27. Sucre
28. Torbes
29. Uribante

### VE-T · Trujillo (20)
1. Andrés Bello
2. Boconó
3. Bolívar
4. Candelaria
5. Carache
6. Carvajal
7. Escuque
8. José Felipe Márquez Cañizales
9. Juan Vicente Campo Elías
10. La Ceiba
11. Miranda
12. Monte Carmelo
13. Motatán
14. Pampán
15. Pampanito
16. Rafael Rangel
17. San Rafael de Carvajal
18. Sucre
19. Trujillo
20. Urdaneta
21. Valera

> ⚠️ Trujillo aparece con 21 filas arriba; las fuentes oficiales suelen listar **20**
> municipios. Reconciliar (posible duplicado entre `Monte Carmelo` y un municipio
> homónimo) antes de sembrar.

### VE-X · La Guaira (1)
1. Vargas

### VE-U · Yaracuy (14)
1. Arístides Bastidas
2. Bolívar
3. Bruzual
4. Cocorote
5. Independencia
6. José Antonio Páez
7. La Trinidad
8. Manuel Monge
9. Nirgua
10. Peña
11. San Felipe
12. Sucre
13. Urachiche
14. Veroes

### VE-V · Zulia (21)
1. Almirante Padilla
2. Baralt
3. Cabimas
4. Catatumbo
5. Colón
6. Francisco Javier Pulgar
7. Guajira
8. Jesús Enrique Lossada
9. Jesús María Semprún
10. La Cañada de Urdaneta
11. Lagunillas
12. Machiques de Perijá
13. Mara
14. Maracaibo
15. Miranda
16. Rosario de Perijá
17. San Francisco
18. Santa Rita
19. Simón Bolívar
20. Sucre
21. Valmore Rodríguez
