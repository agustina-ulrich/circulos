//Tp Tecno Circulos
let model_url = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';
let mic;
let pitch;
let audioContext;
let antesHabiaSonido;

let estado = "inicio";
let circulos = [];
let fondos = [];

let gestorAmp;
let gestorPitch;

let umbral_sonido = 0.05;

let altura;
let circulosCreados = 0;
let limiteDiamActual = 50;

let ultimoCambioDePaleta = 0;
const tiempoEntreCambios = 7000; // Tiempo mínimo entre cambios de paleta en milisegundos

let paletas = [
    {
        circulos: ['#D90467', '#53BF21', '#A9BF04', '#A67D03', '#D91604'],
        fondo: ['#FFFFFF']
    },
    {
        circulos: ['#473273', '#070C73', '#11178C', '#1F818C', '#EAF205'],
        fondo: ['#473273', '#070C73', '#C9C7C0']
    },
    {
        circulos: ['#590212', '#BF045B', '#A9BF04', '#A67D03', '#D91604'],
        fondo: ['#640A14', '#CC1300', '#957C00']
    },
    {
        circulos: ['#D90467', '#D9048E', '#3CA643', '#BFA041', '#D91818'],
        fondo: ['#44A34F', '#CBAC48', '#E82616']
    }
];

let paletaActual = parseInt(localStorage.getItem('paletaActual')) || 0;
paletaActual = paletaActual % paletas.length;
localStorage.setItem('paletaActual', (paletaActual + 1) % paletas.length);

let paletaCambiada = false; // Variable para controlar el cambio de paleta

function setup() {
    createCanvas(400, 600);
    
    audioContext = getAudioContext();
    mic = new p5.AudioIn(); 
    mic.start(startPitch); 
    
    userStartAudio();
    
    // Seleccionar paleta actual
    let paletaElegida = paletas[paletaActual];
    background(paletaElegida.fondo[0]); // Establecer fondo

    // Agregar círculos de fondo
    fondos.push(new CirculoFondo(200, 300, 450, paletaElegida.fondo));
    fondos.push(new CirculoFondo(100, 100, 200, paletaElegida.fondo));
    fondos.push(new CirculoFondo(300, 500, 150, paletaElegida.fondo));

    //gestorAmp = new GestorAmp();
    //gestorPitch = new GestorPitch();
    gestorAmp = new GestorSenial(0.01, 0.4);
    gestorPitch = new GestorSenial(900,1200);
    gestorPitch = new GestorPitch();
}

function draw() {
    background(255); 
    let vol = mic.getLevel();
    gestorAmp.actualizar(vol);
    let haySonido = gestorAmp.filtrada > umbral_sonido;
    let empezoElSonido = haySonido && !antesHabiaSonido;
    let terminoElSonido = !haySonido && antesHabiaSonido;

    for (let fondo of fondos) {
        fondo.dibujar();
    }
    
    if (estado === "inicio") {
        if (haySonido && circulosCreados < 10) {
            if (altura < 120) {
                let cantidadCirculos = 10 - circulosCreados;
                let c = 0;
                while (c < cantidadCirculos) {
                    let nuevoCirculo = new Circulo(paletas[paletaActual]);
                    if (!nuevoCirculo.seEstaChocandoConOtros(circulos)) {
                        circulos.push(nuevoCirculo);
                        c++;
                    }
                }
                circulosCreados += cantidadCirculos;
            }
        }
        
        if (haySonido && altura > 0) {
            if (altura > 800) {
                for (let i = 0; i < circulos.length; i++) {
                    circulos[i].decrecer();
                }
            } else {
                for (let i = 0; i < circulos.length; i++) {
                    circulos[i].crecer();
                }
            }
        } else {
            for (let i = 0; i < circulos.length; i++) {
                circulos[i].detenerCrecimiento();
            }
        }
    
        altura = 0;
        
        for (let i = circulos.length - 1; i >= 0; i--) {
            circulos[i].actualizar();
            circulos[i].dibujar();
        
            if (circulos[i].fueraDePantalla()) {
                circulos.splice(i, 1);
            }
        }

        if (terminoElSonido) {
            circulosCreados = 0;
        }

        antesHabiaSonido = haySonido;

        if (circulos.every(c => c.tamanoreal === 0)) {
            
            cambiarPaleta();
            reiniciarCirculos();
            paletaCambiada = true;
        }

        // Reiniciar paleta cambiada si hay sonido nuevamente
        if (haySonido) {
            paletaCambiada = false;
        }
    }
}


function reiniciarCirculos() {
    circulos = [];
    circulosCreados = 0;
}

function cambiarPaleta() {
   //paletaActual = (paletaActual + 1) % paletas.length;
   let tiempoActual = millis();

    // verifica el tiempo en cambio de paleta
    if (tiempoActual - ultimoCambioDePaleta > tiempoEntreCambios) {
        ultimoCambioDePaleta = tiempoActual;

        paletaActual++;
        if (paletaActual >= paletas.length) {
            paletaActual = 0; 
        }
  
    localStorage.setItem('paletaActual', paletaActual);
    let paletaElegida = paletas[paletaActual];
    background(paletaElegida.fondo[0]);

    for (let circulo of circulos) {
        circulo.rColor = color(random(paletaElegida.circulos));
        circulo.innerRColor = color(random(paletaElegida.circulos));
    }

    // Actualizar colores de los fondos con la nueva paleta de fondo
    for (let fondo of fondos) {
        fondo.colores = paletaElegida.fondo;
        fondo.color = color(random(paletaElegida.fondo));
    }
    // Reiniciar círculos creados
    circulosCreados = 0;
}
}

// Iniciar detección de tono
function startPitch() {
    pitch = ml5.pitchDetection(model_url, audioContext, mic.stream, modelLoaded);
}


function modelLoaded() {
    getPitch();
}


function getPitch() {
    pitch.getPitch(function(err, frequency) {
        if (frequency) {
            altura = frequency; // Actualizar altura con la frecuencia detectada
            console.log("Frecuencia capturada:", altura);
            if (mic.getLevel() > 0.1) {
            }
        }
        getPitch(); 
    });
}



class GestorAmp {
    constructor() {
        this.filtrada = 0;
    }

    actualizar(vol) {
        this.filtrada = this.filtrar(vol);
    }

    filtrar(vol) {
        return vol * 0.1 + this.filtrada * 0.9;
    }
}

class GestorPitch {
    constructor() {
        this.filtrada = 0;
    }

    actualizar(frequency) {
        this.filtrada = this.filtrar(altura);
    }

    filtrar(frequency) {
        return frequency;
    }
}