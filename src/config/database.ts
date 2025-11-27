/**
 * Re-export database configuration from root config/database.ts
 *
 * This file exists to support imports from src/services/*.ts files
 * that use relative imports like '../../config/database'
 */
export * from '../../config/database';
