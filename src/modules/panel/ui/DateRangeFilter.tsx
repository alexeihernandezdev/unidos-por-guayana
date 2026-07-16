"use client";

import { useState } from "react";
import { CalendarRange, RotateCcw } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { es } from "react-day-picker/locale";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";

type Props = { desde?: string; hasta?: string };

const FORMATO = new Intl.DateTimeFormat("es-VE", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function desdeISO(valor?: string): Date | undefined {
  return valor ? new Date(valor + "T00:00:00") : undefined;
}

function aISO(fecha: Date): string {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function etiqueta(rango: DateRange | undefined): string {
  if (!rango?.from) return "Todo el período";
  if (!rango.to || rango.from.getTime() === rango.to.getTime()) {
    return FORMATO.format(rango.from);
  }
  return FORMATO.format(rango.from) + " – " + FORMATO.format(rango.to);
}

export function DateRangeFilter({ desde, hasta }: Props) {
  const [rango, setRango] = useState<DateRange | undefined>(() => {
    const from = desdeISO(desde);
    const to = desdeISO(hasta);
    return from ? { from, to: to ?? from } : undefined;
  });

  const desdeSeleccionado = rango?.from ? aISO(rango.from) : "";
  const hastaSeleccionado = rango?.from ? aISO(rango.to ?? rango.from) : "";

  return (
    <>
      {desdeSeleccionado ? <input type="hidden" name="desde" value={desdeSeleccionado} /> : null}
      {hastaSeleccionado ? <input type="hidden" name="hasta" value={hastaSeleccionado} /> : null}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full min-w-60 justify-start px-3 font-normal sm:w-auto"
            aria-label={"Período: " + etiqueta(rango)}
          >
            <CalendarRange className="size-4 text-muted-foreground" />
            <span className="truncate">{etiqueta(rango)}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="max-w-[calc(100vw-2rem)] overflow-hidden p-3">
          <Calendar
            mode="range"
            selected={rango}
            onSelect={setRango}
            defaultMonth={rango?.from}
            numberOfMonths={2}
            locale={es}
            navLayout="around"
            className="[&_.rdp-month:nth-child(2)]:hidden md:[&_.rdp-month:nth-child(2)]:block"
          />
          <div className="mt-2 flex justify-end border-t pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRango(undefined)}
              disabled={!rango?.from}
            >
              <RotateCcw className="size-3.5" />
              Todo el período
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
