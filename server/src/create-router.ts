import { OpenAPIHono } from '@hono/zod-openapi'
// import { Hono } from 'hono';

import { HonoEnv } from './create-app'

export default function createRouter(): OpenAPIHono<HonoEnv> {
  const app = new OpenAPIHono<HonoEnv>({
    strict: true,
  })
  // app.use('/*', cors()).use('/*', logger())
  return app
}
