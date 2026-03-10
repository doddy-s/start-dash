import { createMiddleware } from '@tanstack/react-start'

export const errorMiddleware = createMiddleware().server(async (c) => {
  let response: any
  try {
    response = await c.next()
  } catch (error) {
    console.error(error)
  }

  return response
})
