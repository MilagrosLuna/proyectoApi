// #region INICIO SERVER Y CONFIGS
const express = require('express');
const app = express();
app.set('puerto', 9999);
app.get('/', (request:any, response:any)=>{
    response.send('GET - servidor NodeJS');
});

//AGREGO FILE SYSTEM
const fs = require('fs');
//AGREGO JSON
app.use(express.json());
//INDICO RUTA HACIA EL ARCHIVO
const path_archivo = "./archivos/productos.txt";
//INDICO RUTA PARA EL ARCHIVO PRODUCTOS-FOTOS
const path_archivo_foto = "./archivos/productos_fotos.txt";

//AGREGO MULTER
const multer = require('multer');
//AGREGO MIME-TYPES
const mime = require('mime-types');
//AGREGO STORAGE
const storage = multer.diskStorage({
    destination: "public/fotos/",
});
const upload = multer({
    storage: storage
});

//AGREGO MYSQL y EXPRESS-MYCONNECTION
const mysql = require('mysql');
const myconn = require('express-myconnection');
const db_options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'alumnosapi'
};

//AGREGO MW 
app.use(myconn(mysql, db_options, 'single'));// el 3 parametro es forma de conexion simple o multiple

//AGREGO CORS (por default aplica a http://localhost)
const cors = require("cors");
// el cors es para los servidores cruzados
//AGREGO MW 
app.use(cors());

/*
let listaBlanca = ["http://localhost", "http://127.0.0.1", "http://mi_host.com"];

let corsOptions = {
    origin: (origin:any, callback:any)=>{
        if(listaBlanca.indexOf(origin) != -1)
            callback(null, true);
        else
            callback(new Error("no permitido por CORS."));
    }
}
routes.get("/", cors(corsOptions), (request:any, response:any)=>{
    response.send("Solo accedia si se encuentra en la 'lista blanca'");
});
*/

//DIRECTORIO DE ARCHIVOS ESTÁTICOS
app.use(express.static("public"));
//LISTAR
app.get('/alumnos_bd', (request:any, response:any)=>{

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("select * from alumnos_tabla_api", (err:any, rows:any)=>{

            if(err) throw("Error en consulta de base de datos.");

            //response.json(rows);
            response.send(JSON.stringify(rows));
        });
    });

});
// #endregion
//LISTAR
app.get('/alumnos_bd', (request:any, response:any)=>{

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("select * from alumnos_tabla_api", (err:any, rows:any)=>{

            if(err) throw("Error en consulta de base de datos.");

            //response.json(rows);
            response.send(JSON.stringify(rows));
        });
    });

});
//AGREGAR
app.post('/alumnos_bd', upload.single("archivo"), (request:any, response:any)=>{
   
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = JSON.parse(request.body.obj);
    let path : string = file.destination + obj.legajo + "." + extension;

    fs.renameSync(file.path, path);// la renombras y la alojas en el path q vos dijiste

    obj.path = path.split("public/")[1];

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");
                                                    // obj tiene q ser un array
        conn.query("insert into alumnos_tabla_api set ?", [obj], (err:any, rows:any)=>{

            if(err) {console.log(err); throw("Error en consulta de base de datos.");}

            response.send("alumno agregado a la bd.");
        });
    });
});

//MODIFICAR
app.post('/alumnos_bd/modificar', upload.single("archivo"), (request:any, response:any)=>{
    
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = JSON.parse(request.body.obj);
    let path : string = file.destination + obj.legajo + "." + extension;

    fs.renameSync(file.path, path);

    obj.path = path.split("public/")[1];

    let obj_modif : any = {};
    //para excluir la pk (codigo)
    obj_modif.nombre = obj.nombre;
    obj_modif.apellido = obj.apellido;
    obj_modif.path = obj.path;

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("update alumnos_tabla_api set ? where legajo = ?", [obj_modif, obj.legajo], (err:any, rows:any)=>{

            if(err) {console.log(err); throw("Error en consulta de base de datos.");}

            response.send("alumno modificado en la bd.");
        });
    });
});

//ELIMINAR
app.post('/alumnos_bd/eliminar', (request:any, response:any)=>{
   
    let obj = request.body;
    let path_foto : string = "public/";

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        //obtengo el path de la foto del producto a ser eliminado
        conn.query("select path from alumnos_tabla_api where legajo = ?", [obj.legajo], (err:any, result:any)=>{

            if(err) throw("Error en consulta de base de datos.");
            //console.log(result[0].path);
            path_foto += result[0].path;
        });
    });

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("delete from alumnos_tabla_api where legajo = ?", [obj.legajo], (err:any, rows:any)=>{

            if(err) {console.log(err); throw("Error en consulta de base de datos.");}

            fs.unlink(path_foto, (err:any) => {
                if (err) throw err;
                console.log(path_foto + ' fue borrado.');
            });

            response.send("alumno eliminado de la bd.");
        });
    });
});


app.listen(app.get('puerto'), ()=>{
    console.log('Servidor corriendo sobre puerto:', app.get('puerto'));
});