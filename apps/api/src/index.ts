import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { profileRoutes } from './routes/profile'
import { recommendationRoutes } from './routes/recommendation'
import { recordRoutes } from './routes/record'

const app = new Hono()

// 미들웨어
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:3000'],
  credentials: true,
}))

// 헬스 체크
app.get('/', (c) => {
  return c.json({
    message: 'My Life Agent API',
    version: '0.1.0',
    status: 'running'
  })
})

// 라우트 등록
app.route('/api/profile', profileRoutes)
app.route('/api/recommendations', recommendationRoutes)
app.route('/api/records', recordRoutes)

const port = process.env.PORT || 8080

console.log(`🚀 Server running at http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
