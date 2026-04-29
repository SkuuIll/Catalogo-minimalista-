/**
 * Formatea un número como precio en pesos argentinos.
 * Ej: 1234567.89 → "ARS $1.234.567,89"
 * Ej: 999.99 → "ARS $999,99"
 * Ej: 1500 → "ARS $1.500"
 */
export function formatARS(amount: number): string {
  return 'ARS $' + amount.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Calcula porcentaje de descuento entre precio actual y precio original.
 * Ej: discountPercent(849.99, 999.99) → 15
 */
export function discountPercent(current: number, original: number): number {
  if (!original || original <= current) return 0
  return Math.round((1 - current / original) * 100)
}
