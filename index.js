const cors= require('cors')
const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { Stream } = require('stream');
const app = express();

const redoc = require('redoc-express')
// const cores = require('cores')

const request = require('supertest');//-----------------------SUPERTEST-----------------------
const {PORT, HOST, USER, PASSWORD, DATABASE} = require('./config');
// import { PORT,HOST,USER,PASSWORD,DATABASE, PORT } from './config';
var con =  mysql.createConnection({
    host:HOST, 
    user:USER, 
    password:PASSWORD, 
    database:DATABASE
});
// const PORT=PORT

// const conn = await mysql.createConnection({
//     host:process.env.HOST || 'localhost', 
//     user:process.env.USER || 'admin', 
//     password:process.env.PASSWORD || 'Dima.zdla1', 
//     database:process.env.DATABASE || 'hola'
// });
// const PORT=process.env.PORT || 8085


const swaggerUI = require('swagger-ui-express')
const swaggerJsDoc = require('swagger-jsdoc')
const { SwaggerTheme } = require('swagger-themes');

const theme = new SwaggerTheme('v3');

const options = {
    explorer: true,
    customCss: theme.getBuffer('monokai')
};


var accesLogStream = fs.createWriteStream(path.join(__dirname, 'acces.Log'), {flags: 'a'});
app.use(morgan('combined', {stream: accesLogStream}));
app.use(cors());

//referente a el swagger fuera de index.js
const data = fs.readFileSync(path.join(__dirname,'./swagger.json'),{encoding:'utf8',flag:'r'})
const read = fs.readFileSync(path.join(__dirname,'./README.md'),{encoding:'utf8',flag:'r'})

// console.log(data)
const defObj = JSON.parse(data);
defObj.info.description = read;
const swaggerOptions = {
    definition:defObj,
    "apis": [`${path.join(__dirname,"index.js")}`]
}

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get("/info", async (req, res)=> {
    try {
        // const conn = await mysql.createConnection({host:'localhost', user:'admin', password:'Dima.zdla1', database:'hola'});
        // const [rows, fields] = await conn.query('SELECT * FROM hola.alumnos');
        res.json({host: HOST, user: USER, password:PASSWORD, database:DATABASE});
    } catch(err) {
        res.status(500).json({mensaje: err.sqlMessage});
    }
});

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use("/api-docs-json", (req, res)=>{
    res.json(swaggerDocs);
});

// Documentación con Redoc
app.get(
    '/api-redoc',
    redoc({
        title: 'API Docs',
        specUrl: '/api-docs-json',
    })
);

// Iniciar el servidor
app.listen(PORT, ()=> {
    // console.log("Server express escuchando en el puerto 8085");
    console.log(`Server express escuchando en el puerto ${PORT}`);
});

