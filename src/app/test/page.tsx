import type { Metadata } from "next";
import { SmoothScroll } from "@/modules/landing/ui/SmoothScroll";
import { TimelineScrollVideo } from "@/modules/landing/ui/TimelineScrollVideo";

export const metadata: Metadata = {
  title: "Recorrido de una caja | Unidos por la Guaira",
  description:
    "Prueba visual del recorrido de una caja de ayuda controlada por scroll.",
  robots: { index: false, follow: false },
};

export default function TestTimelinePage() {
  return (
    <SmoothScroll>
      <main className="min-w-0 flex-1 overflow-x-clip [--altura-header:0rem]">
        <h1 className="sr-only">Recorrido de una caja de ayuda</h1>
        <TimelineScrollVideo />
      </main>
    </SmoothScroll>
  );
}
