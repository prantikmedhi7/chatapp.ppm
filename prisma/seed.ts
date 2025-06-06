import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Create some sample users
  const alice = await prisma.user.upsert({
    where: { username: "alice" },
    update: {},
    create: {
      username: "alice",
      isOnline: false,
    },
  })

  const bob = await prisma.user.upsert({
    where: { username: "bob" },
    update: {},
    create: {
      username: "bob",
      isOnline: false,
    },
  })

  const charlie = await prisma.user.upsert({
    where: { username: "charlie" },
    update: {},
    create: {
      username: "charlie",
      isOnline: false,
    },
  })

  console.log("Seeded users:", { alice, bob, charlie })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
