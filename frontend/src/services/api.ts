import axios from 'axios';
import type { ApiResponse, LLMResponse, Itinerary, SessionInfo } from '../types/index.js';

const BASE = import.meta.env['VITE_API_URL'] ?? '/api';

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
  timeout: 150000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err: unknown) => {
    if (axios.isAxiosError(err)) {
      const message = (err.response?.data as ApiResponse | undefined)?.error ?? err.message;
      throw new Error(message);
    }
    throw err;
  }
);

export async function sendMessage(message: string): Promise<LLMResponse> {
  const res = await api.post<ApiResponse<LLMResponse>>('/chat/message', { message });
  if (!res.data.success || !res.data.data) throw new Error(res.data.error ?? 'Failed');
  return res.data.data;
}

export interface StreamCallbacks {
  onToken?: (token: string) => void;
  onStatus?: (message: string) => void;
  onComplete?: (response: LLMResponse) => void;
  onError?: (error: string) => void;
}

export function sendMessageStream(message: string, callbacks: StreamCallbacks): () => void {
  const ctrl = new AbortController();

  const run = async () => {
    try {
      const response = await fetch(`${BASE}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message }),
        signal: ctrl.signal,
      });

      if (!response.ok || !response.body) {
        const text = await response.text().catch(() => 'Unknown error');
        callbacks.onError?.(text);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        let event = '';
        let dataLine = '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            event = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            dataLine = line.slice(5).trim();
          } else if (line === '') {
            if (event && dataLine) {
              try {
                const parsed = JSON.parse(dataLine) as Record<string, unknown>;
                if (event === 'token' && typeof parsed['token'] === 'string') {
                  callbacks.onToken?.(parsed['token']);
                } else if (event === 'status' && typeof parsed['message'] === 'string') {
                  callbacks.onStatus?.(parsed['message']);
                } else if (event === 'complete') {
                  callbacks.onComplete?.(parsed as unknown as LLMResponse);
                } else if (event === 'error' && typeof parsed['error'] === 'string') {
                  callbacks.onError?.(parsed['error']);
                }
              } catch { /* ignore parse errors */ }
            }
            event = '';
            dataLine = '';
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        callbacks.onError?.(err instanceof Error ? err.message : 'Stream failed');
      }
    }
  };

  run();
  return () => ctrl.abort();
}

export async function getItinerary(): Promise<Itinerary | null> {
  try {
    const res = await api.get<ApiResponse<Itinerary>>('/itinerary');
    return res.data.data ?? null;
  } catch { return null; }
}

export async function getSession(): Promise<SessionInfo | null> {
  try {
    const res = await api.get<ApiResponse<SessionInfo>>('/session');
    return res.data.data ?? null;
  } catch { return null; }
}

export async function clearSession(): Promise<void> {
  await api.delete('/session');
}

export default api;
