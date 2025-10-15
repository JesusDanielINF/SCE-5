import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';
import * as schema from '@shared/schema';

// Usa valor por defecto si no hay DATABASE_URL
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:Sce.2025@localhost:5432/sce';

export const pool = new Pool({ connectionString: DATABASE_URL });

export const testConnection = async (): Promise<void> => {
  let client;
  try {
    client = await pool.connect();
    console.log('Conectado a la base de datos PostgreSQL');
  } catch (err) {
    console.error('Error de conexión a la base de datos:', err.message);
    console.error('Verifica que PostgreSQL esté corriendo y que la cadena de conexión sea correcta.');
  } finally {
    if (client) client.release();
  }
};

export const queryDatabase = async (query: string, params: any[] = []): Promise<any> => {
  const client = await pool.connect();
  try {
    const res = await client.query(query, params);
    return res.rows;
  } catch (err) {
    console.error('Error al realizar la consulta', err);
    throw err;
  } finally {
    client.release();
  }
};

testConnection();