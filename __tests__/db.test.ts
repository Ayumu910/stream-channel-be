const { PrismaClient } = require('@prisma/client');
const { createAccount } = require('../src/db');

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.account.deleteMany(); // Clean up the database before running tests
});

afterAll(async () => {
  await prisma.$disconnect(); // Disconnect Prisma client after all tests are done
});

describe('createAccount', () => {
  test('creates a new account', async () => {
    const accountData = {
      mail_address: 'test@example.com',
      password: 'securePassword',
    };

    const account = await createAccount(accountData);

    expect(account).toHaveProperty('user_id');
    expect(account.mail_address).toBe(accountData.mail_address);
    expect(account.password).toBe(accountData.password);
  });
});
