import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { PanelDashboardFilters } from "./PanelDashboardFilters";

afterEach(cleanup);

describe("PanelDashboardFilters", () => {
  it("oculta el selector de centro cuando el admin tiene uno solo", () => {
    render(
      <PanelDashboardFilters
        centros={[{ id: "centro-1", nombre: "Centro único" }]}
      />,
    );

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Período: Todo el período" }),
    ).toBeInTheDocument();
  });

  it("muestra todos los centros y conserva el rango en el formulario GET", () => {
    const { container } = render(
      <PanelDashboardFilters
        centros={[
          { id: "centro-1", nombre: "Centro Norte" },
          { id: "centro-2", nombre: "Centro Sur" },
        ]}
        centroSeleccionado="centro-2"
        desde="2026-06-01"
        hasta="2026-06-30"
      />,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("Centro Sur");
    expect(screen.getByRole("link", { name: "Limpiar" })).toHaveAttribute(
      "href",
      "/panel",
    );
    expect(container.querySelector('input[name="desde"]')).toHaveValue(
      "2026-06-01",
    );
    expect(container.querySelector('input[name="hasta"]')).toHaveValue(
      "2026-06-30",
    );
  });
});
