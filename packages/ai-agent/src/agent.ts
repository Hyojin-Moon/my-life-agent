import type {
  UserProfile,
  RecommendationType,
  Recommendation,
  LifeRecord,
} from '@my-life-agent/shared'
import { GeminiClient } from './gemini'
import {
  buildRecommendationPrompt,
  buildAnalysisPrompt,
  buildFeedbackPrompt,
} from './prompts'

interface AgentConfig {
  apiKey: string
  model?: string
}

interface RecommendationResult {
  recommendations: Array<{
    name: string
    reason: string
    score: number
    details?: string
  }>
}

interface AnalysisResult {
  patterns: {
    food: string[]
    travel: string[]
    exercise: string[]
  }
  suggestions: string[]
  insights: string
}

interface FeedbackResult {
  adjustment: string
  avoid: string[]
  prefer: string[]
  note: string
}

export class LifeAgent {
  private client: GeminiClient
  private profile: UserProfile | null = null
  private recentRecords: LifeRecord[] = []

  constructor(config: AgentConfig) {
    this.client = new GeminiClient({
      apiKey: config.apiKey,
      model: config.model,
    })
  }

  setProfile(profile: UserProfile): void {
    this.profile = profile
  }

  setRecentRecords(records: LifeRecord[]): void {
    this.recentRecords = records
  }

  async getRecommendations(
    type: RecommendationType,
    context?: string
  ): Promise<Recommendation[]> {
    if (!this.profile) {
      throw new Error('프로필이 설정되지 않았습니다.')
    }

    const prompt = buildRecommendationPrompt(
      type,
      this.profile,
      context,
      this.recentRecords.filter((r) => r.type === type)
    )

    const result = await this.client.generateJSON<RecommendationResult>(prompt)

    return result.recommendations.map((rec, index) => ({
      id: `rec-${Date.now()}-${index}`,
      name: rec.name,
      reason: rec.reason,
      score: rec.score,
      metadata: rec.details ? { details: rec.details } : undefined,
    }))
  }

  async analyzePatterns(): Promise<AnalysisResult> {
    if (!this.profile) {
      throw new Error('프로필이 설정되지 않았습니다.')
    }

    if (this.recentRecords.length === 0) {
      return {
        patterns: { food: [], travel: [], exercise: [] },
        suggestions: ['기록을 더 추가해주시면 패턴을 분석할 수 있어요!'],
        insights: '아직 분석할 기록이 부족합니다.',
      }
    }

    const prompt = buildAnalysisPrompt(this.profile, this.recentRecords)
    return this.client.generateJSON<AnalysisResult>(prompt)
  }

  async processFeedback(
    recommendationName: string,
    liked: boolean,
    reason?: string
  ): Promise<FeedbackResult> {
    const prompt = buildFeedbackPrompt(recommendationName, liked, reason)
    return this.client.generateJSON<FeedbackResult>(prompt)
  }

  async chat(message: string): Promise<string> {
    if (!this.profile) {
      return '먼저 프로필을 설정해주세요!'
    }

    const systemContext = `당신은 "${this.profile.name}"님의 개인 라이프 에이전트입니다.
음식, 여행, 운동에 대한 맞춤 추천을 제공하고 대화합니다.
항상 친근하고 개인화된 응답을 제공하세요.`

    const messages: Array<{ role: 'user' | 'model'; content: string }> = [
      { role: 'user', content: systemContext },
      { role: 'model', content: `안녕하세요 ${this.profile.name}님! 무엇을 도와드릴까요?` },
      { role: 'user', content: message },
    ]

    return this.client.chat(messages)
  }
}
