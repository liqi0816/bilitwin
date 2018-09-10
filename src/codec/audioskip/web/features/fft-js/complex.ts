export type Complex = Float32Array

/**
 * Add two complex numbers
 */
export function add(a: Complex, b: Complex) {
    return Float32Array.of(a[0] + b[0], a[1] + b[1]);
};

/**
 * Subtract two complex numbers
 */
export function subtract(a: Complex, b: Complex) {
    return Float32Array.of(a[0] - b[0], a[1] - b[1]);
};

/**
 * Multiply two complex numbers
 *
 * (a + bi) * (c + di) = (ac - bd) + (ad + bc)i
 */
export function multiply(a: Complex, b: Complex) {
    return Float32Array.of((a[0] * b[0] - a[1] * b[1]), (a[0] * b[1] + a[1] * b[0]));
};

/**
 * Calculate |a + bi|
 *
 * sqrt(a*a + b*b)
 */
export function magnitude(c: Complex) {
    return Math.sqrt(c[0] * c[0] + c[1] * c[1]);
};
