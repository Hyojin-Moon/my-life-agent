import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { ProfileRepository, RecordRepository, RecommendationRepository } from '@my-life-agent/database'
import { LifeAgent } from '@my-life-agent/ai-agent'
import { createProfileRoutes } from './routes/profile'
import { createRecommendationRoutes } from './routes/recommendation'
import { createRecordRoutes } from './routes/record'

// Repository 인스턴스 생성
const profileRepo = new ProfileRepository()
const recordRepo = new RecordRepository()
const recommendationRepo = new RecommendationRepository()

// LifeAgent 팩토리 함수
const createAgent = () => new LifeAgent({
  apiKey: process.env.GEMINI_API_KEY || '',
})

const app = new Hono()

// 미들웨어
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:5173'],
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

// 라우트 등록 (의존성 주입)
app.route('/api/profile', createProfileRoutes(profileRepo))
app.route('/api/recommendations', createRecommendationRoutes(profileRepo, recordRepo, recommendationRepo, createAgent))
app.route('/api/records', createRecordRoutes(profileRepo, recordRepo))

const port = process.env.PORT || 8080

console.log(`Server running at http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
