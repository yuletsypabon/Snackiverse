/**
 * Convención de precios y saldos del sistema:
 *
 * Todos los valores monetarios se almacenan como enteros en PESOS COLOMBIANOS (COP).
 * No se usan centavos. Ejemplo: 2500 = $2.500 COP.
 *
 * Esto aplica a: Product.price, Student.balance, Sale.total,
 * SaleItem.unitPrice, SaleItem.subtotal, Recharge.amount, Payment.amount.
 */

const currencyFormatter = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
    return currencyFormatter.format(value);
}
