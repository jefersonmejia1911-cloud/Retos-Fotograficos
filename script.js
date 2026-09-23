// =========================================================================
// 🎛️ PANEL DE CONFIGURACIÓN Y PROPORCIONES DE LA RULETA
// =========================================================================
const CONFIG = {
  porcentajeBorde: 0.98,        // Marco metálico (borde.png)
  porcentajeRuleta: 0.76,       // Disco giratorio de texturas
  porcentajeCentro: 0.35,       // Eje y flecha central (centro.png)
  distanciaTextoMargen: 18,     // Distancia del texto respecto al borde de la ruleta
  tamanoFuenteFactor: 0.045,     // Tamaño del texto del reto
  anchoMaximoTextoFactor: 0.65 // limita el tamaño del texto dento de la ruleta
};

// ==========================================
// 1. LISTA DE RETOS Y SUS TEXTURAS
// ==========================================
const retos = [
  { id: 1, texto: "RETRATO", texturaSrc: "textura_1.png", ejemploImg: "ejemplo-rojo.jpg" },
  { id: 2, texto: "TEXTURAS", texturaSrc: "textura_2.png", ejemploImg: "ejemplo-oxidado.jpg" },
  { id: 3, texto: "SOMBRAS", texturaSrc: "textura_1.png", ejemploImg: "ejemplo-sombra.jpg" },
  { id: 4, texto: "REFELJOS", texturaSrc: "textura_2.png", ejemploImg: "ejemplo-reflejo.jpg" },
  { id: 5, texto: "HORA DORADA", texturaSrc: "textura_1.png", ejemploImg: "ejemplo-patron.jpg" },
  { id: 6, texto: "ALGO EN\nMOVIMIENTO", texturaSrc: "textura_2.png", ejemploImg: "ejemplo-movimiento.jpg" }
];

// Estado global
let retoSeleccionado = null;
let estaGirando = false;
let anguloActual = 0;

// Elementos del DOM
const canvas = document.getElementById("ruletaCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;
const textoReto = document.getElementById("textoReto");

const btnGirar = document.getElementById("btnGirar");
const imgBtnGirar = document.getElementById("imgBtnGirar");
const btnEjemplo = document.getElementById("btnEjemplo");
const btnEnviar = document.getElementById("btnEnviar");

const modalEjemplo = document.getElementById("modalEjemplo");
const modalEnviar = document.getElementById("modalEnviar");

// ==========================================
// 2. PRECARGA DE IMÁGENES Y BOTONES
// ==========================================
const imgBorde = new Image();
imgBorde.src = "borde.png";

const imgCentro = new Image();
imgCentro.src = "centro.png";

// Precargamos la imagen verde para evitar parpadeos la primera vez que se presione girar
const imgBotonVerdePreload = new Image();
imgBotonVerdePreload.src = "btn-verde.jpg";

const imagenesTexturas = [];
let recursosCargados = 0;
const totalRecursos = retos.length + 2;

function verificarCarga() {
  recursosCargados++;
  if (recursosCargados >= totalRecursos) {
    ajustarCanvas();
  }
}

imgBorde.onload = verificarCarga;
imgBorde.onerror = verificarCarga;
imgCentro.onload = verificarCarga;
imgCentro.onerror = verificarCarga;

retos.forEach((reto, index) => {
  const img = new Image();
  img.src = reto.texturaSrc;
  img.onload = verificarCarga;
  img.onerror = verificarCarga;
  imagenesTexturas[index] = img;
});

// ==========================================
// 3. RENDERIZADO DEL CANVAS UNIFICADO
// ==========================================
function ajustarCanvas() {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  
  const tamanoUnificado = Math.min(rect.width, rect.height) * 2;
  canvas.width = tamanoUnificado;
  canvas.height = tamanoUnificado;
  dibujarRuleta();
}

function dibujarRuleta() {
  if (!ctx || !canvas) return;

  const numSectores = retos.length;
  const centroX = canvas.width / 2;
  const centroY = canvas.height / 2;
  const radioTotal = canvas.width / 2;
    
  const radioBorde = radioTotal * CONFIG.porcentajeBorde;
  const radioRuleta = radioTotal * CONFIG.porcentajeRuleta;
  const tamanoCentro = canvas.width * CONFIG.porcentajeCentro;
  const anchoMaximoTexto = radioRuleta * CONFIG.anchoMaximoTextoFactor;


  const anguloSector = (2 * Math.PI) / numSectores;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  

  // --- CAPA 1: MARCO / BORDE EXTERIOR (DETRÁS) ---
  if (imgBorde.complete && imgBorde.naturalWidth !== 0) {
    ctx.drawImage(
      imgBorde, 
      centroX - radioBorde, 
      centroY - radioBorde, 
      radioBorde * 2, 
      radioBorde * 2
    );
  }

  // --- CAPA 2: DISCO GIRATORIO (TEXTURAS Y TEXTO) ---
  for (let i = 0; i < numSectores; i++) {
    const inicio = anguloActual + i * anguloSector;
    const fin = inicio + anguloSector;

    ctx.save();
    
    ctx.beginPath();
    ctx.moveTo(centroX, centroY);
    ctx.arc(centroX, centroY, radioRuleta, inicio, fin);
    ctx.closePath();
    ctx.clip();

    if (imagenesTexturas[i] && imagenesTexturas[i].complete && imagenesTexturas[i].naturalWidth !== 0) {
      const img = imagenesTexturas[i];
      ctx.drawImage(
        img, 
        centroX - radioRuleta, 
        centroY - radioRuleta, 
        radioRuleta * 2, 
        radioRuleta * 2
      );
    } else {
      ctx.fillStyle = (i % 2 === 0) ? "#D32F2F" : "#FBC02D";
      ctx.fill();
    }

    ctx.restore();

    // Texto del reto en cada sector
    ctx.save();
    ctx.translate(centroX, centroY);
    ctx.rotate(inicio + anguloSector / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold " + Math.floor(canvas.width * CONFIG.tamanoFuenteFactor) + "px 'Arial Black', sans-serif";
    ctx.shadowColor = "#000000";
    ctx.shadowBlur = 6;
    ctx.fillText(retos[i].texto,radioRuleta - CONFIG.distanciaTextoMargen,5, anchoMaximoTexto);
    ctx.restore();
  }

  // --- CAPA 3: CENTRO Y FLECHA (ARRIBA) ---
  if (imgCentro.complete && imgCentro.naturalWidth !== 0) {
    ctx.drawImage(
      imgCentro, 
      centroX - tamanoCentro / 2, 
      centroY - tamanoCentro / 2, 
      tamanoCentro, 
      tamanoCentro
    );
  }
}

// ==========================================
// 4. ANIMACIÓN Y CAMBIO DE IMAGEN DEL BOTÓN
// ==========================================
function girarRuleta() {
  if (estaGirando) return;

  estaGirando = true;
  
  // 🟢 CAMBIO A BOTÓN VERDE AL INICIAR EL GIRO
  if (imgBtnGirar) {
    imgBtnGirar.src = "btn-verde.jpg";
  }
  
  if (textoReto) {
    textoReto.innerText = "Tu reto es...";
  }

  const girosCompletos = 5 + Math.floor(Math.random() * 5);
  const gradosAdicionales = Math.floor(Math.random() * 360);
  const anguloTotal = girosCompletos * 360 + gradosAdicionales;

  let duracion = 4000;
  let tiempoInicio = null;

  function animar(tiempo) {
    if (!tiempoInicio) tiempoInicio = tiempo;
    let progreso = (tiempo - tiempoInicio) / duracion;

    if (progreso > 1) progreso = 1;

    let desaceleracion = 1 - Math.pow(1 - progreso, 3);
    let gradosActuales = desaceleracion * anguloTotal;
    
    anguloActual = (gradosActuales * Math.PI) / 180;
    dibujarRuleta();

    if (progreso < 1) {
      requestAnimationFrame(animar);
    } else {
      estaGirando = false;
      
      // 🔴 CAMBIO A BOTÓN ROJO AL DETENERSE
      if (imgBtnGirar) {
        imgBtnGirar.src = "btn-rojo.jpg";
      }
      
      calcularResultado();
    }
  }

  requestAnimationFrame(animar);
}

// ==========================================
// CÁLCULO PRECISO DEL GANADOR (APUNTANDO A LAS 12 EN PUNTO)
// ==========================================
function calcularResultado() {
  const numSectores = retos.length;
  const anguloSector = (2 * Math.PI) / numSectores;

  // Normalizamos el ángulo hacia las 12 en punto (arriba / -90 grados o 1.5 * PI)
  // Se añade medio sector (anguloSector / 2) para detectar el centro exacto del sector apuntado
  let anguloNormalizado = (1.5 * Math.PI - (anguloActual % (2 * Math.PI))) % (2 * Math.PI);
  
  if (anguloNormalizado < 0) {
    anguloNormalizado += 2 * Math.PI;
  }

  let indiceGanador = Math.floor(anguloNormalizado / anguloSector);

  // Asegurar que el índice esté dentro del rango válido (0 a 5)
  indiceGanador = (indiceGanador + numSectores) % numSectores;

  retoSeleccionado = retos[indiceGanador];
  
  if (textoReto) {
    textoReto.innerText = retoSeleccionado.texto;
  }
}

function cerrarModal(idModal) {
  const target = document.getElementById(idModal);
  if (target) target.classList.remove("active");
}

if (btnGirar) btnGirar.addEventListener("click", girarRuleta);

if (btnEjemplo) {
  btnEjemplo.addEventListener("click", () => {
    if (!retoSeleccionado) {
      alert("¡Primero debes girar la ruleta para obtener un reto!");
      return;
    }
    const imgEjemplo = document.getElementById("imgEjemplo");
    const tituloEjemplo = document.getElementById("tituloEjemplo");
    if (tituloEjemplo) tituloEjemplo.innerText = `EJEMPLO: ${retoSeleccionado.texto}`;
    if (imgEjemplo) imgEjemplo.src = retoSeleccionado.ejemploImg;
    abrirModal(modalEjemplo);
  });
}

if (btnEnviar) {
  btnEnviar.addEventListener("click", () => {
    if (!retoSeleccionado) {
      alert("¡Primero gira la ruleta para saber qué reto vas a enviar!");
      return;
    }
    abrirModal(modalEnviar);
  });
}

window.addEventListener("resize", ajustarCanvas);