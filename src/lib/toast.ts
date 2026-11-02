import { subscribeToSyncState, SyncState } from './storage';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  durationMs?: number;
  createdAt: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

let activeToasts: ToastItem[] = [];
const listeners = new Set<ToastListener>();

const notifyListeners = () => {
  listeners.forEach((listener) => listener([...activeToasts]));
};

export const subscribeToToasts = (listener: ToastListener) => {
  listeners.add(listener);
  listener([...activeToasts]);
  return () => {
    listeners.delete(listener);
  };
};

export const removeToast = (id: string) => {
  activeToasts = activeToasts.filter((t) => t.id !== id);
  notifyListeners();
};

export const addToast = (toast: {
  type: ToastType;
  message: string;
  title?: string;
  durationMs?: number;
}): string => {
  const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const durationMs = toast.durationMs ?? 4000;

  const newItem: ToastItem = {
    id,
    type: toast.type,
    title: toast.title,
    message: toast.message,
    durationMs,
    createdAt: Date.now(),
  };

  // Keep max 4 toasts visible at a time to keep UI clean and non-intrusive
  activeToasts = [newItem, ...activeToasts].slice(0, 4);
  notifyListeners();

  if (durationMs > 0) {
    setTimeout(() => {
      removeToast(id);
    }, durationMs);
  }

  return id;
};

export const toast = {
  success: (message: string, title?: string, durationMs?: number) =>
    addToast({ type: 'success', message, title, durationMs }),
  error: (message: string, title?: string, durationMs?: number) =>
    addToast({ type: 'error', message, title, durationMs }),
  info: (message: string, title?: string, durationMs?: number) =>
    addToast({ type: 'info', message, title, durationMs }),
};

// Automatic Cloud Sync Toast Listener
let previousSyncState: SyncState | null = null;

subscribeToSyncState((state: SyncState) => {
  // Only trigger completion toasts when transitioning FROM 'saving' state
  if (previousSyncState === 'saving') {
    if (state === 'synced') {
      toast.success('Data saved successfully', 'Cloud Backup');
    } else if (state === 'error') {
      toast.error('Sync failed', 'Cloud Backup');
    }
  }
  previousSyncState = state;
});
