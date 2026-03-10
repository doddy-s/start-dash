import type { AuthInfoType } from '@/server/auth/auth.type'
import { createContext } from 'react'

export const AuthContext = createContext<{ authInfo: AuthInfoType } | undefined>(
  undefined
)