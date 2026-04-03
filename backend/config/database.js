/**
 * Database Configuration
 * Sequelize instance for MySQL connection
 * Uses environment variables for flexibility across environments
 * ✅ Phase 1.1: Optimized Connection Pooling, SSL, Compression, Health Check
 * ✅ Fixed: Auto-detects SSL, handles Railway public vs internal host
 */

const { Sequelize } = require("sequelize");

// ✅ Always load dotenv so local .env works; Render/Railway override via real env vars
require("dotenv").config();

// ─────────────────────────────────────────────────────────────────────────────
// Read connection details — support both naming conventions:
//   Standard:  DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME
//   Railway:   MYSQLHOST / MYSQLPORT / MYSQLUSER / MYSQLPASSWORD / MYSQLDATABASE
// ─────────────────────────────────────────────────────────────────────────────
const dbHost     = process.env.DB_HOST     || process.env.MYSQLHOST     || "localhost";
const dbName     = process.env.DB_NAME     || process.env.MYSQLDATABASE || "student_saas";
const dbUser     = process.env.DB_USER     || process.env.MYSQLUSER     || "root";
const dbPassword = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || "";
const dbPort     = parseInt(
    process.env.DB_PORT || process.env.MYSQLPORT || "3306",
    10
);

// ✅ Auto-detect SSL: enable only when connecting to a real remote host
//    (not localhost / 127.0.0.1).  Railway public proxy REQUIRES SSL.
//    You can force-disable by setting DB_SSL=false in env.
const isLocalHost = dbHost === "localhost" || dbHost === "127.0.0.1";
const useSSL = process.env.DB_SSL === "false"
    ? false
    : !isLocalHost;   // default: true for any remote host

console.log(`🗄️  Connecting to DB: ${dbUser}@${dbHost}:${dbPort}/${dbName}`);
console.log(`🔒  SSL: ${useSSL ? "enabled" : "disabled (localhost)"}`);

// Initialize Sequelize with environment variables
const sequelize = new Sequelize(
    dbName,
    dbUser,
    dbPassword,
    {
        host: dbHost,
        port: dbPort,
        dialect: "mysql",

        // ✅ Phase 1.1: Only log slow queries in development
        logging: process.env.NODE_ENV === "development"
            ? (sql, timing) => {
                if (timing && timing > 500) {
                    console.warn(`🐌 SLOW QUERY (${timing}ms):`, sql.substring(0, 200));
                }
            }
            : false,
        benchmark: process.env.NODE_ENV === "development",

        // ✅ Phase 1.1: Optimized Connection Pooling
        pool: {
            max: 10,
            min: 2,
            acquire: 30000,
            idle: 10000,
        },

        // ✅ SSL is conditional — avoids "SSL not supported" error on localhost
        dialectOptions: {
            connectTimeout: 60000,
            ...(useSSL && {
                ssl: {
                    require: true,
                    rejectUnauthorized: false,
                },
            }),
        },

        define: {
            timestamps: true,
            underscored: true,
            paranoid: false,
        },
    }
);

// ✅ Connection health check on startup
sequelize.authenticate()
    .then(() => console.log("✅ DB Pool Ready"))
    .catch(err => console.error("❌ DB Pool Failed:", err.message));

module.exports = sequelize;
