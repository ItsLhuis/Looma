import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"

import * as schema from "./schema"

const client = new Database(process.env.DATABASE_URL)
const database = drizzle(client, { schema })

export { database, schema }
