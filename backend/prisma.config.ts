import { defineConfig } from "prisma/config";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default defineConfig({
  migrations: {
    seed: "ts-node prisma/seed.ts",
  },
});