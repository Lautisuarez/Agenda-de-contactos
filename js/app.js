const formularioContacto = document.querySelector('#contacto'),
      listadoContactos = document.querySelector('#listado-contactos tbody');
      inputBuscador = document.querySelector('#buscar');

eventListeners();

function eventListeners() {
    // Cuando el formulario de editar o crear se ejecuta
    formularioContacto.addEventListener('submit', leerFormulario);

    // Eliminar un contacto
    if(listadoContactos){
        listadoContactos.addEventListener('click', eliminarContacto);
    }

    // Buscador 
    inputBuscador.addEventListener('input', buscarContactos);

    // Contador de contactos
    numeroContactos();
}

function leerFormulario(e) {
    e.preventDefault();
    // Leer los datos de los inputs
    const nombre = document.querySelector('#nombre').value,
          empresa = document.querySelector('#empresa').value,
          telefono = document.querySelector('#telefono').value,
          accion = document.querySelector('#accion').value;
    
    if(nombre==='' || empresa==='' || telefono===''){
        mostrarNotificacion('Todos los campos son obligatorios', 'error');
    } else {
        // Pasa la información, crear llamado a Ajax
        const infoContacto = new FormData();
        infoContacto.append('nombre', nombre);
        infoContacto.append('empresa', empresa);
        infoContacto.append('telefono', telefono);
        infoContacto.append('accion', accion);

        if(accion === 'Crear'){
            // Creamos un nuevo contacto
            insertarDB(infoContacto);
        } else {
            // Editar el contacto
            // Leemos el id
            const idRegistro = document.querySelector('#id').value;
            infoContacto.append('id', idRegistro);
            actualizarRegistro(infoContacto);
        }
    }
}

// Inserta en la base de datos vía ajax
function insertarDB(datos){
    // Llamado a Ajax

    // Crear el objeto
    const xhr = new XMLHttpRequest();
    // Abrir la conexión
    xhr.open('POST', 'inc/modelos/modelo-contacto.php', true);
    // Pasar los datos
    xhr.onload = function(){
        if(this.status === 200){
            // Leemos la respuesta de PHP
            const respuesta = JSON.parse(xhr.responseText);

            // Inserta un nuevo contacto a la tabla
            const nuevoContacto = document.createElement('tr');
            nuevoContacto.innerHTML = `
                <td>${respuesta.datos.nombre}</td>
                <td>${respuesta.datos.empresa}</td>
                <td>${respuesta.datos.telefono}</td>
            `;
            // Contenedor para los botones
            const contenedorAcciones = document.createElement('td');

            // Icono editar
            const iconoEditar = document.createElement('i');
            iconoEditar.classList.add('far', 'fa-edit');
            // Enlace para editar
            const btnEditar = document.createElement('a');
            btnEditar.appendChild(iconoEditar);
            btnEditar.href = `editar.php?id=${respuesta.datos.id}`;
            btnEditar.classList.add('btn', 'btn-editar');

            // Icono eliminar   
            const iconoBorrar = document.createElement('i');
            iconoBorrar.classList.add('far', 'fa-trash-alt');
            // Botón para eliminar
            const btnBorrar = document.createElement('button');
            btnBorrar.appendChild(iconoBorrar);
            btnBorrar.setAttribute('data-id', respuesta.datos.id);
            btnBorrar.classList.add('btn', 'btn-borrar');

            // Agregamos los botones al contenedor
            contenedorAcciones.appendChild(btnEditar);
            contenedorAcciones.appendChild(btnBorrar);

            // Agregamos el contenedor al tr
            nuevoContacto.appendChild(contenedorAcciones);

            // Agregamos el nuevo contacto a la lista de contactos
            listadoContactos.appendChild(nuevoContacto);

            // Reseteamos el formulario
            document.querySelector('form').reset();

            // Mostramos notificación
            mostrarNotificacion('Contacto creado correctamente', 'correcto');

            // Actualizamos el numero de contactos
            numeroContactos();
        }
    }
    // Enviar los datos
    xhr.send(datos);
}

// Editamos el contacto
function actualizarRegistro(datos){
    xhr = new XMLHttpRequest();
    xhr.open('POST', 'inc/modelos/modelo-contacto.php', true);
    xhr.onload = function(){
        if(this.status == 200){
            const resultado = JSON.parse(xhr.responseText);
            if(resultado.respuesta === 'correcto'){
                // Mostrar notificacion
                mostrarNotificacion('Contacto editado correctamente', 'correcto');
            } else {
                // Notificacion de error
                mostrarNotificacion('Hubo un error...', 'error');
            }
            // Redireccionamos...
            setTimeout(() => {
                window.location.href = 'index.php';
            }, 4000);
        }
    }

    xhr.send(datos);
}

// Eliminamos el contacto
function eliminarContacto(e) {
    if(e.target.parentElement.classList.contains('btn-borrar')) {
        // Tomamos el id
        const id = e.target.parentElement.getAttribute('data-id');
        // Preguntamos la confirmacion de la eliminacion
        const respuesta = confirm('¿Estás seguro/a de querer eliminarlo?');

        if(respuesta){
            // Ajax
            xhr = new XMLHttpRequest();
            xhr.open('GET', `inc/modelos/modelo-contacto.php?id=${id}&accion=borrar`, true);
            xhr.onload = function(){
                if(this.status == 200){
                    const resultado = JSON.parse(xhr.responseText);
                    if(resultado.respuesta === 'correcto'){
                        // Eliminamos el registro del DOM
                        e.target.parentElement.parentElement.parentElement.remove();

                        // Mostramos notificacion
                        mostrarNotificacion('Contacto eliminado', 'correcto');
                        // Actualizamos el numero de contactos
                        numeroContactos();
                    } else {
                        // Mostramos notificacion
                        mostrarNotificacion('Hubo un error...', 'error');
                    }
                }
            }

            xhr.send();
        } else {
            console.log("no");
        }
    }
}

// Notificación en pantalla
function mostrarNotificacion(mensaje, clase){
    const notificacion = document.createElement('div');
    notificacion.classList.add(clase, 'notificacion', 'sombra');
    notificacion.textContent = mensaje;

    // Formulario
    formularioContacto.insertBefore(notificacion, document.querySelector('form legend'));
    // Ocultar y mostrar la notificacion 
    setTimeout(() => {
        notificacion.classList.add('visible');

        setTimeout(() => {
            notificacion.classList.remove('visible');
            
            setTimeout(() => {
                notificacion.remove();
            }, 1000)
        }, 3000)
    }, 100);
}

// Buscador de contactos
function buscarContactos(e){
    const expresion = new RegExp(e.target.value, 'i'),
          registro = document.querySelectorAll('tbody tr');
    
    registro.forEach(registro => {
        registro.style.display = 'none';

        if(registro.childNodes[1].textContent.replace(/\s/g, " ").search(expresion) != -1){
            registro.style.display = 'table-row';
        }
        numeroContactos();
    })
}

// Muestra el número de contactos
function numeroContactos(){
    const totalContactos = document.querySelectorAll('tbody tr'),
          contenedorNumero = document.querySelector('.total-contactos span');
    let total = 0;

    totalContactos.forEach(contacto => {
        if(contacto.style.display === '' || contacto.style.display === 'table-row'){
            total++;
        }
    })
    
    contenedorNumero.textContent = total;
}