import { HonoEnv } from '@/create-app'
import { createMiddleware } from 'hono/factory'
import { NOT_FOUND } from 'stoker/http-status-codes'
import { NOT_FOUND as NOT_FOUND_MESSAGE } from 'stoker/http-status-phrases'

// export default notFound;
export default createMiddleware<HonoEnv>(async (c) => {
  // const notFound: NotFoundHandler = (c) => {
  return c.json(
    {
      success: false,
      message: `${NOT_FOUND_MESSAGE} - ${c.req.path}`,
    },
    NOT_FOUND
  )
})
//   return notFound
// })
