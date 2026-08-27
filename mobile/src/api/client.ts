import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_ID_KEY = "jae:userId";

/**
 * No dispositivo físico/emulador, troque para o IP da máquina que roda o backend
 * (ex.: http://192.168.0.10:4000). No Expo Web, localhost funciona diretamente.
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

export async function getUserId(): Promise<string | null> {
  return AsyncStorage.getItem(USER_ID_KEY);
}

export async function setUserId(id: string): Promise<void> {
  await AsyncStorage.setItem(USER_ID_KEY, id);
}

export async function clearUserId(): Promise<void> {
  await AsyncStorage.removeItem(USER_ID_KEY);
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; withAuth?: boolean } = {}
): Promise<T> {
  const { method = "GET", body, withAuth = true } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (withAuth) {
    const userId = await getUserId();
    if (userId) headers["X-User-Id"] = userId;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    throw new ApiError(data?.error ?? `Erro ${response.status}`, response.status);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown, withAuth = true) =>
    request<T>(path, { method: "POST", body, withAuth }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
