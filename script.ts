/// <reference path="ajax.ts" />

window.addEventListener("load", ():void => {
    Main.MostrarListado();
}); 

namespace Main{
    
    const URL_API : string = "http://localhost:9999/"; 
    const AJAX : Ajax = new Ajax();

    export function MostrarListado():void {

        AJAX.Get(URL_API + "alumnos_bd", 
                    MostrarListadoSuccess, 
                    "", 
                    Fail);           
    }

    export function AgregarProducto():void {
        
        let legajo:number = parseInt((<HTMLInputElement>document.getElementById("_legajo")).value);
        let nombre:string = (<HTMLInputElement>document.getElementById("_nombre")).value;
        let apellido:string = (<HTMLInputElement>document.getElementById("_apellido")).value;
        let path : any = (<HTMLInputElement> document.getElementById("archivo"));
    
        let data = {
            "legajo" : legajo,
            "nombre" : nombre,
            "apellido" : apellido
        };
    
        let form : FormData = new FormData();
        form.append('archivo', path.files[0]);
        form.append('obj', JSON.stringify(data));
        AJAX.Post(URL_API + "alumnos_bd", 
                    AgregarSuccess, 
                    form, 
                    Fail);
                        
    }

    function AgregarSuccess(retorno:string):void {

        console.log("Agregar: ", retorno);
        
        MostrarListado();

        LimpiarForm();
    }

    export function ModificarProducto():void {

        let legajo:number = parseInt((<HTMLInputElement>document.getElementById("_legajo")).value);
        let nombre:string = (<HTMLInputElement>document.getElementById("_nombre")).value;
        let apellido:string = (<HTMLInputElement>document.getElementById("_apellido")).value;
        let path : any = (<HTMLInputElement> document.getElementById("archivo"));
    
        let data = {
            "legajo" : legajo,
            "nombre" : nombre,
            "apellido" : apellido
        };
    
        let form : FormData = new FormData();
        form.append('archivo', path.files[0]);
        form.append('obj', JSON.stringify(data));
    
        AJAX.Post(URL_API + "alumnos_bd/modificar", 
                                ModificarSuccess, 
                                form, 
                                Fail);
     
    }

    function ModificarSuccess(retorno:string):void {

        console.log("Modificar: ", retorno);

        let btn = (<HTMLInputElement>document.getElementById("btnForm"));
        btn.value = "Agregar";

        btn.removeEventListener("click", ():void=>{
            ModificarProducto();
        });

        btn.addEventListener("click", ():void=>{
            AgregarProducto();
        });

        MostrarListado();

        LimpiarForm();
    }

    function MostrarListadoSuccess(data:string):void {

        let prod_obj_array: any[] = JSON.parse(data);

        console.log("Mostrar: ", prod_obj_array);

        let div = <HTMLDivElement>document.getElementById("divListado");

        let tabla = `<table class="table table-hover">
                        <tr>
                            <th>LEGAJO</th><th>APELLIDO</th><th>NOMBRE</th><th>FOTO</th><th>ACCIONES</th>
                        </tr>`;
                    if(prod_obj_array.length < 1){
                        tabla += `<tr><td>---</td><td>---</td><td>---</td><td>---</td>
                            <td>---</td></tr>`;
                    }
                    else {

                        for (let index = 0; index < prod_obj_array.length; index++) {
                            const dato = prod_obj_array[index];
                            tabla += `<tr><td>${dato.legajo}</td><td>${dato.apellido}</td><td>${dato.nombre}</td>
                                        <td><img src="${URL_API}${dato.path}" width="80px" hight="80px"></td>
                                        <td><button type="button" class="btn btn-info" id="" 
                                                data-obj='${JSON.stringify(dato)}' name="btnModificar">
                                                <span class="bi bi-pencil"></span>
                                            </button>
                                            <button type="button" class="btn btn-danger" id="" 
                                                data-obj='${dato.legajo}' name="btnEliminar">
                                                <span class="bi bi-x-circle"></span>
                                            </button>
                                        </td></tr>`;
                        }  
                    }
        tabla += `</table>`;

        div.innerHTML = tabla;

        document.getElementsByName("btnModificar").forEach((boton)=>{
            boton.addEventListener("click", ()=>{ 
                let obj : any = boton.getAttribute("data-obj");
                let obj_dato = JSON.parse(obj);
                (<HTMLInputElement>document.getElementById("_legajo")).value = obj_dato.legajo;
                (<HTMLInputElement>document.getElementById("_nombre")).value = obj_dato.nombre;
                (<HTMLInputElement>document.getElementById("_apellido")).value = obj_dato.apellido;   
                (<HTMLImageElement>document.getElementById("img_foto")).src = URL_API + obj_dato.path;
                (<HTMLDivElement>document.getElementById("div_foto")).style.display = "block";

                (<HTMLInputElement>document.getElementById("_legajo")).readOnly = true;

                let btn = (<HTMLInputElement>document.getElementById("btnForm"));
                btn.value = "Modificar";

                btn.removeEventListener("click", ():void=>{
                    AgregarProducto();
                });

                btn.addEventListener("click", ():void=>{
                    ModificarProducto();
                });
            });
        });

        document.getElementsByName("btnEliminar").forEach((boton)=>{
            boton.addEventListener("click", ()=>{ 
                let legajo : any = boton.getAttribute("data-obj");
                
                if(confirm(`¿Seguro de eliminar alumno con legajo ${legajo}?`)){                   
                    let headers = [{"key": "content-type", "value": "application/json"}];
                    let data = `{"legajo": ${legajo}}`;                
                    AJAX.Post(URL_API + "alumnos_bd/eliminar", 
                                DeleteSuccess, 
                                data, 
                                Fail,
                                headers);
                }                
            });
        });

    }

    function DeleteSuccess(retorno:string):void {

        console.log("Eliminar", retorno);

        MostrarListado();
    }

    function Fail(retorno:string):void {

        console.error(retorno);
        alert("Ha ocurrido un ERROR!!!");
    }

    function LimpiarForm(){

        (<HTMLImageElement>document.getElementById("img_foto")).src = "";
        (<HTMLDivElement>document.getElementById("div_foto")).style.display = "none";

        (<HTMLInputElement>document.getElementById("_legajo")).readOnly = false;
        
        (<HTMLInputElement>document.getElementById("_legajo")).value = "";
        (<HTMLInputElement>document.getElementById("_nombre")).value = "";
        (<HTMLInputElement>document.getElementById("_apellido")).value = "";
        (<HTMLInputElement> document.getElementById("archivo")).value = "";
    }
}