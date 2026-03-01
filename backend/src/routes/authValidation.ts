import { z } from 'zod';

const MIN_PASSWORD_LENGTH = 8;

export const registerBodySchema = z.object({
  email: z
    .string()
    .transform(s => s.trim().toLowerCase())
    .pipe(z.string().min(1, 'Email is required').email('Invalid email format')),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(
      MIN_PASSWORD_LENGTH,
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    ),
  name: z
    .string()
    .transform(s => s.trim() || undefined)
    .optional(),
});

export const loginBodySchema = z.object({
  email: z
    .string()
    .min(1, 'Invalid email or password')
    .transform(s => s.trim().toLowerCase()),
  password: z.string().min(1, 'Invalid email or password'),
});

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

function registerIssueToCode(issue: z.ZodIssue): string {
  const path = issue.path[0] as string | undefined;
  if (path === 'email') {
    return issue.code === 'invalid_format' ? 'INVALID_EMAIL' : 'EMAIL_REQUIRED';
  }
  if (path === 'password') {
    const msg = String(issue.message ?? '');
    if (msg.includes('Password is required')) return 'PASSWORD_REQUIRED';
    if (msg.includes('at least 8')) return 'PASSWORD_TOO_SHORT';
    return 'PASSWORD_REQUIRED';
  }
  return 'INVALID_BODY';
}

export function validateRegisterBody(
  body: unknown
): RegisterValid | RegisterInvalid {
  const result = registerBodySchema.safeParse(body);
  if (result.success) {
    return {
      ok: true,
      email: result.data.email,
      password: result.data.password,
      name: result.data.name,
    };
  }
  const issue = result.error.issues[0];
  if (!issue) {
    return { ok: false, error: 'Invalid body', code: 'INVALID_BODY' };
  }
  const isNonObject = result.error.issues.some(
    i => (i.message && String(i.message).includes('expected object')) ?? false
  );
  if (isNonObject) {
    return { ok: false, error: 'Invalid body', code: 'INVALID_BODY' };
  }
  const path = issue.path[0] as string | undefined;
  const rawMsg = issue.message ?? '';
  const message =
    path === 'email' && String(rawMsg).includes('received undefined')
      ? 'Email is required'
      : path === 'password' && String(rawMsg).includes('Password is required')
        ? 'Password is required'
        : rawMsg || 'Invalid body';
  return {
    ok: false,
    error: message,
    code: registerIssueToCode(issue),
  };
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
  const result = loginBodySchema.safeParse(body);
  if (result.success) {
    return {
      ok: true,
      email: result.data.email,
      password: result.data.password,
    };
  }
  const firstIssue = result.error.issues[0];
  const isNonObject = result.error.issues.some(
    i => (i.message && String(i.message).includes('expected object')) ?? false
  );
  if (isNonObject) {
    return { ok: false, error: 'Invalid body', code: 'INVALID_BODY' };
  }
  const rawMessage = firstIssue?.message ?? '';
  const errorMessage =
    typeof rawMessage === 'string' && rawMessage.includes('received undefined')
      ? 'Invalid email or password'
      : rawMessage || 'Invalid email or password';
  return {
    ok: false,
    error: errorMessage,
    code: 'INVALID_CREDENTIALS',
  };
}
