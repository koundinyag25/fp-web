/** Linear interpolation between a and b at t∈[0,1]. */
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Ease-out cubic — motion that decelerates into each ping for a natural glide. */
export const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);
