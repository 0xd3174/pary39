const SYMBOLS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function getRandomChar(): string {
  const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
  return SYMBOLS[randomIndex];
}

export function generateComponentId(prefix: string): string {
  const randomChars = Array.from({ length: 8 }, getRandomChar);

  return `${prefix}-${randomChars.join('')}`;
}
