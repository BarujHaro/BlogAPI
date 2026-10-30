import "dotenv/config";

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  engine: "classic",
  schema: "prisma/schema.prisma",
  generator: {
    provider: 'prisma-client-js',
    output: '../generated/prisma'
  },
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});