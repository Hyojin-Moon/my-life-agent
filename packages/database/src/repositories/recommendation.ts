import { prisma } from '../index'
import type { RecommendationType, Recommendation } from '@my-life-agent/shared'

export interface SavedRecommendation {
  id: string
  profileId: string
  type: RecommendationType
  name: string
  reason: string
  score: number
  context?: string
  createdAt: string
  feedback?: {
    liked: boolean
    reason?: string
  }
}

export class RecommendationRepository {
  async save(
    profileId: string,
    type: RecommendationType,
    recommendation: Recommendation,
    context?: string
  ): Promise<SavedRecommendation> {
    const saved = await prisma.recommendationHistory.create({
      data: {
        profileId,
        type,
        name: recommendation.name,
        reason: recommendation.reason,
        score: recommendation.score,
        context,
      },
      include: { feedback: true },
    })

    return this.mapToSavedRecommendation(saved)
  }

  async saveMany(
    profileId: string,
    type: RecommendationType,
    recommendations: Recommendation[],
    context?: string
  ): Promise<SavedRecommendation[]> {
    const results: SavedRecommendation[] = []

    for (const rec of recommendations) {
      const saved = await this.save(profileId, type, rec, context)
      results.push(saved)
    }

    return results
  }

  async findByProfileId(
    profileId: string,
    options?: {
      type?: RecommendationType
      limit?: number
    }
  ): Promise<SavedRecommendation[]> {
    const records = await prisma.recommendationHistory.findMany({
      where: {
        profileId,
        ...(options?.type ? { type: options.type } : {}),
      },
      include: { feedback: true },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
    })

    return records.map(this.mapToSavedRecommendation)
  }

  async addFeedback(
    profileId: string,
    recommendationId: string,
    liked: boolean,
    reason?: string
  ): Promise<void> {
    await prisma.feedback.create({
      data: {
        profileId,
        recommendationId,
        liked,
        reason,
      },
    })
  }

  async getFeedbackStats(profileId: string): Promise<{
    total: number
    liked: number
    disliked: number
    byType: Record<RecommendationType, { liked: number; disliked: number }>
  }> {
    const feedbacks = await prisma.feedback.findMany({
      where: { profileId },
      include: { recommendation: true },
    })

    const byType: Record<RecommendationType, { liked: number; disliked: number }> = {
      food: { liked: 0, disliked: 0 },
      travel: { liked: 0, disliked: 0 },
      exercise: { liked: 0, disliked: 0 },
    }

    let liked = 0
    let disliked = 0

    for (const fb of feedbacks) {
      const type = fb.recommendation.type as RecommendationType
      if (fb.liked) {
        liked++
        byType[type].liked++
      } else {
        disliked++
        byType[type].disliked++
      }
    }

    return {
      total: feedbacks.length,
      liked,
      disliked,
      byType,
    }
  }

  private mapToSavedRecommendation(record: any): SavedRecommendation {
    return {
      id: record.id,
      profileId: record.profileId,
      type: record.type as RecommendationType,
      name: record.name,
      reason: record.reason,
      score: record.score,
      context: record.context || undefined,
      createdAt: record.createdAt.toISOString(),
      feedback: record.feedback
        ? {
            liked: record.feedback.liked,
            reason: record.feedback.reason || undefined,
          }
        : undefined,
    }
  }
}
