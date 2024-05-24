import { PrismaPg } from '@prisma/adapter-pg';
import { automaticCheck } from './Discord_Bot/AutomaticMessages/automaticCheck.js';
import { startBot } from './Discord_Bot/bot.js';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';

const { Pool } = pg;

const connectionString = `${process.env.DATABASE_URL}`;

console.log(`Connecting to database at ${connectionString}`);

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

export const client = await startBot();

automaticCheck();
