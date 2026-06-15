import { describe, it, expect } from "vitest";
import { formatCurrency } from "../currency";

describe("formatCurrency", () => {
    it("formatea un valor en pesos colombianos sin decimales", () => {
        const result = formatCurrency(2500);
        // Intl puede variar la representación exacta por plataforma,
        // pero debe contener el valor y la moneda
        expect(result).toMatch(/2.500/);
        expect(result).toMatch(/\$|COP/);
    });

    it("formatea cero correctamente", () => {
        const result = formatCurrency(0);
        expect(result).toMatch(/0/);
    });

    it("no incluye decimales", () => {
        const result = formatCurrency(1500);
        // No debe haber coma decimal ni punto decimal seguido de dígitos
        expect(result).not.toMatch(/[,.]\d{2}$/);
    });

    it("formatea valores grandes correctamente", () => {
        const result = formatCurrency(100000);
        expect(result).toMatch(/100/);
    });
});
