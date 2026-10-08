const DECIMAL = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;

/**
 * Parses a plain decimal number such as "1", "-0.5", ".5" or "1e-3".
 * Returns undefined for anything else, including trailing text and non-finite values.
 */
export const parseDecimal = (text: string): number | undefined => {
  const value = text.trim();
  if (!DECIMAL.test(value)) {
    return undefined;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};
