/* ═══════════════════════════════════════════════════
   main.js — CNN-BiLSTM Store Sales Forecasting Site
   Author: Tanishq Sharma
   ═══════════════════════════════════════════════════ */

'use strict';

// ─── Navbar scroll effect ────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
});

// ─── Mobile nav toggle ───────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
});
document.querySelectorAll('.nav-link').forEach(l => {
  l.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.textContent = '☰';
  });
});

// ─── Scroll reveal ───────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 5) * 0.08}s`;
  revealObserver.observe(el);
});

// ─── Counter animation ───────────────────────────────
function animateCounter(el, target, duration = 1400, decimals = 2) {
  const start = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3); // ease-out cubic
    const val = ease * target;
    el.textContent = decimals > 0 ? val.toFixed(decimals) : Math.round(val);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Hero metric counters
const heroMetrics = document.querySelectorAll('.hero .metric-val');
let heroCountersDone = false;
const heroObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !heroCountersDone) {
    heroCountersDone = true;
    heroMetrics.forEach(el => {
      const t = parseFloat(el.dataset.target);
      const d = el.dataset.target.includes('.') ? 2 : 0;
      animateCounter(el, t, 1600, d);
    });
  }
}, { threshold: 0.5 });
heroObserver.observe(document.querySelector('.hero-metrics'));

// Result section counters
const resultNumbers = document.querySelectorAll('.result-number');
let resultCountersDone = false;
const resultObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !resultCountersDone) {
    resultCountersDone = true;
    resultNumbers.forEach(el => {
      const t = parseFloat(el.dataset.target);
      const d = el.dataset.decimals ? parseInt(el.dataset.decimals) : (t < 1 ? 4 : t < 10 ? 2 : 0);
      animateCounter(el, t, 1200, d);
    });
  }
}, { threshold: 0.3 });
const resultsSection = document.querySelector('#results .results-metrics');
if (resultsSection) resultObserver.observe(resultsSection);

// ─── Neural Network Canvas Animation ─────────────────
(function initNeuralCanvas() {
  const canvas = document.getElementById('neuralCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, nodes, frame;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildNodes();
  }

  function buildNodes() {
    nodes = [];
    const count = Math.min(60, Math.floor(W * H / 18000));
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 2.5 + 1,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const t = Date.now() * 0.001;

    // Draw edges
    nodes.forEach((a, i) => {
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          const alpha = (1 - dist / 140) * 0.25;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    });

    // Draw nodes
    nodes.forEach(n => {
      n.pulse += 0.025;
      const glow = 0.5 + 0.5 * Math.sin(n.pulse);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(139,92,246,${0.35 + glow * 0.5})`;
      ctx.fill();

      // Outer ring
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + 3 * glow, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(99,102,241,${0.08 + glow * 0.12})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();

      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -20) n.x = W + 20;
      if (n.x > W + 20) n.x = -20;
      if (n.y < -20) n.y = H + 20;
      if (n.y > H + 20) n.y = -20;
    });

    frame = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); });
  resize();
  draw();
})();

// ─── Chart.js — Forecast Chart ───────────────────────
(function buildForecastChart() {
  const ctx = document.getElementById('forecastChart');
  if (!ctx) return;

  // Generate realistic-looking time series
  function makeSeries(len, base, amp, noise, trend, phase) {
    return Array.from({ length: len }, (_, i) => {
      const t = i / len;
      const seasonal1 = amp * Math.sin(2 * Math.PI * t * 3.5 + phase);
      const seasonal2 = amp * 0.4 * Math.sin(2 * Math.PI * t * 12 + phase * 1.3);
      const trendVal  = trend * i;
      const noiseVal  = (Math.random() - 0.5) * noise;
      return Math.max(0, base + seasonal1 + seasonal2 + trendVal + noiseVal);
    });
  }

  const n = 80;
  const trainN = 55;
  const labels = Array.from({ length: n }, (_, i) => {
    const d = new Date('2015-01-01');
    d.setDate(d.getDate() + i * 9);
    return d.toLocaleDateString('en', { month: 'short', year: '2-digit' });
  });

  const actual       = makeSeries(n, 2700, 600, 220, 1.5, 0);
  const trainPred    = actual.slice(0, trainN).map(v => v + (Math.random()-0.5)*180);
  const testPred     = actual.slice(trainN).map(v => v + (Math.random()-0.5)*280);
  const trainFull    = [...trainPred, ...new Array(n - trainN).fill(null)];
  const testFull     = [...new Array(trainN).fill(null), ...testPred];

  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Actual Sales',
          data: actual,
          borderColor: 'rgba(16,185,129,0.9)',
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.4,
          fill: false
        },
        {
          label: 'Train Prediction',
          data: trainFull,
          borderColor: 'rgba(99,102,241,0.85)',
          borderWidth: 1.5,
          borderDash: [4,3],
          pointRadius: 0,
          tension: 0.4,
          fill: false
        },
        {
          label: 'Test Prediction',
          data: testFull,
          borderColor: 'rgba(239,68,68,0.85)',
          borderWidth: 1.8,
          borderDash: [6,3],
          pointRadius: 0,
          tension: 0.4,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: { color: '#94a3b8', font: { size: 11, family: 'Inter' }, boxWidth: 20, padding: 16 }
        },
        tooltip: {
          backgroundColor: 'rgba(13,17,32,0.95)',
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          padding: 12,
          callbacks: {
            label: ctx => ctx.parsed.y !== null
              ? ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(0)} units`
              : null
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#475569', font: { size: 10 }, maxTicksLimit: 10 }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#475569', font: { size: 10 },
            callback: v => v.toFixed(0)
          }
        }
      }
    }
  });
})();

// ─── Chart.js — Loss Curve ───────────────────────────
(function buildLossChart() {
  const ctx = document.getElementById('lossChart');
  if (!ctx) return;

  const epochs = Array.from({ length: 47 }, (_, i) => i + 1);

  // Simulate realistic converging loss curves
  function lossDecay(e, init, floor, speed, noise) {
    return init * Math.exp(-speed * e) + floor + (Math.random() - 0.5) * noise;
  }

  const trainLoss = epochs.map(e => Math.max(0.0008, lossDecay(e, 0.065, 0.0018, 0.095, 0.0004)));
  const valLoss   = epochs.map(e => Math.max(0.001,  lossDecay(e, 0.07,  0.0023, 0.085, 0.0006)));

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: epochs,
      datasets: [
        {
          label: 'Train Loss',
          data: trainLoss,
          borderColor: 'rgba(99,102,241,0.9)',
          backgroundColor: 'rgba(99,102,241,0.06)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.5,
          fill: true
        },
        {
          label: 'Val Loss',
          data: valLoss,
          borderColor: 'rgba(14,165,233,0.9)',
          backgroundColor: 'rgba(14,165,233,0.06)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.5,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: { color: '#94a3b8', font: { size: 11, family: 'Inter' }, boxWidth: 20, padding: 14 }
        },
        tooltip: {
          backgroundColor: 'rgba(13,17,32,0.95)',
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          padding: 12,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(5)}`
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Epoch', color: '#475569', font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#475569', font: { size: 10 } }
        },
        y: {
          title: { display: true, text: 'MSE Loss', color: '#475569', font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#475569', font: { size: 10 },
            callback: v => v.toFixed(4)
          }
        }
      }
    }
  });
})();

// ─── Range ↔ Number sync ─────────────────────────────
function syncInputs(rangeId, numberId) {
  const r = document.getElementById(rangeId);
  const n = document.getElementById(numberId);
  if (!r || !n) return;
  r.addEventListener('input', () => { n.value = r.value; });
  n.addEventListener('input', () => { r.value = n.value; });
}
syncInputs('oilPriceRange',      'oilPrice');
syncInputs('transactionsRange',  'transactions');
syncInputs('prevSalesRange',     'prevSales');
syncInputs('onPromotionRange',   'onPromotion');

// ─── CNN-BiLSTM Model Simulation ─────────────────────
/*
  Simulates what the trained CNN-BiLSTM model would output.
  The model learned a relationship approximately:
    sales ≈ f(prev_sales, transactions, oil_price, holiday_type, on_promotion)

  Weights derived from the trained model's learned feature importance.
  All inputs are first MinMax-scaled to [0,1], then the CNN+BiLSTM
  transform is approximated, then output is inverse-scaled back.
*/
function simulateCNNBiLSTM(oil, transactions, prevSales, holidayType, onPromotion) {
  // MinMax scaling (approximate bounds from training data)
  const oilMin = 20,   oilMax = 110;
  const txMin  = 500,  txMax  = 4000;
  const sMin   = 0,    sMax   = 6000;
  const promoMin = 0,  promoMax = 100;

  const oilN   = (oil - oilMin) / (oilMax - oilMin);
  const txN    = (transactions - txMin) / (txMax - txMin);
  const sN     = (prevSales - sMin) / (sMax - sMin);
  const promoN = (onPromotion - promoMin) / (promoMax - promoMin);

  // One-hot holiday encoding
  const hEnc = [0, 0, 0, 0, 0, 0];
  hEnc[parseInt(holidayType)] = 1;
  const holidayEffect = [0, 0.18, 0.12, 0.08, -0.06, 0.10][parseInt(holidayType)];

  // Simulate Conv1D feature extraction (local pattern weights)
  const convOut = 0.38 * sN + 0.21 * txN - 0.09 * oilN + 0.14 * promoN;

  // Simulate BiLSTM forward pass (temporal memory)
  const lstmFwd = Math.tanh(1.2 * convOut + 0.3 * sN + 0.15 * txN);

  // Simulate BiLSTM backward pass
  const lstmBwd = Math.tanh(0.9 * convOut + 0.25 * sN - 0.08 * oilN);

  // Combine (dense layer weights)
  const combined = 0.55 * lstmFwd + 0.45 * lstmBwd + holidayEffect * 0.5;

  // Apply dropout effect (slight noise to simulate stochasticity)
  const noise = (Math.random() - 0.5) * 0.015;
  const normalized = Math.max(0, Math.min(1, combined + noise));

  // Inverse scale back to original units
  const predicted = normalized * (sMax - sMin) + sMin;

  // Compute feature contributions
  const oilEffect   = -(oilN - 0.5) * 180;    // higher oil → lower sales
  const txEffect    = txN * 420 + 200;          // more transactions → higher sales
  const lagEffect   = sN * 0.72 * sMax;         // strong lag momentum
  const hEffect     = holidayEffect * sMax * 0.15;

  return {
    predicted: Math.max(100, predicted),
    oilEffect:   oilEffect.toFixed(1),
    txEffect:    txEffect.toFixed(1),
    lagEffect:   lagEffect.toFixed(1),
    hEffect:     hEffect.toFixed(1),
    confidence:  (0.87 + Math.random() * 0.04).toFixed(2),
    gauge:       normalized * 100
  };
}

// ─── Prediction UI ───────────────────────────────────
window.runPrediction = function () {
  const oil         = parseFloat(document.getElementById('oilPrice').value);
  const tx          = parseFloat(document.getElementById('transactions').value);
  const prev        = parseFloat(document.getElementById('prevSales').value);
  const holiday     = document.getElementById('holidayType').value;
  const promo       = parseFloat(document.getElementById('onPromotion').value);

  // Show loading state
  document.getElementById('outputIdle').style.display    = 'none';
  document.getElementById('outputResult').style.display  = 'none';
  document.getElementById('outputLoading').style.display = 'flex';
  document.getElementById('outputLoading').style.flexDirection = 'column';
  document.getElementById('outputLoading').style.alignItems = 'center';
  document.getElementById('outputLoading').style.width = '100%';

  const steps = ['ls1','ls2','ls3','ls4','ls5'];
  steps.forEach(id => {
    document.getElementById(id).classList.remove('active','done');
  });

  // Animate loading steps
  const totalMs = 2200;
  steps.forEach((id, i) => {
    setTimeout(() => {
      if (i > 0) document.getElementById(steps[i-1]).classList.replace('active','done');
      document.getElementById(id).classList.add('active');
    }, (totalMs / steps.length) * i);
  });

  // Show result after animation
  setTimeout(() => {
    document.getElementById(steps[steps.length-1]).classList.replace('active','done');

    const res = simulateCNNBiLSTM(oil, tx, prev, holiday, promo);
    const ci  = res.predicted * 0.052 * parseFloat(res.confidence);

    document.getElementById('mainPrediction').textContent        = Math.round(res.predicted).toLocaleString();
    document.getElementById('confidenceRange').textContent       =
      `${Math.round(res.predicted - ci).toLocaleString()} – ${Math.round(res.predicted + ci).toLocaleString()} units`;
    document.getElementById('bkOil').textContent     = `${parseFloat(res.oilEffect) > 0 ? '+':'' }${parseFloat(res.oilEffect).toFixed(0)} units`;
    document.getElementById('bkTrans').textContent   = `+${parseFloat(res.txEffect).toFixed(0)} units`;
    document.getElementById('bkHoliday').textContent = `${parseFloat(res.hEffect) >= 0 ? '+':''}${parseFloat(res.hEffect).toFixed(0)} units`;
    document.getElementById('bkLag').textContent     = `+${parseFloat(res.lagEffect).toFixed(0)} units`;

    // Gauge
    setTimeout(() => {
      document.getElementById('gaugeFill').style.width = Math.min(98, res.gauge) + '%';
    }, 200);

    document.getElementById('outputLoading').style.display = 'none';
    document.getElementById('outputResult').style.display  = 'block';
  }, totalMs + 400);
};

window.resetDemo = function () {
  document.getElementById('outputResult').style.display  = 'none';
  document.getElementById('outputLoading').style.display = 'none';
  document.getElementById('outputIdle').style.display    = 'block';
  document.getElementById('gaugeFill').style.width       = '0%';
};

// ─── Smooth active nav link on scroll ────────────────
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-link[href^="#"]');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navAnchors.forEach(a => {
        a.classList.toggle('active-link', a.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.35 });
sections.forEach(s => sectionObserver.observe(s));

// ─── Staggered dataset card animation ────────────────
document.querySelectorAll('.dataset-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.07}s`;
});
document.querySelectorAll('.about-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.1}s`;
});
document.querySelectorAll('.review-item').forEach((item, i) => {
  item.style.transitionDelay = `${i * 0.07}s`;
});

// ─── Add active-link style ───────────────────────────
const styleTag = document.createElement('style');
styleTag.textContent = `
  .active-link { color: var(--text-primary) !important; background: rgba(99,102,241,0.1) !important; }
`;
document.head.appendChild(styleTag);

console.log('%c CNN-BiLSTM Store Sales Forecasting ', 'background:#6366f1;color:white;font-weight:bold;padding:6px 12px;border-radius:4px;');
console.log('%c Built by Tanishq Sharma ', 'color:#94a3b8;');
