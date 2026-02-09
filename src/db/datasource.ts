import * as dotenv from 'dotenv';
dotenv.config();
import { DataSource } from 'typeorm';
import path from 'path';

const __dirname = path.resolve('./');

console.log('Database configuration loaded from environment variables:');

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: ['dist/shared/entities/UserEntity.js', 'dist/shared/entities/*.js', 'dist/auth/entities/*.js'],
    migrations: ['dist/db/migrations/*.js'],
    synchronize: false,
    logging: true,
});

export = dataSource;