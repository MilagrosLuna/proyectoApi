"use strict";
window.addEventListener("load", () => {
    Main.MostrarListado();
});
var Main;
(function (Main) {
    const URL_API = "http://localhost:9999/";
    const AJAX = new Ajax();
    function MostrarListado() {
        AJAX.Get(URL_API + "alumnos_bd", MostrarListadoSuccess, "", Fail);
    }
    Main.MostrarListado = MostrarListado;
    function AgregarProducto() {
        let legajo = parseInt(document.getElementById("_legajo").value);
        let nombre = document.getElementById("_nombre").value;
        let apellido = document.getElementById("_apellido").value;
        let path = document.getElementById("archivo");
        let data = {
            "legajo": legajo,
            "nombre": nombre,
            "apellido": apellido
        };
        let form = new FormData();
        form.append('archivo', path.files[0]);
        form.append('obj', JSON.stringify(data));
        AJAX.Post(URL_API + "alumnos_bd", AgregarSuccess, form, Fail);
    }
    Main.AgregarProducto = AgregarProducto;
    function AgregarSuccess(retorno) {
        console.log("Agregar: ", retorno);
        MostrarListado();
        LimpiarForm();
    }
    function ModificarProducto() {
        let legajo = parseInt(document.getElementById("_legajo").value);
        let nombre = document.getElementById("_nombre").value;
        let apellido = document.getElementById("_apellido").value;
        let path = document.getElementById("archivo");
        let data = {
            "legajo": legajo,
            "nombre": nombre,
            "apellido": apellido
        };
        let form = new FormData();
        form.append('archivo', path.files[0]);
        form.append('obj', JSON.stringify(data));
        AJAX.Post(URL_API + "alumnos_bd/modificar", ModificarSuccess, form, Fail);
    }
    Main.ModificarProducto = ModificarProducto;
    function ModificarSuccess(retorno) {
        console.log("Modificar: ", retorno);
        let btn = document.getElementById("btnForm");
        btn.value = "Agregar";
        btn.removeEventListener("click", () => {
            ModificarProducto();
        });
        btn.addEventListener("click", () => {
            AgregarProducto();
        });
        MostrarListado();
        LimpiarForm();
    }
    function MostrarListadoSuccess(data) {
        let prod_obj_array = JSON.parse(data);
        console.log("Mostrar: ", prod_obj_array);
        let div = document.getElementById("divListado");
        let tabla = `<table class="table table-hover">
                        <tr>
                            <th>LEGAJO</th><th>APELLIDO</th><th>NOMBRE</th><th>FOTO</th><th>ACCIONES</th>
                        </tr>`;
        if (prod_obj_array.length < 1) {
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
        document.getElementsByName("btnModificar").forEach((boton) => {
            boton.addEventListener("click", () => {
                let obj = boton.getAttribute("data-obj");
                let obj_dato = JSON.parse(obj);
                document.getElementById("_legajo").value = obj_dato.legajo;
                document.getElementById("_nombre").value = obj_dato.nombre;
                document.getElementById("_apellido").value = obj_dato.apellido;
                document.getElementById("img_foto").src = URL_API + obj_dato.path;
                document.getElementById("div_foto").style.display = "block";
                document.getElementById("_legajo").readOnly = true;
                let btn = document.getElementById("btnForm");
                btn.value = "Modificar";
                btn.removeEventListener("click", () => {
                    AgregarProducto();
                });
                btn.addEventListener("click", () => {
                    ModificarProducto();
                });
            });
        });
        document.getElementsByName("btnEliminar").forEach((boton) => {
            boton.addEventListener("click", () => {
                let legajo = boton.getAttribute("data-obj");
                if (confirm(`¿Seguro de eliminar alumno con legajo ${legajo}?`)) {
                    let headers = [{ "key": "content-type", "value": "application/json" }];
                    let data = `{"legajo": ${legajo}}`;
                    AJAX.Post(URL_API + "alumnos_bd/eliminar", DeleteSuccess, data, Fail, headers);
                }
            });
        });
    }
    function DeleteSuccess(retorno) {
        console.log("Eliminar", retorno);
        MostrarListado();
    }
    function Fail(retorno) {
        console.error(retorno);
        alert("Ha ocurrido un ERROR!!!");
    }
    function LimpiarForm() {
        document.getElementById("img_foto").src = "";
        document.getElementById("div_foto").style.display = "none";
        document.getElementById("_legajo").readOnly = false;
        document.getElementById("_legajo").value = "";
        document.getElementById("_nombre").value = "";
        document.getElementById("_apellido").value = "";
        document.getElementById("archivo").value = "";
    }
})(Main || (Main = {}));
//# sourceMappingURL=script.js.map