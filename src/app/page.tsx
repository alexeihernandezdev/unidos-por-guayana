import { Button } from "@/shared/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">
        Unidos por Guayana
      </h1>
      <p className="max-w-md text-muted-foreground">
        Configuración base lista. Las features de dominio se construyen sobre
        esta plataforma.
      </p>
      <Button>Comenzar</Button>
    </main>
  );
}
