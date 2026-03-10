import { createMiddleware } from '@tanstack/react-start'

export const authenticationMiddleware = createMiddleware().server(async (c) => {
  return await c.next()
})
