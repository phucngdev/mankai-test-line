export const sum = (a: number, b: number) => a + b;

/**
 * Generates a random numeric string of the specified length.
 *
 * @param {number} length - The length of the numeric string to generate
 * @return {string} The randomly generated numeric string
 */
export function generateRandomNumericString(length = 6) {
  let result = '';

  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10);
  }

  return result;
}

function getFieldProps<T>(column: keyof T) {
  return column;
}

export const Tool = {
  generateRandomNumericString,
  getFieldProps,
  sum,
};
