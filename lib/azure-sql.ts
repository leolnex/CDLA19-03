// lib/azure-sql.ts
import sql from "mssql";

function env(name: string): string | undefined {
  const v = process.env[name];
  return typeof v === "string" ? v.trim() : undefined;
}

function requiredEnv(name: string): string {
  const v = env(name);
  if (!v) {
    throw new Error(
      `[CDLA] Missing env var: ${name}. ` +
      `Define it in your deployment environment (v0.app / Vercel Project Settings → Environment Variables).`,
    );
  }
  return v;
}

/**
 * Normaliza AZURE_SQL_SERVER para soportar formatos comunes:
 * - "databasecdlasql"
 * - "databasecdlasql.database.windows.net"
 * - "tcp:databasecdlasql.database.windows.net,1433"
 * - "databasecdlasql.database.windows.net:1433"
 * - "databasecdlasql.database.windows.net,1433"
 */
function normalizeAzureSqlServer(raw: string): string {
  let server = raw.trim();

  // Quitar prefijos comunes (tcp:, protocol)
  server = server.replace(/^tcp:/i, "");
  server = server.replace(/^https?:\/\//i, "");

  // Si viene con puerto tipo host:1433
  if (server.includes(":")) {
    const [host, port] = server.split(":");
    // si lo que viene después es numérico, descártalo (usamos "port" aparte)
    if (/^\d+$/.test(port || "")) server = host;
  }

  // Si viene con coma tipo host,1433 (ADO.NET)
  if (server.includes(",")) {
    server = server.split(",")[0]!.trim();
  }

  // Si el usuario puso solo el nombre (sin dominio), agrega el dominio de Azure SQL
  if (!server.includes(".")) {
    server = `${server}.database.windows.net`;
  }

  // Si no incluye el dominio de Azure SQL, pero sí tiene puntos, solo valida (no forzamos)
  // (si tuvieras un proxy/host distinto, esto no lo rompe)
  return server;
}

function getConfig(): sql.config {
  const serverRaw = requiredEnv("AZURE_SQL_SERVER");
  const server = normalizeAzureSqlServer(serverRaw);

  const database = requiredEnv("AZURE_SQL_DATABASE");
  const user = requiredEnv("AZURE_SQL_USER");
  const password = requiredEnv("AZURE_SQL_PASSWORD");

  const port = Number(env("AZURE_SQL_PORT") ?? 1433);
  const encrypt = (env("AZURE_SQL_ENCRYPT") ?? "true") === "true";
  const trustServerCertificate =
    (env("AZURE_SQL_TRUST_CERT") ?? "false") === "true";

  // Log seguro (sin credenciales)
  console.log("[CDLA] Connecting to Azure SQL:", { server, database, port });

  return {
    server,
    database,
    user,
    password,
    port,

    // mssql usa "connectionTimeout" y "requestTimeout"
    connectionTimeout: 30_000,
    requestTimeout: 30_000,

    options: {
      encrypt,
      trustServerCertificate,
      enableArithAbort: true,
    },

    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30_000,
    },
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __cdlaSqlPool: sql.ConnectionPool | undefined;
  // eslint-disable-next-line no-var
  var __cdlaSqlPoolPromise: Promise<sql.ConnectionPool> | undefined;
}

async function connectPool(): Promise<sql.ConnectionPool> {
  const config = getConfig();

  const pool = new sql.ConnectionPool(config);

  const connected = await pool.connect();

  connected.on("error", (e) => {
    console.error("[CDLA] Azure SQL pool error:", e);
  });

  console.log("[CDLA] Connected to Azure SQL Database");
  return connected;
}

export async function getConnection(): Promise<sql.ConnectionPool> {
  // Reutiliza pool conectado
  if (global.__cdlaSqlPool?.connected) return global.__cdlaSqlPool;

  // Evita conexiones paralelas (muy común en Next dev / serverless)
  if (global.__cdlaSqlPoolPromise) return global.__cdlaSqlPoolPromise;

  global.__cdlaSqlPoolPromise = (async () => {
    try {
      const pool = await connectPool();
      global.__cdlaSqlPool = pool;
      return pool;
    } finally {
      // limpia la promesa (éxito o fallo)
      global.__cdlaSqlPoolPromise = undefined;
    }
  })();

  return global.__cdlaSqlPoolPromise;
}

export async function closeConnection(): Promise<void> {
  if (global.__cdlaSqlPool) {
    try {
      await global.__cdlaSqlPool.close();
    } catch (e) {
      console.error("[CDLA] Error closing Azure SQL connection:", e);
    } finally {
      global.__cdlaSqlPool = undefined;
      global.__cdlaSqlPoolPromise = undefined;
      console.log("[CDLA] Azure SQL connection closed");
    }
  } else {
    global.__cdlaSqlPoolPromise = undefined;
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
    await closeConnection(); // fuerza reconexión
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

    const r = await pool.request().query("SELECT 1 AS ok");
    const ok = r.recordset?.[0]?.ok === 1;

    const cfg = getConfig();
    return {
      ok,
      server: cfg.server as string,
      database: cfg.database as string,
    };
  } catch (e: any) {
    return {
      ok: false,
      error: e?.message ?? String(e),
    };
  }
}

export { sql };