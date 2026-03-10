import { z } from 'zod'

export const EmployeeDataTableSchema = z.object({
  id: z.string(),
  name: z.string(),
  fullName: z.string().nullish(),
  roles: z.array(z.string()),
  phoneNumber: z.string().nullish(),
  email: z.string().nullish(),
  signatureFileUrl: z.string().nullish(),
  lastSeen: z.coerce.date().nullish(),
  deleted: z.boolean().default(false),
})
export type EmployeeDataTableType = z.infer<typeof EmployeeDataTableSchema>
