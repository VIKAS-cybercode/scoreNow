import pkg from 'pg';
import 'dotenv/config';


const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err));

export default pool;


// psql -U postgres (root user)
// psql -U user
// inside user
// \l to list databases
// \du to list users in postgres
// create user user1 with password '';
// create database db owner user '';
//drop command for delete
