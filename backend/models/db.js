import pkg from 'pg';
import 'dotenv/config';

const { Pool } = pkg;

let pool;

try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Uncomment if using remote DB like Render or Railway
    // ssl: {
    //   rejectUnauthorized: false
    // }
  });

  pool.connect()
    .then(() => console.log(' Connected to PostgreSQL'))
    .catch(err => {
      console.error('❌ Connection error:', err.message);
      // Optionally retry logic or graceful exit
    });

  // Handle idle client errors
  pool.on('error', (err) => {
    console.error('❗ Unexpected error on idle client', err);
  });

} catch (err) {
  console.error('❌ Pool initialization failed:', err.message);
}

export default pool;
