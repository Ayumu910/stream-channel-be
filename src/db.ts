import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface AccountInput {
  mail_address: string;
  password: string;
}

async function createAccount(data: AccountInput) {
  const account = await prisma.account.create({
    data: {
      mail_address: data.mail_address,
      password: data.password,
    },
  });
  return account;
}

module.exports = { createAccount };