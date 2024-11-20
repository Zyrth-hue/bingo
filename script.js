
//se genera un carton VACIO
const CARTON_VACIO = [
    [, , , , , , , ,],
    [, , , , , , , ,],
    [, , , , , , , ,],
];
//generando los distintos rangos para cada columna
const RANGOS = [
    [1, 9], [10, 19], [20, 29],
    [30, 39], [40, 49], [50, 59],
    [60, 69], [70, 79], [80, 90],
];


let linea = true;


/* GENERAR ESTRUCTURA*/

function crear() {
    const c = document.getElementById('input').value;

    if (!isNaN(c)) {
        if (c <= 50 && c > 0) {
            generar10x10();
            for (let i = 0; i < c; i++) {
                let nuevoDiv = document.createElement('div');
                nuevoDiv.classList.add('carton');
                let juego = document.querySelector('.juego');
                juego.appendChild(nuevoDiv);

                let nuevaTabla = document.createElement('table');
                nuevaTabla.setAttribute('border', 1);
                nuevaTabla.setAttribute('id', `carton${i}`);


                nuevoDiv.appendChild(nuevaTabla);

                //texto para indicar que carton
                let texto = document.createElement('legend');
                texto.textContent = `Este es el carton Nº ${i}`;
                // texto.style.textAlign = 'center';
                nuevoDiv.appendChild(texto);

                let datos = generarCarton();
                for (let i = 0; i < 3; i++) {
                    let fila = document.createElement('tr');
                    for (let j = 0; j < 9; j++) {
                        let celda = document.createElement('td');
                        celda.textContent = datos[i][j];
                        fila.appendChild(celda);
                    }
                    nuevaTabla.appendChild(fila);
                }
            }

            //eliminando el input y modificando el onclick para llamar otra funcion
            const input = document.getElementById('input');
            input.remove();
            //boton que irá sacando numeros cuando se pulse
            const boton = document.getElementById('boton');
            boton.setAttribute('onclick', 'GenerarBola()');

        } else {
            alert('Pon un numero entre 1 y 50');
        }
    } else {
        alert('pon un numero raton');
        return;
    }
}

function generar10x10() {
    const tabla = document.createElement('table');
    tabla.setAttribute('border', '2');

    let $ = document.querySelector('.tabla');

    $.appendChild(tabla);

    for (let i = 0, c = 1; i < 10; i++) {
        let fila = document.createElement('tr');
        for (let j = 0; j < 9; j++) {//f0c0. . . .
            let celda = document.createElement('td');
            celda.setAttribute('id', c);
            celda.textContent = c;
            c++;
            fila.appendChild(celda);
        }
        tabla.appendChild(fila);
    }
}

/* GENERAR LOS CARTONES */

function rellenarCarton(carton, rangos) {
    const RANDOM = (min,max) => Math.floor(Math.random() * (max - min + 1)) + min;
    //Primer for generando los numeros para cada rango, y luego asignandolos al carton[]
    for (let col = 0; col < rangos.length; col++) {
        let numeros = new Set();
        while (numeros.size < 3) {

            //se utiliza la funcion enviando cada par y saca 3 random de cada par
            numeros.add(RANDOM(rangos[col][0], rangos[col][1]));
        }

        //ya completo, se pasa a un array y se rellena el carton vacio con los numeros
        let numerosArray = Array.from(numeros);
        for (let fil = 0; fil < 3; fil++) {
            carton[fil][col] = numerosArray[fil];
        }
    }

    return carton;
}

function generarNull(carton){
    for (let i = 0; i < carton.length; i++) {
        let posicionesConNull = new Set();
        //sacamos las posiciones [0 - 9]
        while (posicionesConNull.size < 4) {
            posicionesConNull.add(Math.floor(Math.random() * 9));
        }

        //se convierte el set -> array
        let posicionesConNullArray = Array.from(posicionesConNull);

        //y se rellena el carton con las posiciones en null (4)
        for (let j = 0; j < posicionesConNullArray.length; j++) {
            carton[i][posicionesConNullArray[j]] = null;
        }
    }
    return carton
}

function generarCarton() {
    let carton;
    do {
        carton = rellenarCarton(CARTON_VACIO, RANGOS)
        carton = generarNull(carton)
    } while (tresNullsEnColumna(carton));
    return carton;
}

//comprobar que no haya en una columna 3 nulls
function tresNullsEnColumna(carton) {
    return carton[0]
                .some((_, col) => carton
                .every(fila => fila[col] === null));
}

/* LOGICA DE JUEGO */
function GenerarBola() {
    let salir = false;
    do {
        let r = Math.floor(Math.random() * 90) + 1;
        let celda = document.getElementById(r);

        // Asegurarse de que celda exista y no esté ya marcada
        if (celda && !celda.classList.contains('marcado')) {
            celda.classList.add('marcado');

            // un contador para cada cartón posible como carton1, carton2 . . .
            let i = 0;
            let carton;

            while ((carton = document.getElementById(`carton${i}`)) !== null) {
                // Itera sobre cada fila del "carton"
                for (let f = 0; f < carton.rows.length; f++) {
                    const fila = carton.rows[f];
                    for (let c = 0; c < fila.cells.length; c++) {
                        const celda = fila.cells[c];
                        if (celda.textContent == r) {
                            celda.classList.add('marcado');
                        }
                    }
                }

                // Canta línea una sola vez, luego solamente se ejecuta sin cantar
                let linea2 = hayLinea(carton)
                if (linea && linea2) {
                    linea = false;
                    alert('¡Línea en el cartón: ' + i + '!');
                }

                //Verifica que el contador de lineas en cada tabla sea 3
                const hayBingo = (carton) => {

                    //en caso exitan 3, devuelve true
                    return Number(carton.getAttribute('lineas-comp') == 3)
                }

                if (hayBingo(carton)) {
                    alert('Bingo en el cartón: ' + i + '!');

                    carton.classList.add('ganador')
                    //Se elimina el boton para que el usuario ya no pueda generar mas numeros
                    document.getElementById('boton').remove();
                }
                i++;
            }
            salir = true;
        }
    } while (!salir);
}

function hayLinea(carton) {
    // Obtener el contador de líneas del atributo del cartón (o inicializarlo en 0)
    let contador = Number(carton.getAttribute('lineas-comp')) || 0;

    for (let f = 0; f < carton.rows.length; f++) {
        const fila = carton.rows[f];

        // Ignorar filas que tenga el atributo linea="true"
        if (fila.getAttribute('linea') === 'true') {
            continue;
        }

        let numsAcertados = 0;

        // Iterar sobre cada celda de la fila
        for (let c = 0; c < fila.cells.length; c++) {
            const celda = fila.cells[c];

            // Incrementar el contador si la celda está marcada
            if (celda.classList.contains('marcado')) {
                numsAcertados++;
            }
        }

        // Si hay 5 números marcados en la fila
        if (numsAcertados === 5) {
            // Marcar la fila como procesada
            fila.setAttribute('linea', 'true');
            contador++; // Incrementar el contador de líneas

            // Aplicar estilos de línea (toda la linea en amarillo)
            for (let c = 0; c < fila.cells.length; c++) {
                fila.cells[c].classList.add('linea');
            }

            // Actualizar el contador de líneas en el cartón
            carton.setAttribute('lineas-comp', contador);
            return true
        }
    }

    return false; // No hay línea ni bingo
}
