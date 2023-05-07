"use strict";
const express = require('express');
const app = express();
app.set('puerto', 9999);
app.get('/', (request, response) => {
    response.send('GET - servidor NodeJS');
});
const fs = require('fs');
app.use(express.json());
const path_archivo = "./archivos/productos.txt";
const path_archivo_foto = "./archivos/productos_fotos.txt";
const multer = require('multer');
const mime = require('mime-types');
const storage = multer.diskStorage({
    destination: "public/fotos/",
});
const upload = multer({
    storage: storage
});
const mysql = require('mysql');
const myconn = require('express-myconnection');
const db_options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'alumnosapi'
};
app.use(myconn(mysql, db_options, 'single'));
const cors = require("cors");
app.use(cors());
app.use(express.static("public"));
app.get('/alumnos_bd', (request, response) => {
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select * from alumnos_tabla_api", (err, rows) => {
            if (err)
                throw ("Error en consulta de base de datos.");
            response.send(JSON.stringify(rows));
        });
    });
});
app.get('/alumnos_bd', (request, response) => {
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select * from alumnos_tabla_api", (err, rows) => {
            if (err)
                throw ("Error en consulta de base de datos.");
            response.send(JSON.stringify(rows));
        });
    });
});
app.post('/alumnos_bd', upload.single("archivo"), (request, response) => {
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = JSON.parse(request.body.obj);
    let path = file.destination + obj.legajo + "." + extension;
    fs.renameSync(file.path, path);
    obj.path = path.split("public/")[1];
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("insert into alumnos_tabla_api set ?", [obj], (err, rows) => {
            if (err) {
                console.log(err);
                throw ("Error en consulta de base de datos.");
            }
            response.send("alumno agregado a la bd.");
        });
    });
});
app.post('/alumnos_bd/modificar', upload.single("archivo"), (request, response) => {
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = JSON.parse(request.body.obj);
    let path = file.destination + obj.legajo + "." + extension;
    fs.renameSync(file.path, path);
    obj.path = path.split("public/")[1];
    let obj_modif = {};
    obj_modif.nombre = obj.nombre;
    obj_modif.apellido = obj.apellido;
    obj_modif.path = obj.path;
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("update alumnos_tabla_api set ? where legajo = ?", [obj_modif, obj.legajo], (err, rows) => {
            if (err) {
                console.log(err);
                throw ("Error en consulta de base de datos.");
            }
            response.send("alumno modificado en la bd.");
        });
    });
});
app.post('/alumnos_bd/eliminar', (request, response) => {
    let obj = request.body;
    let path_foto = "public/";
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select path from alumnos_tabla_api where legajo = ?", [obj.legajo], (err, result) => {
            if (err)
                throw ("Error en consulta de base de datos.");
            path_foto += result[0].path;
        });
    });
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("delete from alumnos_tabla_api where legajo = ?", [obj.legajo], (err, rows) => {
            if (err) {
                console.log(err);
                throw ("Error en consulta de base de datos.");
            }
            fs.unlink(path_foto, (err) => {
                if (err)
                    throw err;
                console.log(path_foto + ' fue borrado.');
            });
            response.send("alumno eliminado de la bd.");
        });
    });
});
app.listen(app.get('puerto'), () => {
    console.log('Servidor corriendo sobre puerto:', app.get('puerto'));
});
//# sourceMappingURL=servidor.js.map