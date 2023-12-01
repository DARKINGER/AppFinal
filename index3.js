
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
        const conn = await mysql.createConnection({host:'localhost', user:'admin', password:'Dima.zdla1', database:'hola'});
        const [rows, fields] = await conn.query('SELECT * FROM hola.alumnos');
        res.json(rows);
    }catch(err){
        // console.log(err);
        res.status(500).json({mensaje:err.sqlMessage});
        // res.json({mensaje:'Error de conexion'});
    }
});
/**
 * 
 */
app.get("/usuarios/error", async (req, res)=> {
    try{
        const conn = await mysql.createConnection({host:'localhost', user:'admin', password:'Dima.zdla1', database:'hola'});
        const [rows, fields] = await conn.query('SELECT * FRO hola.alumnos');
        res.json(rows);
    }catch(err){
        res.status(500).json({mensaje:err.sqlMessage});
    }
});

app.get("/usuarios/:id", async(req, res)=> {
    const parametros = req.params.id
    console.log(parametros);
    const conn = await mysql.createConnection({host:'localhost', user:'admin', password:'Dima.zdla1', database:'hola'});
    const [rows, fields] = await conn.query('SELECT * FROM hola.alumnos WHERE id='+req.params.id);
    if(rows.length==0){
        // res.status(404);
        res.status(404).json({mensaje:'usuario no existe'});
    }else{
        res.json(rows);
    }
});


app.delete("/usuarios", async(req, res)=> {
    console.log(req.query);
    try{
    const conn = await mysql.createConnection({host:'localhost', user:'admin', password:'Dima.zdla1', database:'hola'});
    const [rows, fields] = await conn.query(`delete FROM hola.alumnos WHERE id=+${req.query.id}`);
    res.json(rows);
    }catch(err){
        res.status(404).json({mensaje:err.sqlMessage})
    }
});


app.post("/usuarios", async(req, res)=> {
    try{
    const conn = await mysql.createConnection({host:'localhost', user:'admin', password:'Dima.zdla1', database:'hola'});
    const [rows, fields] = await conn.query(`INSERT INTO hola.alumnos (nombre, Ncontrol) values ("${req.query.nombre}", ${req.query.Ncontrol});`);
    res.json(rows);
    }catch(err){
        res.json({mensaje:err.sqlMessage})
    }
});
// INSERT INTO `hola`.`alumnos` (`nombre`, `Ncontrol`) VALUES ('kio', '8745');

app.put("/usuarios/upload", async(req, res)=>{
    try{
        const conn = await mysql.createConnection({host:'localhost', user:'admin', password:'Dima.zdla1', database:'hola'});
        
        // const objetoA = req.json.body;
        const objetoA = req.body;
        console.log(req.body);
        console.log(objetoA);
        
        let campos = Object.keys(objetoA);
        let valores = Object.values(objetoA);
        console.log(campos);
        // console.log(valores);
        
        let sentencia = "UPDATE hola.alumnos SET "
        let sentencia2 = ""
        let where = "WHERE (id = "
        
        

        campos.forEach(campo => {
        
            // console.log(campo)
        
            if(campo == "id"){
        
            for(i = 0; i<sentencia.length-2; i++ ) {

            sentencia2+=sentencia[i]
            }
            // console.log(sentencia2)
            where+=objetoA[campo]
            // console.log('///////////////////'+where);
            sentencia2 += " " + where +');'
            console.log(sentencia2)
            }
            else{
                if (campo == "nombre"){
                    sentencia += campo + ' = "' + objetoA[campo] + '", '
                }else{
                    sentencia += campo + ' = ' + objetoA[campo]+', '
                }
                // console.log('funciona')
            }
        });

        const [rows, fields] = await conn.query(sentencia2);

        res.json(rows);
        res.json({message:"se han actualizado los datos"});
        }catch(err){
            res.json({mensaje:err.sqlMessage})
        }
})//UPDATE `hola`.`alumnos` SET `nombre` = 'jesus', `Ncontrol` = '158' WHERE (`id` = '10');
//UPDATE `hola`.`alumnos` SET `nombre` = 'jesus' WHERE (`id` = '10');



//area de documentacion

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs",swaggerUI.serve,swaggerUI.setup(swaggerDocs,options));


app.use("/api-docs-json",(req, res)=>{
    res.json(swaggerDocs);
})

app.get(
    '/api-redoc',
    redoc({
        title: 'API Docs',
        specUrl: '/api-docs-json',
        nonce: '', // <= it is optional,we can omit this key and value
        redocOptions: {
        theme: {
            colors: {
            primary: {
                main: '#6EC5AB'
            }
            },
            typography: {
            fontFamily: `"museo-sans", 'Helvetica Neue', Helvetica, Arial, sans-serif`,
            fontSize: '15px',
            lineHeight: '1.5',
            code: {
                code: '#87E8C7',
                backgroundColor: '#4D4D4E'
            }
            },
            menu: {
            backgroundColor: '#ffffff'
            }
        }
        }
    })
);


app.listen(8085, ()=>{
    console.log("server express escuchando en el puerto 8085");
});


