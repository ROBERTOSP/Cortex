export type ApiError = {
  status: number;
  message: string;
};

export function getApiBaseUrl(): string {
  const v = (import.meta.env.VITE_API_URL || "").trim();
  return v || "http://localhost:3002";
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem("cortex_token");
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  input: string,
  init: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const url = input.startsWith("http") ? input : `${getApiBaseUrl()}${input}`;
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  const auth = init.auth ?? true;
  if (auth) {
    const token = getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const res = await fetch(url, {
    ...init,
    headers,
  });

  if (!res.ok) {
    let msg = res.statusText;
    try {
      const data = await res.json();
      msg = data?.message || msg;
    } catch {}
    const err: ApiError = { status: res.status, message: msg };
    throw err;
  }

  return (await res.json()) as T;
}

