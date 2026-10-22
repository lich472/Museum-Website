import { useCallback, useEffect, useState } from 'react'
import { useUserStore } from '../../stores/useUserStore' // adjust the path
import { fetchMyMembership } from './membershipService'
import type { MembershipStatus } from './membershipService'

export function useMembership() {
  const user = useUserStore((s) => s.user) // adjust to your store's field
  const [status, setStatus] = useState<MembershipStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setStatus(null)
      setLoading(false)
      return
    }
    try {
      setStatus(await fetchMyMembership())
    } catch {
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    user,
    status,
    loading,
    refresh,
    isMember: !!status?.isMember,
    expiresAt: status?.expiresAt ?? null,
  }
}