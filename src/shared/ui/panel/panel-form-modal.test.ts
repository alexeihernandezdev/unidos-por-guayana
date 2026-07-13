import { describe, expect, it } from "vitest";
import { PANEL_FORM_MODAL_MAX_W } from "./panel-form-modal";

describe("PANEL_FORM_MODAL_MAX_W", () => {
  it("mapea default a sm:max-w-lg", () => {
    expect(PANEL_FORM_MODAL_MAX_W.default).toBe("sm:max-w-lg");
  });

  it("mapea wide a sm:max-w-2xl", () => {
    expect(PANEL_FORM_MODAL_MAX_W.wide).toBe("sm:max-w-2xl");
  });
});
