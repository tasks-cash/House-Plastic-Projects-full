/**
 * Seed default system users for development.
 * Run: pnpm seed
 */
import bcrypt from "bcryptjs";
import type { UserRole } from "../lib/constants";
import { connectDB } from "../lib/db";
import User from "../models/User";

const DEFAULT_PASSWORD = "1421998A";

const SEED_ACCOUNTS: {
  name: string;
  email: string;
  username: string;
  phone?: string;
  role: UserRole;
}[] = [
  {
    name: "Owner",
    email: "owner@tasks.cash",
    username: "owner",
    phone: "+213000000000",
    role: "owner",
  },
  {
    name: "Admin",
    email: "admin@tasks.cash",
    username: "admin",
    role: "admin",
  },
  {
    name: "Manager",
    email: "manager@tasks.cash",
    username: "manager",
    role: "manager",
  },
];

async function seed() {
  await connectDB();

  const password =
    process.env.SEED_PASSWORD ?? process.env.ADMIN_PASSWORD ?? DEFAULT_PASSWORD;
  const passwordHash = await bcrypt.hash(password, 12);

  for (const account of SEED_ACCOUNTS) {
    const existing = await User.findOne({
      $or: [{ email: account.email }, { username: account.username }],
    });

    if (existing) {
      existing.name = account.name;
      existing.email = account.email;
      existing.username = account.username;
      if (account.phone) existing.phone = account.phone;
      existing.role = account.role;
      existing.isActive = true;
      existing.passwordHash = passwordHash;
      await existing.save();
      console.log(`Updated ${account.role}: ${account.email} (${existing._id})`);
      continue;
    }

    const created = await User.create({
      name: account.name,
      email: account.email,
      username: account.username,
      phone: account.phone,
      passwordHash,
      role: account.role,
      isActive: true,
    });

    console.log(`Created ${account.role}: ${account.email} (${created._id})`);
  }

  console.log("\nSeed complete. Login examples (password: 1421998A):");
  console.log("  owner@tasks.cash | owner");
  console.log("  admin@tasks.cash | admin");
  console.log("  manager@tasks.cash | manager");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
