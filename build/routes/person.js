"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const person_1 = __importDefault(require("../controllers/person"));
const config_1 = __importDefault(require("../config/config"));
const mssql_1 = require("mssql");
const router = express_1.default.Router();
router.get('/ping', person_1.default.serverHealthCheck);
// Create a connection pool to the MSSQL database
const pool = new mssql_1.ConnectionPool(config_1.default.data);
pool.connect((err) => {
    if (err) {
        console.log(`Error connecting to MSSQL database: ${err}`);
    }
    else {
        console.log('Connected to MSSQL database');
    }
});
// Define a route that queries the database
router.get('/persons', (req, res) => {
    const query = 'SELECT top 10 FROM Person';
    // Create a new SQL request
    const request = new mssql_1.Request(pool);
    request.query(query, (err, result) => {
        if (err) {
            console.log(`Error executing query: ${err}`);
            res.status(500).send('Internal server error');
        }
        else {
            res.send(result.recordset);
        }
    });
});
exports.default = router;
