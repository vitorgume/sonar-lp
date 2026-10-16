import { findingPositions, findings, pains, reportScore, transcriptLines, type PainKey } from '../data/raio-x';
import { prefersReducedMotion } from './analytics';
import { leadContext, PAIN_CHANGE_EVENT } from './lead-context';

// Relatório do topo: "análise ao vivo" da ligação, depois mostra só o apontamento ligado à dor escolhida.
const WAVE_BARS = 90;
const SCAN_DURATION_MS = 6500;
const SCAN_DELAY_MS = 500;
const RING_CIRCUMFERENCE = 263.9;

const wave = document.getElementById('tlWave');
const head = document.getElementById('tlHead');
const arc = document.getElementById('ringArc');
const scoreNum = document.getElementById('scoreNum');
const status = document.getElementById('repStatus');
const list = document.getElementById('flist');
const coach = document.getElementById('coach');
const marks = Array.from(document.querySelectorAll<HTMLElement>('.tl-mark'));

if (wave && head && arc && scoreNum && status && list && coach) {
  for (let i = 0; i < WAVE_BARS; i++) {
    const n = i / WAVE_BARS;
    const h = 18 + 70 * Math.abs(Math.sin(i * 1.7) * Math.sin(i * 0.31 + 1)) * (0.5 + 0.5 * Math.sin(n * 9));
    const bar = document.createElement('i');
    bar.style.height = `${h}%`;
    bar.className = 'heard';
    wave.appendChild(bar);
  }
  const bars = Array.from(wave.children) as HTMLElement[];
  let scanned = false;

  const setScore = (value: number): void => {
    scoreNum.textContent = String(Math.round(value));
    arc.setAttribute('stroke-dashoffset', String(RING_CIRCUMFERENCE * (1 - value / 100)));
  };

  const renderFindings = (key: PainKey): void => {
    const pain = pains[key];
    list.innerHTML = findings
      .map((finding, index) => {
        const focused = index === pain.finding;
        return `<div class="fi ${focused ? 'focus' : 'locked'}"${focused ? '' : ' aria-hidden="true"'}><time class="${finding.tone}">${finding.time}</time><div>${finding.text}<span class="rule">${finding.rule}</span></div></div>`;
      })
      .join('');
    coach.innerHTML = pain.coach;
  };

  const finish = (): void => {
    head.hidden = true;
    marks.forEach((mark) => mark.classList.add('hit'));
    bars.forEach((bar) => bar.classList.add('heard'));
    setScore(reportScore);
    status.textContent = 'Gerado por IA';
    scanned = true;
    renderFindings(leadContext.pain);
  };

  const scan = (): void => {
    head.hidden = false;
    marks.forEach((mark) => mark.classList.remove('hit'));
    setScore(0);
    status.innerHTML = '<span class="live"><i></i>Analisando</span>';
    coach.innerHTML = '';
    const startedAt = performance.now();

    const step = (now: number): void => {
      const progress = Math.min(1, (now - startedAt) / SCAN_DURATION_MS);
      const percent = progress * 100;
      head.style.left = `${percent}%`;
      bars.forEach((bar, i) => bar.classList.toggle('heard', (i / WAVE_BARS) * 100 < percent));
      findingPositions.forEach((position, i) => {
        if (percent >= position) marks[i]?.classList.add('hit');
      });
      setScore(reportScore * progress);
      const line = transcriptLines[Math.min(transcriptLines.length - 1, Math.floor(progress * transcriptLines.length))];
      list.innerHTML = `<p class="typing">${line}<span class="cur"></span></p>`;
      if (progress < 1) requestAnimationFrame(step);
      else finish();
    };
    requestAnimationFrame(step);
  };

  document.addEventListener(PAIN_CHANGE_EVENT, () => {
    if (scanned) renderFindings(leadContext.pain);
  });

  // O HTML já chega com o relatório pronto; a animação só roda para quem aceita movimento.
  if (prefersReducedMotion()) {
    scanned = true;
  } else {
    window.setTimeout(scan, SCAN_DELAY_MS);
  }
}
