
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
var conn =  mysql.createConnection({
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
        //const conn = await mysql.createConnection({host:'localhost', user:'admin', password:'Dima.zdla1', database:'hola'});
        // const [rows, fields] = await conn.query('SELECT * FROM hola.alumnos');
        res.json({host: HOST, user: USER, password:PASSWORD, database:DATABASE});
    } catch(err) {
        res.status(500).json({mensaje: err.sqlMessage});
    }
});

//2 espacios
/**
 * @swagger
 * /usuario/:
 *  get:
 *    tags:
 *      - usario
 *    sumamary: consultar todos los usuarios
 *    description: obtiene un Json conteniendo todos los usuarios de la BD
 *    responses:
 *      200:
 *        descripcion: Descripcion de una peticion get global a los usuarios.
 *     
 */
app.get("/usuarios", async (req, res)=> {
    try{
        conn = await mysql.createConnection({
            host:HOST, 
            user:USER, 
            password:PASSWORD, 
            database:DATABASE
        });
        const [rows, fields] = await conn.query('SELECT * FROM hola.alumnos');
        res.json(rows);
    }catch(err){
        console.log(err);
        // res.status(500).json({mensaje:err.sqlMessage});
        res.json({mensaje:'Error de conexion'});
    }
});
/**
 * @swagger
 * /usuarios/error:
 *   get:
 *     summary: Obtener todos los usuarios con posible error en la conexión a la base de datos.
 *     responses:
 *       200:
 *         description: Retorna la información de todos los usuarios.
 *       500:
 *         description: Error en la conexión a la base de datos.
 */
app.get("/usuarios/error", async (req, res)=> {
    try {
        //const conn = await mysql.createConnection({host:'localhost', user:'admin', password:'Dima.zdla1', database:'hola'});
        conn = await mysql.createConnection({
            host:HOST, 
            user:USER, 
            password:PASSWORD, 
            database:DATABASE
        });
        const [rows, fields] = await conn.query('SELEC * FROM hola.alumnos');
        res.json(rows);
    } catch(err) {
        res.status(500).json({mensaje: err.sqlMessage});
    }
});

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Obtener un usuario por su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID del usuario a obtener.
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Retorna la información del usuario.
 *       404:
 *         description: Usuario no encontrado.
 */
app.get("/usuarios/:id", async(req, res)=> {
    conn = await mysql.createConnection({
        host:HOST, 
        user:USER, 
        password:PASSWORD, 
        database:DATABASE
    });
    const parametros = req.params.id
    console.log(parametros);
    //const conn = await mysql.createConnection({host:'localhost', user:'admin', password:'Dima.zdla1', database:'hola'});
    const [rows, fields] = await conn.query('SELECT * FROM hola.alumnos WHERE id=' + req.params.id);
    if(rows.length == 0) {
        res.status(404).json({mensaje: 'Usuario no existe'});
    } else {
        res.json(rows);
    }
});

/**
 * @swagger
 * /usuarios:
 *   delete:
 *     summary: Eliminar un usuario por su ID.
 *     parameters:
 *       - in: query
 *         name: id
 *         description: ID del usuario a eliminar.
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente.
 *       404:
 *         description: Usuario no encontrado.
 */
app.delete("/usuarios", async(req, res)=> {
    console.log(req.query);
    try {
        conn = await mysql.createConnection({
            host:HOST, 
            user:USER, 
            password:PASSWORD, 
            database:DATABASE
        });
        //const conn = await mysql.createConnection({host:'localhost', user:'admin', password:'Dima.zdla1', database:'hola'});
        const [rows, fields] = await conn.query(`DELETE FROM hola.alumnos WHERE id=+${req.query.id}`);
        res.json(rows);
    } catch(err) {
        res.status(404).json({mensaje: err.sqlMessage})
    }
});

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Crear un nuevo usuario.
 *     parameters:
 *       - in: query
 *         name: nombre
 *         description: Nombre del nuevo usuario.
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: Ncontrol
 *         description: Número de control del nuevo usuario.
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario creado correctamente.
 *       400:
 *         description: Error en la solicitud.
 */
app.post("/usuarios", async(req, res)=> {
    try {
        conn = await mysql.createConnection({
            host:HOST, 
            user:USER, 
            password:PASSWORD, 
            database:DATABASE
        });
        //const conn = await mysql.createConnection({host:'localhost', user:'admin', password:'Dima.zdla1', database:'hola'});
        const [rows, fields] = await conn.query(`INSERT INTO hola.alumnos (nombre, Ncontrol) values ("${req.query.nombre}", ${req.query.Ncontrol});`);
        res.json(rows);
    } catch(err) {
        res.json({mensaje: err.sqlMessage})
    }
});

/**
 * @swagger
 * /usuarios/upload:
 *   put:
 *     summary: Actualizar datos de un usuario por su ID.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               nombre:
 *                 type: string
 *               Ncontrol:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Datos de usuario actualizados correctamente.
 *       400:
 *         description: Error en la solicitud.
 */
app.put("/usuarios/upload", async(req, res)=> {
    try {
        conn = await mysql.createConnection({
            host:HOST, 
            user:USER, 
            password:PASSWORD, 
            database:DATABASE
        });
        //const conn = await mysql.createConnection({host:'localhost', user:'admin', password:'Dima.zdla1', database:'hola'});
        const objetoA = req.body;
        console.log(req.body);
        console.log(objetoA);
        let campos = Object.keys(objetoA);
        let valores = Object.values(objetoA);
        console.log(campos);

        let sentencia = "UPDATE hola.alumnos SET "
        let sentencia2 = ""
        let where = "WHERE (id = "

        campos.forEach(campo => {
            if(campo == "id") {
                for(i = 0; i < sentencia.length-2; i++ ) {
                    sentencia2 += sentencia[i]
                }
                where += objetoA[campo]
                sentencia2 += " " + where + ');'
                console.log(sentencia2)
            } else {
                if (campo == "nombre") {
                    sentencia += campo + ' = "' + objetoA[campo] + '", '
                } else {
                    sentencia += campo + ' = ' + objetoA[campo] + ', '
                }
            }
        });

        const [rows, fields] = await conn.query(sentencia2);

        res.json({message: "Se han actualizado los datos"});
    } catch(err) {
        res.json({mensaje: err.sqlMessage})
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

