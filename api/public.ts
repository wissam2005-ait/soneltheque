import { handle } from '../server/core.js'
import { pgStore } from '../server/pg-store.js'

/** Vercel : mêmes règles que sur Netlify, données dans la base Neon (PostgreSQL). */
const run = (req: Request) => handle(req, pgStore, process.env.APP_PASSWORD)
export const GET = run
export const POST = run
export const OPTIONS = run
