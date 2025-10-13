require('dotenv').config(); // Load environment variables

const buildConfig = () => {
  const baseConfig = {
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT || 5432),
    dialect: process.env.DB_DIALECT || 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
      keepAlive: true,
      keepAliveInitialDelayMillis: 5000,
    },
    pool: {
      max: Number(process.env.DB_POOL_MAX || 5),
      min: 0,
      acquire: Number(process.env.DB_POOL_ACQUIRE || 30000),
      idle: Number(process.env.DB_POOL_IDLE || 10000),
      evict: Number(process.env.DB_POOL_EVICT || 1000),
    },
  };

  const connectionVarName = process.env.DATABASE_URL
    ? 'DATABASE_URL'
    : process.env.NEON_DB_URL
    ? 'NEON_DB_URL'
    : null;

  if (connectionVarName) {
    baseConfig.use_env_variable = connectionVarName;
  }

  return baseConfig;
};

module.exports = {
  development: buildConfig(),
  test: buildConfig(),
  production: buildConfig(),
};
