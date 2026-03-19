import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`[CDLA] Missing env var: ${name}`);
  return v;
}

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: requiredEnv("MYSQL_HOST"),
      user: requiredEnv("MYSQL_USER"),
      password: requiredEnv("MYSQL_PASSWORD"),
      database: requiredEnv("MYSQL_DATABASE"),
      port: Number(process.env.MYSQL_PORT ?? 3306),
      waitForConnections: true,
      connectionLimit: 10,
    });

    console.log("[CDLA] MySQL pool created");
  }

  return pool;
}

export async function executeQuery<T = any>(
  query: string,
  params: any[] = [],
): Promise<T> {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(query, params);
    return rows as T;
  } catch (error) {
    console.error("[CDLA] Query error:", error);
    throw error;
  }
}
