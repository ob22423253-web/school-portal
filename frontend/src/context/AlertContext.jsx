// Tiny custom toast/alert system. Avoids pulling in a heavy library for what
// is really just "show a coloured message for a few seconds."

import { createContext, useCallback, useContext, useState } from 'react';

const AlertContext = createContext(null);

let nextId = 1;

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const dismiss = useCallback((id) => {
    setAlerts((current) => current.filter((a) => a.id !== id));
  }, []);

  const notify = useCallback(
    (message, type = 'info', timeout = 3500) => {
      const id = nextId++;
      setAlerts((current) => [...current, { id, message, type }]);
      if (timeout) {
        setTimeout(() => dismiss(id), timeout);
      }
      return id;
    },
    [dismiss]
  );

  const value = {
    notify,
    success: (m, t) => notify(m, 'success', t),
    error: (m, t) => notify(m, 'error', t),
    info: (m, t) => notify(m, 'info', t),
    dismiss,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-2">
        {alerts.map((a) => (
          <div
            key={a.id}
            className={`flex items-start justify-between gap-2 rounded-md px-4 py-3 shadow-md text-sm ${
              a.type === 'success'
                ? 'bg-emerald-600 text-white'
                : a.type === 'error'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-800 text-white'
            }`}
          >
            <span className="break-words">{a.message}</span>
            <button
              type="button"
              onClick={() => dismiss(a.id)}
              className="opacity-80 hover:opacity-100"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be used within AlertProvider');
  return ctx;
}
