import { prefersReducedMotion } from './analytics';

// Fundo do topo: anéis de sonar saindo de um ponto de luz.
const canvas = document.querySelector<HTMLCanvasElement>('#sonar-bg');
const ctx = canvas?.getContext('2d');

if (canvas && ctx) {
  const reduce = prefersReducedMotion();
  const startedAt = performance.now();
  let width = 0;
  let height = 0;
  let visible = true;

  const fit = (): void => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const draw = (now: number): void => {
    const t = (now - startedAt) / 1000;
    ctx.clearRect(0, 0, width, height);
    const ox = width > 940 ? width * 0.78 : width * 0.5;
    const oy = width > 940 ? height * 0.45 : height * 0.85;
    const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, Math.max(width, height) * 0.6);
    glow.addColorStop(0, 'rgba(20,184,166,0.16)');
    glow.addColorStop(1, 'rgba(20,184,166,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
    for (let k = 0; k < 4; k++) {
      const p = (t / 6 + k / 4) % 1;
      const r = 60 + p * Math.max(width, height) * 0.75;
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(45,212,191,${0.2 * (1 - p)})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    running = !reduce && visible;
    if (running) requestAnimationFrame(draw);
  };

  let running = true;
  fit();
  window.addEventListener('resize', fit);
  requestAnimationFrame(draw);

  // Não gasta bateria desenhando quando o topo saiu da tela.
  if (!reduce && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible && !running) {
        running = true;
        requestAnimationFrame(draw);
      }
    }).observe(canvas);
  }
}
