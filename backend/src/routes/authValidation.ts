const MIN_PASSWORD_LENGTH = 8;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type RegisterValid = {
  ok: true;
  email: string;
  password: string;
  name?: string;
};

export type RegisterInvalid = {
  ok: false;
  error: string;
  code: string;
};

export function validateRegisterBody(
  body: unknown
): RegisterValid | RegisterInvalid {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Invalid body', code: 'INVALID_BODY' };
  }
  const o = body as Record<string, unknown>;
  const emailStr =
    typeof o.email === 'string' ? o.email.trim().toLowerCase() : '';
  const passwordStr = typeof o.password === 'string' ? o.password : '';
  const nameStr =
    typeof o.name === 'string' ? o.name.trim() || undefined : undefined;

  if (!emailStr) {
    return { ok: false, error: 'Email is required', code: 'EMAIL_REQUIRED' };
  }
  if (!EMAIL_REGEX.test(emailStr)) {
    return { ok: false, error: 'Invalid email format', code: 'INVALID_EMAIL' };
  }
  if (!passwordStr) {
    return {
      ok: false,
      error: 'Password is required',
      code: 'PASSWORD_REQUIRED',
    };
  }
  if (passwordStr.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      code: 'PASSWORD_TOO_SHORT',
    };
  }

  return { ok: true, email: emailStr, password: passwordStr, name: nameStr };
}

export type LoginValid = {
  ok: true;
  email: string;
  password: string;
};

export type LoginInvalid = {
  ok: false;
  error: string;
  code: string;
};

export function validateLoginBody(body: unknown): LoginValid | LoginInvalid {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Invalid body', code: 'INVALID_BODY' };
  }
  const o = body as Record<string, unknown>;
  const emailStr =
    typeof o.email === 'string' ? o.email.trim().toLowerCase() : '';
  const passwordStr = typeof o.password === 'string' ? o.password : '';

  if (!emailStr || !passwordStr) {
    return {
      ok: false,
      error: 'Invalid email or password',
      code: 'INVALID_CREDENTIALS',
    };
  }

  return { ok: true, email: emailStr, password: passwordStr };
}
