require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email     = process.env.ADMIN_EMAIL;
  const password  = process.env.ADMIN_PASSWORD;
  const firstName = process.env.ADMIN_FIRST_NAME;
  const lastName  = process.env.ADMIN_LAST_NAME;

  if (!email || !password || !firstName || !lastName) {
    console.error("Missing ADMIN_* variables in .env — check ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FIRST_NAME, ADMIN_LAST_NAME");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const admin = await prisma.user.create({
    data: { firstName, lastName, email, password: hashed, role: "ADMIN" },
  });

  console.log(`Admin created: ${admin.firstName} ${admin.lastName} <${admin.email}>`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
