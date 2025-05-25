// packages/database/src/seed/seedTournaments.ts
import {
  PrismaClient,
  User,
  Game,
  TournamentStatus,
  Role as PrismaRoleEnum,
  Prisma,
} from '../../client' // Your import path
import { faker } from '@faker-js/faker'

export async function seedTournaments(
  prisma: PrismaClient,
  users: User[],
  games: Game[],
  adminUser?: User
): Promise<void> {
  console.log('🌱 Seeding Tournaments...')

  if (!games || games.length === 0) {
    console.warn('⚠️ No games available. Skipping tournament seeding.')
    return
  }
  if (!users || users.length === 0) {
    console.warn('⚠️ No users available. Skipping tournament seeding.')
    return
  }

  const anAdminUser = adminUser || users.find((u) => u.role === PrismaRoleEnum.ADMIN)

  if (!anAdminUser) {
    console.warn('⚠️ No admin user found. Skipping tournament seeding.')
    return
  }

  const now = new Date()

  const tournamentDataTemplates = [
    {
      titleBase: 'Points Showdown',
      descriptionBase: 'Climb the ranks by earning points!',
      status: TournamentStatus.ACTIVE,
      targetScore: null,
      durationHours: 4, // Tournament ends 4 hours from its start time
    },
    {
      titleBase: 'Weekend Warrior Cup',
      descriptionBase: 'Battle it out over the weekend for the top spot.',
      status: TournamentStatus.PENDING,
      targetScore: 100000,
      startsInDays: 2, // Starts in 2 days
      durationDays: 2, // Lasts for 2 days
    },
    {
      titleBase: 'Legends Invitational (Past)',
      descriptionBase: 'A legendary tournament from our archives.',
      status: TournamentStatus.COMPLETED,
      targetScore: 75000,
      endedDaysAgo: 3, // Ended 3 days before now
      durationDays: 3, // Lasted for 3 days
    },
    {
      titleBase: 'Flash Frenzy',
      descriptionBase: 'A quick, high-stakes tournament. Only 1 hour!',
      status: TournamentStatus.ACTIVE,
      targetScore: null,
      durationHours: 1, // Ends 1 hour from its start time
    },
  ]

  const createdTournaments = []

  for (let i = 0; i < tournamentDataTemplates.length; i++) {
    const template = tournamentDataTemplates[i]
    let startTime, endTime

    if (template.status === TournamentStatus.ACTIVE) {
      // For an active tournament, start it sometime recently and ensure it's ongoing
      const hoursAgoStarted = faker.number.int({ min: 0, max: (template.durationHours || 1) - 1 }) // Start between now and (duration - 1hr) ago
      startTime = new Date(now.getTime() - hoursAgoStarted * 60 * 60 * 1000)
      endTime = new Date(startTime.getTime() + (template.durationHours || 24) * 60 * 60 * 1000)
    } else if (template.status === TournamentStatus.PENDING) {
      startTime = new Date(
        now.getTime() +
          (template.startsInDays || 1) * 24 * 60 * 60 * 1000 +
          faker.number.int({ min: 1, max: 12 }) * 60 * 60 * 1000
      ) // Add some random hours too
      endTime = new Date(startTime.getTime() + (template.durationDays || 1) * 24 * 60 * 60 * 1000)
    } else {
      // COMPLETED
      endTime = new Date(
        now.getTime() -
          (template.endedDaysAgo || 1) * 24 * 60 * 60 * 1000 -
          faker.number.int({ min: 1, max: 12 }) * 60 * 60 * 1000
      )
      startTime = new Date(endTime.getTime() - (template.durationDays || 2) * 24 * 60 * 60 * 1000)
    }

    const uniqueTitle = `${template.titleBase} #${i + 1} (${faker.word.adjective()})`

    const selectedGamesForTournament = faker.helpers.arrayElements(
      games,
      faker.number.int({ min: Math.min(2, games.length), max: Math.min(5, games.length) })
    )

    const tournamentInput: Prisma.TournamentCreateInput = {
      name: uniqueTitle,
      description: `${template.descriptionBase} Sponsored by ${faker.company.name()}.`,
      startTime: startTime,
      endTime: endTime,
      status: template.status,
      targetScore: template.targetScore,
      createdBy: {
        connect: { id: anAdminUser.id },
      },
      eligibleGames: {
        create: selectedGamesForTournament.map((game) => ({
          gameId: game.id,
          pointMultiplier: faker.helpers.arrayElement([1.0, 1.25, 1.5, 1.75, 2.0]),
        })),
      },
      rewards: {
        create: [
          {
            rank: 1,
            description: `${faker.number.int({ min: 1000, max: 5000 })} Super Coins + Trophy Icon`,
          },
          { rank: 2, description: `${faker.number.int({ min: 500, max: 2000 })} Super Coins` },
          { rank: 3, description: `${faker.number.int({ min: 250, max: 1000 })} Super Coins` },
          { rank: 4, description: `${faker.number.int({ min: 100, max: 500 })} Basic Coins` },
          { rank: 5, description: `${faker.number.int({ min: 50, max: 250 })} Basic Coins` },
        ],
      },
    }

    try {
      const tournament = await prisma.tournament.create({
        data: tournamentInput,
      })
      createdTournaments.push(tournament)
      console.log(
        `🏆 Created tournament: ${tournament.name} (Status: ${tournament.status}) (Ends: ${tournament.endTime?.toLocaleString()})`
      )

      if (
        (template.status === TournamentStatus.ACTIVE ||
          template.status === TournamentStatus.COMPLETED) &&
        users.length > 1
      ) {
        const numParticipants = faker.number.int({
          min: Math.min(1, users.length - 1),
          max: Math.min(15, users.length - 1),
        })
        const potentialParticipants = users.filter((u) => u.id !== anAdminUser.id)
        const participantsForTournament = faker.helpers.arrayElements(
          potentialParticipants,
          numParticipants
        )

        for (const pUser of participantsForTournament) {
          let totalScore = 0
          const gamePlays: Prisma.TournamentGamePlayCreateWithoutTournamentParticipantInput[] = []
          const numGamePlaySets = faker.number.int({
            min: 1,
            max: selectedGamesForTournament.length,
          })

          const gamesPlayedThisTournament = faker.helpers.arrayElements(
            selectedGamesForTournament,
            numGamePlaySets
          )

          const actualEndTime = endTime || now // Use 'now' if endTime is null (should not happen for COMPLETED/ACTIVE)

          for (const playedGame of gamesPlayedThisTournament) {
            const numPlaysInGame = faker.number.int({ min: 1, max: 5 })
            for (let k = 0; k < numPlaysInGame; k++) {
              const pointsEarned = faker.number.int({
                min: 10,
                max: template.targetScore ? template.targetScore / 10 : 2000,
              })
              totalScore += pointsEarned
              gamePlays.push({
                gameId: playedGame.id,
                pointsEarned: pointsEarned,
                playedAt: faker.date.between({ from: startTime, to: actualEndTime }),
              })
            }
          }

          if (
            template.status === TournamentStatus.COMPLETED &&
            template.targetScore &&
            totalScore > template.targetScore
          ) {
            totalScore = faker.number.int({
              min: template.targetScore / 2,
              max: template.targetScore,
            })
          }

          await prisma.tournamentParticipant.create({
            data: {
              tournamentId: tournament.id,
              userId: pUser.id,
              score: totalScore,
              joinedAt: faker.date.between({ from: startTime, to: actualEndTime }),
              gamePlays: {
                create: gamePlays,
              },
            },
          })
        }
        console.log(
          `👥 Added ${participantsForTournament.length} participants to ${tournament.name}`
        )
      }
    } catch (e) {
      console.error(`❌ Error creating tournament "${template.titleBase}":`, e)
    }
  }
  console.log(`🌱 Seeded ${createdTournaments.length} tournaments in total.`)
}
