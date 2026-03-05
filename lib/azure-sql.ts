import sql from "mssql";

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`[CDLA] Missing env var: ${name}`);
  return v;
}

// Ensure the server hostname has the full Azure SQL domain
function getAzureSqlServer(): string {
  let server = requiredEnv("AZURE_SQL_SERVER");
  // If the server doesn't include the Azure domain, append it
  if (!server.includes('.database.windows.net')) {
    server = `${server}.database.windows.net`;
  }
  return server;
}

const config: sql.config = {
  server: getAzureSqlServer(),
  database: requiredEnv("AZURE_SQL_DATABASE"),
  user: requiredEnv("AZURE_SQL_USER"),
  password: requiredEnv("AZURE_SQL_PASSWORD"),
  port: Number(process.env.AZURE_SQL_PORT ?? 1433),

  // IMPORTANT: these go at the root (not inside options)SDFDSF
  connectionTimeout: 30_000,
  requestTimeout: 30_000,

  options: {
    encrypt: (process.env.AZURE_SQL_ENCRYPT ?? "true") === "true",
    trustServerCertificate:
      (process.env.AZURE_SQL_TRUST_CERT ?? "false") === "true",
    enableArithAbort: true,
  },

  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30_000,
  },
};

declare global {
  // eslint-disable-next-line no-var
  var __cdlaSqlPool: sql.ConnectionPool | undefined;
}

async function connectPool(): Promise<sql.ConnectionPool> {
  const pool = new sql.ConnectionPool(config);
  const connected = await pool.connect();

  connected.on("error", (e) => {
    console.error("[CDLA] Azure SQL pool error:", e);
  });

  console.log("[CDLA] Connected to Azure SQL Database");
  return connected;
}

export async function getConnection(): Promise<sql.ConnectionPool> {
  if (global.__cdlaSqlPool?.connected) return global.__cdlaSqlPool;

  global.__cdlaSqlPool = await connectPool();
  return global.__cdlaSqlPool;
}

// You generally shouldn't call this per-request in serverless.
// It's here for manual teardown or rare recovery.
export async function closeConnection(): Promise<void> {
  if (global.__cdlaSqlPool) {
    try {
      await global.__cdlaSqlPool.close();
    } finally {
      global.__cdlaSqlPool = undefined;
      console.log("[CDLA] Azure SQL connection closed");
    }
  }
}

// Helper to execute queries with a single retry on connection issues
export async function executeQuery<T>(
  queryFn: (pool: sql.ConnectionPool) => Promise<T>,
): Promise<T> {
  try {
    const connection = await getConnection();
    return await queryFn(connection);
  } catch (error) {
    console.error("[CDLA] Query failed, retrying once:", error);
    await closeConnection(); // force reconnect
    const connection = await getConnection();
    return await queryFn(connection);
  }
}
export async function testConnection(): Promise<{
  ok: boolean;
  server?: string;
  database?: string;
  error?: string;
}> {
  try {
    const pool = await getConnection();

    // Ping básico a la DB
    const r = await pool.request().query("SELECT 1 AS ok");

    const ok = r.recordset?.[0]?.ok === 1;

    return {
      ok,
      server: config.server as string,
      database: config.database as string,
    };
  } catch (e: any) {
    return {
      ok: false,
      error: e?.message ?? String(e),
    };
  }
}

export { sql };
