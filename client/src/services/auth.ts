export type User = { id: string; name: string; email: string; role: 'user' | 'admin' };

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(`/api/auth${path}`, {
    method: init?.method ?? 'GET',
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
    body: init?.body ? JSON.stringify(init.body) : undefined,
    credentials: 'same-origin', // o cookie de sessão vai e volta pelo proxy do Vite
  });
  if (res.status === 204) return undefined as T;
  const data = (await res.json().catch(() => ({}))) as { message?: string; errors?: Record<string, string[]> };
  if (!res.ok) {
    const firstFieldError = data.errors ? Object.values(data.errors).flat()[0] : undefined;
    throw new ApiError(firstFieldError ?? data.message ?? 'Algo deu errado. Tente novamente.', res.status);
  }
  return data as T;
}

export const authApi = {
  me: () => request<{ user: User }>('/me'),
  login: (email: string, password: string) => request<{ user: User }>('/login', { method: 'POST', body: { email, password } }),
  register: (name: string, email: string, password: string) =>
    request<{ user: User }>('/register', { method: 'POST', body: { name, email, password } }),
  logout: () => request<void>('/logout', { method: 'POST' }),
};
