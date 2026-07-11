-- Feature 024 · Backfill de estados para JORNADA/EVENTO_SOCIAL.
-- Las actividades de tipo evento creadas antes de esta feature guardan un estado del
-- enum de envío. Se remapean 1 a 1 por posición a la secuencia de eventos:
--   LISTO -> LISTA, EN_TRANSITO -> EN_CURSO, ENTREGADO -> REALIZADA
-- `RECOLECTANDO` es compartido y no cambia. Va en migración separada porque usa los
-- valores de enum añadidos en la migración anterior (restricción de Postgres).
UPDATE "actividades"
SET "estado" = (
  CASE "estado"
    WHEN 'LISTO' THEN 'LISTA'
    WHEN 'EN_TRANSITO' THEN 'EN_CURSO'
    WHEN 'ENTREGADO' THEN 'REALIZADA'
    ELSE "estado"::text
  END
)::"EstadoActividad"
WHERE "tipo" IN ('JORNADA', 'EVENTO_SOCIAL')
  AND "estado" IN ('LISTO', 'EN_TRANSITO', 'ENTREGADO');
