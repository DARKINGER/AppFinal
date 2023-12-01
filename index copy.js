
const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { Stream } = require('stream');
const app = express();


var accesLogStream = fs.createWriteStream(path.join(__dirname, 'acces.Log'), {flags: 'a'});
app.use(morgan('combined', {stream: accesLogStream}));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

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

app.get("/usuarios/error", async (req, res)=> {
    try{
        const conn = await mysql.createConnection({host:'localhost', user:'admin', password:'Dima.zdla1', database:'hola'});
        const [rows, fields] = await conn.query('SELECT * FRO hola.alumnos');
        res.json(rows);
    }catch(err){
        // console.log(err);
        res.status(500).json({mensaje:err.sqlMessage});
        // res.json({mensaje:'Error de conexion'});
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
    // const parametros = req.params.id
    // console.log(parametros);
    console.log(req.query);
    try{
    const conn = await mysql.createConnection({host:'localhost', user:'admin', password:'Dima.zdla1', database:'hola'});
    const [rows, fields] = await conn.query(`delete FROM hola.alumnos WHERE id=+${req.query.id}`);
    // res.json(rows);
    res.json({message:"Se ha eliminado el usuario con id: "+ req.query.id})
    }catch(err){
        res.status(404).json({mensaje:err.sqlMessage})
    }
});


app.post("/usuarios", async(req, res)=> {
    // const parametros = req.params.id
    // console.log(parametros);
    // console.log(req.query.nombre);
    // console.log(req.query.Ncontrol);
    // console.log(req.query);
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

        let totCampos = 0;
        let count = 1;
        
        campos.forEach(campo =>{
            totCampos += 1
        })

        console.log(totCampos);

        campos.forEach(campo => {
        
            // console.log(campo)

            if(count == 1 && campo == 'id'){
                where+=objetoA[campo] + ");"
                count += 1;
            }else{

                if (campo == "nombre" && count < totCampos)
                {
                    sentencia += campo + ' = "' + objetoA[campo] + '", '
                    count += 1;
                }else if (campo == "nombre" && count < totCampos)
                {
                    sentencia += campo + ' = ' + objetoA[campo]+', '
                    count += 1;
                }else
                {
                    if(campo == "nombre"){
                        sentencia += campo + ' = "' + objetoA[campo]+'" '+where;
                    }else{
                        sentencia += campo + ' = ' + objetoA[campo]+' '+where;
                    }
                }

                
                // if(campo == "id"){
            
                // for(i = 0; i<sentencia.length-2; i++ ) {
    
                // sentencia2+=sentencia[i]
                // }
                // // console.log(sentencia2)
                // where+=objetoA[campo]
                // // console.log('///////////////////'+where);
                // sentencia2 += " " + where +');'
                // console.log(sentencia2)
                // }
                // else{
                //     if (campo == "nombre"){
                //         sentencia += campo + ' = "' + objetoA[campo] + '", '
                //     }else{
                //         sentencia += campo + ' = ' + objetoA[campo]+', '
                //     }
                //     // console.log('funciona')
                // }

            }
        
        });
        console.log(sentencia);
        // console.log('ya paso');
        // const [rows, fields] = await conn.query(`UPDATE hola.alumnos SET nombre = "${req.query.nombre}", 
        // Ncontrol = ${req.query.Ncontrol} WHERE id = ${req.query.id};`);

        const [rows, fields] = await conn.query(sentencia);

        // res.json(rows);
        res.json({message:"se han actualizado los datos"});
        }catch(err){
            res.json({mensaje:err.sqlMessage})
        }
})//UPDATE `hola`.`alumnos` SET `nombre` = 'jesus', `Ncontrol` = '158' WHERE (`id` = '10');
//UPDATE `hola`.`alumnos` SET `nombre` = 'jesus' WHERE (`id` = '10');



app.listen(8085, ()=>{
    console.log("server express escuchando en el puerto 8085");
});
