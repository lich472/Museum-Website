import { createContext, useContext } from 'react'
import type { Account } from './membershipService'
export const MembershipContext = createContext<{
  account: Account | null
  refresh: () => void
  openLogin: () => void
  signOut: () => void
} | null>(null)
export function useMembership() {
  const context = useContext(MembershipContext)
  if (!context) throw new Error('MembershipProvider is required')
  return context
}
