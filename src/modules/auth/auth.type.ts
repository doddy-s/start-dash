import { z } from 'zod'

export const AuthInfoSchema = z.object({
  accountId: z.string(),
  name: z.string(),
  roles: z.array(z.string()),
  roleSlugs: z.array(z.string()),
})
export type AuthInfoType = z.infer<typeof AuthInfoSchema>
