import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ==========================================================================
   1. INICIALIZACIÓN DE SMOOTH SCROLL (LENIS) + GSAP TICKER
   ========================================================================== */
const lenis = new Lenis({
  duration: 1.5,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  touchMultiplier: 1.8,
  wheelMultiplier: 1.0,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

/* ==========================================================================
   2. CANVAS DE AMBIENTE: PÉTALOS DORADOS Y PARTÍCULAS DE LUZ (ATARDECER)
   ========================================================================== */
const canvas = document.getElementById('ambient-canvas');
const ctx = canvas.getContext('2d');

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

const particles = [];
const PARTICLE_COUNT = 45;

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * height + 20;
    this.size = Math.random() * 5 + 2;
    this.speedX = (Math.random() - 0.5) * 0.8;
    this.speedY = -(Math.random() * 0.8 + 0.3);
    this.opacity = Math.random() * 0.7 + 0.2;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    this.isPetal = Math.random() > 0.45;
    this.color = Math.random() > 0.4 ? '#FFD214' : (Math.random() > 0.5 ? '#F37335' : '#FFF099');
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.rotation += this.rotationSpeed;

    if (this.y < -30 || this.x < -30 || this.x > width + 30) {
      this.reset();
      this.y = height + 20;
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.opacity;

    if (this.isPetal) {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size * 1.6, this.size * 0.9, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#FFDE59';
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push(new Particle());
}

function animateParticles() {
  ctx.clearRect(0, 0, width, height);
  particles.forEach((p) => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

/* ==========================================================================
   3. SISTEMA DE AUDIO AMBIENTAL GENERATIVO (ROMÁNTICO / WARM SUNSET)
   ========================================================================== */
let audioContext = null;
let isPlaying = false;
let ambientInterval = null;

const audioBtn = document.getElementById('audio-toggle');
const audioLabel = document.getElementById('audio-label');

function initWarmAmbientMusic() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  const chords = [
    [196.00, 246.94, 293.66, 392.00], // G maj
    [220.00, 261.63, 329.63, 440.00], // Am
    [164.81, 246.94, 293.66, 329.63], // Em7
    [174.61, 220.00, 261.63, 349.23], // F maj7
  ];

  let chordIndex = 0;

  function playTone(freq, duration, gainLevel, type = 'sine') {
    if (!isPlaying || !audioContext) return;
    try {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioContext.currentTime);

      gain.gain.setValueAtTime(0.001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(gainLevel, audioContext.currentTime + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.start();
      osc.stop(audioContext.currentTime + duration);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  function playNextChord() {
    if (!isPlaying) return;
    const currentChord = chords[chordIndex % chords.length];
    chordIndex++;

    currentChord.forEach((noteFreq, idx) => {
      setTimeout(() => {
        playTone(noteFreq, 4.5, 0.045, 'triangle');
        if (idx === 3) {
          playTone(noteFreq * 1.5, 3.5, 0.02, 'sine');
        }
      }, idx * 300);
    });
  }

  playNextChord();
  ambientInterval = setInterval(playNextChord, 4200);
}

function stopAmbientMusic() {
  if (ambientInterval) {
    clearInterval(ambientInterval);
    ambientInterval = null;
  }
}

audioBtn.addEventListener('click', () => {
  isPlaying = !isPlaying;

  if (isPlaying) {
    audioBtn.classList.add('is-playing');
    audioLabel.textContent = 'Música: Sonando ✨';
    initWarmAmbientMusic();
  } else {
    audioBtn.classList.remove('is-playing');
    audioLabel.textContent = 'Música: Silenciada';
    stopAmbientMusic();
  }
});

/* ==========================================================================
   4. SCROLLYTELLING MASTER TIMELINE DESACOPLADA (SIN SUPERPOSICIONES)
   Secuencia Clara y Pausada:
   0. Intro (Portada)
   1. Flor Amarilla (Imagen protagónica limpia para apreciarla)
   2. Frase de las Flores (Fondo limpio de atardecer)
   3. Collar de Gatitos (Imagen protagónica limpia con brillo)
   4. Frase del Collar / Gatitos (Fondo limpio)
   5. Fecha 29 de Abril (Emblema central protagónico)
   6. Frase de la Fecha (Fondo limpio)
   7. Gran Cierre "¡Feliz Día de la Primavera!"
   ========================================================================== */
const progressBar = document.getElementById('progress-bar');

const sceneIntro = document.getElementById('scene-intro');
const sceneTextFlores = document.getElementById('scene-text-flores');
const sceneTextCats = document.getElementById('scene-text-cats');
const sceneTextDate = document.getElementById('scene-text-date');
const sceneFinale = document.getElementById('scene-finale');

const flowerAsset = document.getElementById('flower-asset');
const catsAsset = document.getElementById('cats-asset');
const dateAsset = document.getElementById('date-asset');

const skyBackdrop = document.querySelector('.sky-backdrop');

// Master timeline sincronizada
const masterTL = gsap.timeline({
  scrollTrigger: {
    trigger: '.story-wrapper',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1.4,
    onUpdate: (self) => {
      const pct = Math.round(self.progress * 100);
      progressBar.style.width = `${pct}%`;
    }
  }
});

// Estado inicial limpio
gsap.set(sceneIntro, { opacity: 1, y: 0 });
gsap.set([sceneTextFlores, sceneTextCats, sceneTextDate, sceneFinale], { opacity: 0, y: 50 });
gsap.set(flowerAsset, { opacity: 0, scale: 0.35, rotation: -30 });
gsap.set(catsAsset, { opacity: 0, scale: 0.45, rotation: 10 });
gsap.set(dateAsset, { opacity: 0, scale: 0.7, y: 40 });

/*
  Construcción de la secuencia con pausas deliberadas:
  Usamos tiempos absolutos bien espaciados para dar tiempo a cada elemento.
*/

masterTL
  /* --- 0. SALIDA DE LA PORTADA INTRO (T: 0.0 -> 1.2) --- */
  .to(sceneIntro, { opacity: 0, y: -45, duration: 1.0 }, 0.2)

  /* --- 1. PROTAGONISTA: LA FLOR AMARILLA (T: 1.2 -> 3.2) --- */
  .to(skyBackdrop, {
    background: 'radial-gradient(circle at 50% 65%, #f37335 0%, #c32d4b 28%, #70104e 55%, #240a34 80%, #0e0718 100%)',
    duration: 1.2
  }, 1.0)
  // Entra la flor con resplandor dorado y se mantiene para contemplarse
  .to(flowerAsset, {
    opacity: 1,
    scale: 1,
    rotation: 0,
    ease: 'power2.out',
    duration: 1.2
  }, 1.2)
  // Pausa contemplativa de la flor (se mantiene visible en 1.8 -> 2.8)
  // Sale la flor completamente antes de que entre el texto
  .to(flowerAsset, {
    opacity: 0,
    scale: 1.25,
    rotation: 30,
    filter: 'blur(10px)',
    duration: 1.0
  }, 2.8)

  /* --- 2. FRASE DE LAS FLORES AMARILLAS (T: 3.5 -> 5.5) --- */
  .to(sceneTextFlores, { opacity: 1, y: 0, duration: 1.0 }, 3.5)
  // Tiempo de lectura de la frase
  .to(sceneTextFlores, { opacity: 0, y: -45, duration: 0.9 }, 5.2)

  /* --- 3. PROTAGONISTA: COLLAR DE GATITOS (T: 5.8 -> 7.8) --- */
  .to(skyBackdrop, {
    background: 'radial-gradient(circle at 50% 60%, #70104e 0%, #3e0c45 35%, #240a34 65%, #0e0718 100%)',
    duration: 1.2
  }, 5.6)
  // Entra el collar de gatitos con destello y presencia
  .to(catsAsset, {
    opacity: 1,
    scale: 1,
    rotation: 0,
    ease: 'power2.out',
    duration: 1.2
  }, 5.8)
  // Pausa contemplativa del collar (se mantiene en 6.4 -> 7.4)
  // Sale el collar completamente antes de que entre el texto
  .to(catsAsset, {
    opacity: 0,
    scale: 0.7,
    rotation: -15,
    filter: 'blur(8px)',
    duration: 1.0
  }, 7.4)

  /* --- 4. FRASE DEL COLLAR Y LOS GATITOS (T: 8.0 -> 10.0) --- */
  .to(sceneTextCats, { opacity: 1, y: 0, duration: 1.0 }, 8.0)
  // Tiempo de lectura de la frase
  .to(sceneTextCats, { opacity: 0, y: -45, duration: 0.9 }, 9.8)

  /* --- 5. PROTAGONISTA: EMBLEMA 29 DE ABRIL (T: 10.3 -> 12.3) --- */
  .to(skyBackdrop, {
    background: 'radial-gradient(circle at 50% 70%, #fdc830 0%, #f37335 30%, #c32d4b 60%, #240a34 85%, #0e0718 100%)',
    duration: 1.2
  }, 10.1)
  // Entra la tarjeta conmemorativa del 29 de abril en el centro
  .to(dateAsset, {
    opacity: 1,
    scale: 1,
    y: 0,
    ease: 'back.out(1.1)',
    duration: 1.2
  }, 10.3)
  // Pausa contemplativa de la fecha (se mantiene en 10.9 -> 11.9)
  // Sale la tarjeta antes de su texto
  .to(dateAsset, {
    opacity: 0,
    scale: 0.8,
    y: -50,
    duration: 0.9
  }, 11.9)

  /* --- 6. FRASE DEL 29 DE ABRIL (T: 12.5 -> 14.5) --- */
  .to(sceneTextDate, { opacity: 1, y: 0, duration: 1.0 }, 12.5)
  // Tiempo de lectura de la frase
  .to(sceneTextDate, { opacity: 0, y: -40, duration: 0.9 }, 14.3)

  /* --- 7. GRAN CIERRE: "¡FELIZ DÍA DE LA PRIMAVERA!" (T: 14.8 -> 17.0) --- */
  .to(skyBackdrop, {
    background: 'radial-gradient(circle at 50% 50%, #ffe042 0%, #f37335 25%, #c32d4b 55%, #300a34 85%, #0e0718 100%)',
    duration: 1.5
  }, 14.6)
  // Vuelve la flor pero como un aura sutil de fondo para el festejo
  .to(flowerAsset, {
    opacity: 0.35,
    scale: 1.7,
    rotation: 90,
    filter: 'blur(5px)',
    duration: 1.4
  }, 14.8)
  .to(sceneFinale, { opacity: 1, y: 0, duration: 1.2 }, 15.2);

/* ==========================================================================
   5. INTERACTIVIDAD ADICIONAL (BOTÓN DE ABRAZO & REPLAY)
   ========================================================================== */
const sendLoveBtn = document.getElementById('send-love-btn');
const replayBtn = document.getElementById('replay-btn');
const loveCounter = document.getElementById('love-counter');

sendLoveBtn.addEventListener('click', () => {
  loveCounter.classList.remove('hidden');

  for (let i = 0; i < 40; i++) {
    const p = new Particle();
    p.x = width / 2 + (Math.random() - 0.5) * 320;
    p.y = height / 2 + (Math.random() - 0.5) * 160;
    p.speedY = -(Math.random() * 3.5 + 1.8);
    p.speedX = (Math.random() - 0.5) * 5;
    p.size = Math.random() * 8 + 4;
    p.color = Math.random() > 0.5 ? '#FFF275' : '#FFD214';
    particles.push(p);
  }

  gsap.fromTo(sendLoveBtn, { scale: 0.9 }, { scale: 1, ease: 'elastic.out(1, 0.3)', duration: 0.6 });
});

replayBtn.addEventListener('click', () => {
  lenis.scrollTo(0, {
    duration: 2.4,
    easing: (t) => 1 - Math.pow(1 - t, 4)
  });
});
