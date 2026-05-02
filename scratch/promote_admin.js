const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function promoteToAdmin(email) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });
    console.log(`User ${email} promoted to ADMIN successfully!`);
    console.log(user);
  } catch (error) {
    console.error('Error promoting user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
if (!email) {
  console.log('Please provide an email: node promote_admin.js your-email@gmail.com');
} else {
  promoteToAdmin(email);
}
