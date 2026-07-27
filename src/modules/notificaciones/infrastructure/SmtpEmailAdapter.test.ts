import { describe, expect, it } from "vitest";
import { escaparHtml } from "./SmtpEmailAdapter";

describe("SmtpEmailAdapter", () => {
  it("escapa contenido dinámico antes de insertarlo en HTML", () => {
    expect(escaparHtml(`<script>"hola" & 'adiós'</script>`)).toBe(
      "&lt;script&gt;&quot;hola&quot; &amp; &#039;adiós&#039;&lt;/script&gt;",
    );
  });
});
