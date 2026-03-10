import { createStart } from '@tanstack/react-start'
import { errorMiddleware } from './middlewares/error.middleware'
import { authenticationMiddleware } from './middlewares/authentication.middleware'

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [errorMiddleware, authenticationMiddleware],
  }
})
