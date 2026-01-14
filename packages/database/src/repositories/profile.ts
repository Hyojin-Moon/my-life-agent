import { prisma } from '../index'
import type { UserProfile, UserPreferences, UserRoutines } from '@my-life-agent/shared'

export class ProfileRepository {
  async findById(id: string): Promise<UserProfile | null> {
    const profile = await prisma.profile.findUnique({
      where: { id },
      include: {
        preferences: true,
        routines: true,
      },
    })

    if (!profile) return null

    return this.mapToUserProfile(profile)
  }

  async findFirst(): Promise<UserProfile | null> {
    const profile = await prisma.profile.findFirst({
      include: {
        preferences: true,
        routines: true,
      },
    })

    if (!profile) return null

    return this.mapToUserProfile(profile)
  }

  async create(data: {
    name: string
    location?: string
    preferences?: Partial<UserPreferences>
    routines?: Partial<UserRoutines>
  }): Promise<UserProfile> {
    const profile = await prisma.profile.create({
      data: {
        name: data.name,
        location: data.location,
        routines: data.routines
          ? {
              create: data.routines,
            }
          : undefined,
      },
      include: {
        preferences: true,
        routines: true,
      },
    })

    // Add preferences
    if (data.preferences) {
      await this.updatePreferences(profile.id, data.preferences)
    }

    return this.findById(profile.id) as Promise<UserProfile>
  }

  async update(
    id: string,
    data: {
      name?: string
      location?: string
    }
  ): Promise<UserProfile | null> {
    const profile = await prisma.profile.update({
      where: { id },
      data,
      include: {
        preferences: true,
        routines: true,
      },
    })

    return this.mapToUserProfile(profile)
  }

  async updatePreferences(
    profileId: string,
    preferences: Partial<UserPreferences>
  ): Promise<void> {
    const categories = ['food', 'travel', 'exercise', 'allergies', 'dislikes'] as const

    for (const category of categories) {
      const values = preferences[category]
      if (!values) continue

      // Delete existing preferences for this category
      await prisma.preference.deleteMany({
        where: { profileId, category },
      })

      // Create new preferences
      if (values.length > 0) {
        await prisma.preference.createMany({
          data: values.map((value) => ({
            profileId,
            category,
            value,
          })),
        })
      }
    }
  }

  async updateRoutines(
    profileId: string,
    routines: Partial<UserRoutines>
  ): Promise<void> {
    await prisma.routine.upsert({
      where: { profileId },
      create: {
        profileId,
        ...routines,
      },
      update: routines,
    })
  }

  private mapToUserProfile(profile: any): UserProfile {
    const preferences: UserPreferences = {
      food: [],
      travel: [],
      exercise: [],
      allergies: [],
      dislikes: [],
    }

    for (const pref of profile.preferences || []) {
      const category = pref.category as keyof UserPreferences
      if (preferences[category]) {
        preferences[category].push(pref.value)
      }
    }

    return {
      id: profile.id,
      name: profile.name,
      location: profile.location || undefined,
      preferences,
      routines: {
        wakeUpTime: profile.routines?.wakeUpTime || undefined,
        sleepTime: profile.routines?.sleepTime || undefined,
        workSchedule: profile.routines?.workSchedule || undefined,
        exerciseTime: profile.routines?.exerciseTime || undefined,
      },
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    }
  }
}
