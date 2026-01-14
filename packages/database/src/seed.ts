import { prisma } from './index'

async function main() {
  console.log('Seeding database...')

  // Create a sample profile
  const profile = await prisma.profile.create({
    data: {
      name: '사용자',
      location: '서울시 강남구',
      routines: {
        create: {
          wakeUpTime: '07:00',
          sleepTime: '23:00',
          exerciseTime: '18:00',
        },
      },
    },
  })

  // Add preferences
  const preferences = [
    { category: 'food', values: ['한식', '이탈리안', '매운음식'] },
    { category: 'travel', values: ['자연', '도시', '휴양'] },
    { category: 'exercise', values: ['러닝', '헬스', '수영'] },
    { category: 'allergies', values: ['갑각류'] },
  ]

  for (const pref of preferences) {
    for (const value of pref.values) {
      await prisma.preference.create({
        data: {
          profileId: profile.id,
          category: pref.category,
          value,
        },
      })
    }
  }

  // Create sample records
  const records = [
    {
      type: 'food',
      title: '강남 이탈리안 레스토랑',
      description: '트러플 크림 파스타가 정말 맛있었다',
      rating: 5,
      date: new Date('2024-01-15'),
      tags: ['이탈리안', '파스타', '강남'],
    },
    {
      type: 'exercise',
      title: '한강 러닝 10km',
      description: '날씨가 좋아서 기분 좋게 뛰었다',
      rating: 4,
      date: new Date('2024-01-14'),
      tags: ['러닝', '한강', '10km'],
    },
    {
      type: 'travel',
      title: '제주도 올레길',
      description: '7코스 걸었는데 경치가 너무 좋았다',
      rating: 5,
      date: new Date('2024-01-10'),
      tags: ['제주도', '올레길', '트레킹'],
    },
  ]

  for (const rec of records) {
    await prisma.record.create({
      data: {
        profileId: profile.id,
        type: rec.type,
        title: rec.title,
        description: rec.description,
        rating: rec.rating,
        date: rec.date,
        tags: {
          create: rec.tags.map((tag) => ({ tag })),
        },
      },
    })
  }

  console.log('Seeding completed!')
  console.log(`Created profile: ${profile.id}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
