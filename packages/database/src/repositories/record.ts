import { prisma } from '../index'
import type { LifeRecord, RecordType, CreateRecordRequest, RecordStats } from '@my-life-agent/shared'

export class RecordRepository {
  async findById(id: string): Promise<LifeRecord | null> {
    const record = await prisma.record.findUnique({
      where: { id },
      include: { tags: true },
    })

    if (!record) return null

    return this.mapToLifeRecord(record)
  }

  async findByProfileId(
    profileId: string,
    options?: {
      type?: RecordType
      limit?: number
      offset?: number
    }
  ): Promise<{ records: LifeRecord[]; total: number }> {
    const where = {
      profileId,
      ...(options?.type ? { type: options.type } : {}),
    }

    const [records, total] = await Promise.all([
      prisma.record.findMany({
        where,
        include: { tags: true },
        orderBy: { date: 'desc' },
        take: options?.limit || 20,
        skip: options?.offset || 0,
      }),
      prisma.record.count({ where }),
    ])

    return {
      records: records.map(this.mapToLifeRecord),
      total,
    }
  }

  async create(
    profileId: string,
    data: CreateRecordRequest
  ): Promise<LifeRecord> {
    const record = await prisma.record.create({
      data: {
        profileId,
        type: data.type,
        title: data.title,
        description: data.description,
        rating: data.rating,
        location: data.location,
        date: data.date ? new Date(data.date) : new Date(),
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
        tags: data.tags
          ? {
              create: data.tags.map((tag) => ({ tag })),
            }
          : undefined,
      },
      include: { tags: true },
    })

    return this.mapToLifeRecord(record)
  }

  async update(
    id: string,
    data: Partial<CreateRecordRequest>
  ): Promise<LifeRecord | null> {
    // Update tags if provided
    if (data.tags) {
      await prisma.recordTag.deleteMany({ where: { recordId: id } })
      await prisma.recordTag.createMany({
        data: data.tags.map((tag) => ({ recordId: id, tag })),
      })
    }

    const record = await prisma.record.update({
      where: { id },
      data: {
        type: data.type,
        title: data.title,
        description: data.description,
        rating: data.rating,
        location: data.location,
        date: data.date ? new Date(data.date) : undefined,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      },
      include: { tags: true },
    })

    return this.mapToLifeRecord(record)
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.record.delete({ where: { id } })
      return true
    } catch {
      return false
    }
  }

  async getStats(profileId: string): Promise<RecordStats> {
    const records = await prisma.record.findMany({
      where: { profileId },
      include: { tags: true },
    })

    const byType: Record<RecordType, number> = {
      food: 0,
      travel: 0,
      exercise: 0,
      other: 0,
    }

    const tagCounts: Record<string, number> = {}
    let totalRating = 0
    let ratingCount = 0

    for (const record of records) {
      byType[record.type as RecordType]++

      if (record.rating) {
        totalRating += record.rating
        ratingCount++
      }

      for (const { tag } of record.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      }
    }

    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }))

    return {
      totalRecords: records.length,
      byType,
      topTags,
      averageRating: ratingCount > 0 ? totalRating / ratingCount : 0,
    }
  }

  private mapToLifeRecord(record: any): LifeRecord {
    return {
      id: record.id,
      type: record.type as RecordType,
      title: record.title,
      description: record.description || undefined,
      rating: record.rating || undefined,
      tags: record.tags?.map((t: any) => t.tag) || [],
      location: record.location || undefined,
      date: record.date.toISOString().split('T')[0],
      metadata: record.metadata ? JSON.parse(record.metadata) : undefined,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    }
  }
}
