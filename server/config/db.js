import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const pgsql = neon(process.env.DATABASE_URL);

export default pgsql;
