"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

/* Lets the form tell the map which college just signed, so its dot can ping. */

interface Ping {
  pingId: string | null;
  /** Bumps on every ping, so the same college can ping twice in a row. */
  pingKey: number;
  ping(collegeId: string | null): void;
}

const PingContext = createContext<Ping>({ pingId: null, pingKey: 0, ping: () => {} });

export function PingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ pingId: string | null; pingKey: number }>({ pingId: null, pingKey: 0 });
  const ping = useCallback(
    (collegeId: string | null) => setState((s) => ({ pingId: collegeId, pingKey: s.pingKey + 1 })),
    [],
  );
  return <PingContext.Provider value={{ ...state, ping }}>{children}</PingContext.Provider>;
}

export function usePing(): Ping {
  return useContext(PingContext);
}
