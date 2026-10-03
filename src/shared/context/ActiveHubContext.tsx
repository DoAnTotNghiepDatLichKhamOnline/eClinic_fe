import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type HubId = 'hcmc' | 'hanoi' | 'danang'

interface ActiveHubContextValue {
  activeHub: HubId
  setActiveHub: (hub: HubId) => void
}

const ActiveHubContext = createContext<ActiveHubContextValue | null>(null)

export function ActiveHubProvider({ children }: { children: ReactNode }) {
  const [activeHub, setActiveHub] = useState<HubId>('hcmc')

  const value = useMemo(() => ({ activeHub, setActiveHub }), [activeHub])

  return <ActiveHubContext.Provider value={value}>{children}</ActiveHubContext.Provider>
}

export function useActiveHub() {
  const ctx = useContext(ActiveHubContext)
  if (!ctx) {
    throw new Error('useActiveHub must be used within an ActiveHubProvider')
  }
  return ctx
}
