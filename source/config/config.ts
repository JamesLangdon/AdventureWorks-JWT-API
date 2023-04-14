import dotenv from 'dotenv';
import sql from 'mssql';

dotenv.config();

const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME;
const SERVER_PORT = process.env.SERVER_PORT;

const SERVER = {
    hostname: SERVER_HOSTNAME,
    port: SERVER_PORT
};

const DATA = {
    server: process.env.SQL_SERVER as string,
    user: process.env.SQL_SERVER_USER,
    password: process.env.SQL_SERVER_PASSWORD,
    database: process.env.SQL_SERVER_DATABASE,
    trustServerCertificate: true
};

const config = {
    server: SERVER,
    data: DATA
};

export default config;
