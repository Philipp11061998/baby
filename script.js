
// Generate subtle floating background dots
  const colors = ['#8a9aaa','#aab0b8','#c4c8cc','#d8dadc'];
  for (let i = 0; i < 18; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    const size = Math.random() * 60 + 20;
    dot.style.cssText = `
      width:${size}px; height:${size}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      left:${Math.random()*100}%; top:${Math.random()*100}%;
      animation-duration:${Math.random()*6+5}s;
      animation-delay:${Math.random()*4}s;
    `;
    document.body.appendChild(dot);
  }

  // Confetti
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  let confettiPieces = [];
  let animating = false;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const COLORS = [
    '#f48fb1','#f06292','#ec407a','#e91e63',
    '#fce4ec','#f8bbd0','#ffb7c5','#ff85a1',
    '#fff0f5','#ffe0ea','#ffd6e8','#ffaac5',
    '#c0778a','#d4607a','#ffffff','#ffd700'
  ];

  function spawnConfetti(n = 200) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    for (let i = 0; i < n; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = Math.random() * 14 + 4;
      confettiPieces.push({
        x: cx + (Math.random()-0.5)*60,
        y: cy + (Math.random()-0.5)*60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random()*12,
        w: Math.random()*12+5,
        h: Math.random()*6+3,
        color: COLORS[Math.floor(Math.random()*COLORS.length)],
        rot: Math.random()*360,
        rotSpeed: (Math.random()-0.5)*12,
        shape: Math.random() < 0.3 ? 'circle' : (Math.random() < 0.5 ? 'rect' : 'star'),
        alpha: 1,
        gravity: 0.35 + Math.random()*0.2,
        drag: 0.99
      });
    }
  }

  function drawStar(ctx, x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i*4*Math.PI/5) - Math.PI/2;
      const b = ((i*4+2)*Math.PI/5) - Math.PI/2;
      if (i===0) ctx.moveTo(x+r*Math.cos(a), y+r*Math.sin(a));
      else ctx.lineTo(x+r*Math.cos(a), y+r*Math.sin(a));
      ctx.lineTo(x+(r/2)*Math.cos(b), y+(r/2)*Math.sin(b));
    }
    ctx.closePath();
  }

  function animateConfetti() {
    if (!animating) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiPieces = confettiPieces.filter(p => p.alpha > 0.02);
    if (confettiPieces.length === 0) { animating = false; canvas.classList.remove('active'); return; }

    for (const p of confettiPieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.rot += p.rotSpeed;
      if (p.y > canvas.height + 20) p.alpha = 0;
      else if (p.y > canvas.height * 0.7) p.alpha -= 0.012;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI/180);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.w/2, 0, Math.PI*2);
        ctx.fill();
      } else if (p.shape === 'star') {
        drawStar(ctx, 0, 0, p.w/2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      }
      ctx.restore();
    }
    requestAnimationFrame(animateConfetti);
  }

  function createRipple(x, y) {
    const r = document.createElement('div');
    r.className = 'ripple';
    const size = 80;
    r.style.cssText = `width:${size}px;height:${size}px;left:${x-size/2}px;top:${y-size/2}px;`;
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 900);
  }

  function burstStars(x, y) {
    const emojis = ['✨','💕','🎀','⭐','💖','🌸'];
    for (let i = 0; i < 10; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      s.textContent = emojis[Math.floor(Math.random()*emojis.length)];
      const angle = (i/10)*Math.PI*2;
      const dist = Math.random()*120+60;
      s.style.cssText = `
        left:${x}px; top:${y}px;
        --tx:${Math.cos(angle)*dist}px;
        --ty:${Math.sin(angle)*dist}px;
        animation-delay:${Math.random()*0.3}s;
        animation-duration:${0.7+Math.random()*0.5}s;
      `;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1500);
    }
  }

  let opened = false;
  function openGift(e) {
    if (opened) return;
    opened = true;

    const rect = document.getElementById('gift').getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;

    createRipple(cx, cy);
    burstStars(cx, cy);

    document.getElementById('gift').classList.add('opened');
    document.getElementById('hint').classList.add('hide');

    setTimeout(() => {
      document.body.classList.add('revealed');
      canvas.classList.add('active');
      animating = true;
      spawnConfetti(280);
      animateConfetti();

      // Extra confetti waves
      setTimeout(() => spawnConfetti(150), 600);
      setTimeout(() => spawnConfetti(100), 1400);

      document.getElementById('reveal-text').classList.add('show');
    }, 500);
  }

  // Extra confetti on click after reveal
  canvas.addEventListener('click', (e) => {
    if (!opened) return;
    spawnConfetti(80);
  });
