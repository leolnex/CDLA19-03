import sql from 'mssql'

// Azure SQL Configuration
// En producción, usar variables de entorno
const config: sql.config = {
  server: process.env.AZURE_SQL_SERVER || 'databasecdlasql.database.windows.net',
  database: process.env.AZURE_SQL_DATABASE || 'cdladatabase',
  user: process.env.AZURE_SQL_USER || 'cdlasqladmin',
  password: process.env.AZURE_SQL_PASSWORD || '{Leonardo13leo}',
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
}

// Singleton pool
let pool: sql.ConnectionPool | null = null

export async function getConnection(): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) {
    return pool
  }
  
  try {
    pool = await sql.connect(config)
    console.log('[CDLA] Connected to Azure SQL Database')
    return pool
  } catch (error) {
    console.error('[CDLA] Error connecting to Azure SQL:', error)
    throw error
  }
}

export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.close()
    pool = null
    console.log('[CDLA] Azure SQL connection closed')
  }
}

// Helper para ejecutar queries con reconexión automática
export async function executeQuery<T>(
  queryFn: (pool: sql.ConnectionPool) => Promise<T>
): Promise<T> {
  try {
    const connection = await getConnection()
    return await queryFn(connection)
  } catch (error) {
    // Intentar reconectar una vez
    pool = null
    const connection = await getConnection()
    return await queryFn(connection)
  }
}

export { sql }
