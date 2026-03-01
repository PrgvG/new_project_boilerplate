import jwt from 'jsonwebtoken';

/**
 * Преобразует значение из env (число секунд или строка типа "7d", "24h")
 * в тип expiresIn для jwt.SignOptions.
 */
export function parseExpiresIn(value: string): jwt.SignOptions['expiresIn'] {
  return /^\d+$/.test(value)
    ? Number(value)
    : (value as jwt.SignOptions['expiresIn']);
}
