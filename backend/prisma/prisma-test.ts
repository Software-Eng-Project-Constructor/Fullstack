// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.user.create({
    data: {
      id: "43f75b49-b3eb-497b-a559-0fc92e3e7b76",
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword" // use hash in real app
    }
  })
}

main().finally(() => prisma.$disconnect())
