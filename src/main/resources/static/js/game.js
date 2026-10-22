// Tap Tile game loop (runs in browser). Java backend only stores the score.
(function () {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const overlay = document.getElementById('overlay');
  const ovTitle = document.getElementById('ovTitle');
  const ovMsg = document.getElementById('ovMsg');
  const startBtn = document.getElementById('startBtn');
  const endLinks = document.getElementById('endLinks');

  const COLS = 4;
  const W = canvas.width, H = canvas.height;
  const COL_W = W / COLS;
  const ROW_H = H / 4;

  // pixels per second at start, and extra speed gained per point
  const LEVELS = {
    Easy:   { base: 180, step: 3 },
    Medium: { base: 280, step: 4 },
    Hard:   { base: 400, step: 6 }
  };
  const level = LEVELS[DIFFICULTY] || LEVELS.Easy;

  let rows, score, running, last, speed, wrongCol;
  const KEYS = { d: 0, f: 1, j: 2, k: 3 };

  function newRow(y) {
    return { y: y, col: Math.floor(Math.random() * COLS), tapped: false };
  }

  function reset() {
    rows = [newRow(ROW_H * 2)];
    fill();
    score = 0;
    speed = level.base;
    wrongCol = null;
    scoreEl.textContent = '0';
  }

  // keep adding rows above the screen so tiles never run out
  function fill() {
    let top = rows[rows.length - 1];
    while (top.y > -ROW_H) {
      top = newRow(top.y - ROW_H);
      rows.push(top);
    }
  }

  function start() {
    reset();
    running = true;
    overlay.classList.add('hidden');
    last = performance.now();
    requestAnimationFrame(loop);
  }

  function loop(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    for (const r of rows) r.y += speed * dt;

    // lowest untapped black tile reaching the bottom = missed
    for (const r of rows) {
      if (!r.tapped && r.y >= H) { gameOver('You missed a tile!'); return; }
    }
    rows = rows.filter(r => r.y < H + ROW_H);
    fill();
    draw();
    requestAnimationFrame(loop);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, W, H);

    for (const r of rows) {
      ctx.fillStyle = r.tapped ? '#bbbbbb' : '#111111';
      ctx.fillRect(r.col * COL_W + 2, r.y + 2, COL_W - 4, ROW_H - 4);
    }
    if (wrongCol) {
      ctx.fillStyle = 'rgba(255,0,0,.55)';
      ctx.fillRect(wrongCol.col * COL_W, wrongCol.y, COL_W, ROW_H);
    }
    // grid lines
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    for (let i = 1; i < COLS; i++) {
      ctx.beginPath(); ctx.moveTo(i * COL_W, 0); ctx.lineTo(i * COL_W, H); ctx.stroke();
    }
  }

  // oldest untapped tile is the one that must be tapped next
  function nextTile() {
    let best = null;
    for (const r of rows) {
      if (!r.tapped && (best === null || r.y > best.y)) best = r;
    }
    return best;
  }

  function tapColumn(col) {
    if (!running) return;
    const t = nextTile();
    if (t && t.col === col && t.y + ROW_H > 0) {
      t.tapped = true;
      score++;
      scoreEl.textContent = score;
      speed = level.base + score * level.step;
    } else {
      wrongCol = { col: col, y: t ? t.y : 0 };
      draw();
      gameOver('Wrong tile!');
    }
  }

  function gameOver(reason) {
    running = false;
    draw();
    ovTitle.textContent = 'Game Over';
    ovMsg.textContent = reason + '  Score: ' + score;
    startBtn.textContent = 'Play Again';
    endLinks.classList.remove('hidden');
    overlay.classList.remove('hidden');
    saveScore();
  }

  function saveScore() {
    fetch(SAVE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName: PLAYER, score: score, difficulty: DIFFICULTY })
    })
      .then(r => r.ok ? r.text() : Promise.reject())
      .then(() => { ovMsg.textContent += '  (saved ✔)'; })
      .catch(() => { ovMsg.textContent += '  (could not save)'; });
  }

  function pointerDown(e) {
    if (!running) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (W / rect.width);
    tapColumn(Math.min(COLS - 1, Math.max(0, Math.floor(x / COL_W))));
  }

  canvas.addEventListener('pointerdown', pointerDown);
  document.addEventListener('keydown', function (e) {
    const c = KEYS[e.key.toLowerCase()];
    if (c !== undefined) tapColumn(c);
  });
  startBtn.addEventListener('click', start);

  reset();
  draw();
})();
