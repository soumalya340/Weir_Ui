"use client";

import { createContext, useContext } from "react";

/** True when PrivyProvider is mounted in the tree. */
const PrivyGateContext = createContext(false);

export function PrivyGateProvider({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return <PrivyGateContext.Provider value={active}>{children}</PrivyGateContext.Provider>;
}

export function usePrivyGate() {
  return useContext(PrivyGateContext);
}
