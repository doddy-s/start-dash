import type { AuthInfoType } from '@/modules/auth/auth.type'
import { AuthContext } from './auth.context'
import { useMemo } from 'react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authContextValue = useMemo<{ authInfo: AuthInfoType }>(
    () => ({
      authInfo: { accountId: 'daf', name: 'user', roleSlugs: [], roles: [] },
    }),
    [],
  )

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  )
}
