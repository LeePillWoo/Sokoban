const PROGRESS_KEY = 'sokoban:progress';

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    // 저장 실패(프라이빗 모드 등)는 무시 — 진행 기록은 부가 기능일 뿐
  }
}

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const canvas = document.getElementById('game-canvas');
const viewSelect = document.getElementById('view-select');
const viewGame = document.getElementById('view-game');
const stageGrid = document.getElementById('stage-grid');
const backBtn = document.getElementById('back-btn');
const hudStageName = document.getElementById('hud-stage-name');
const hudMoves = document.getElementById('hud-moves');
const hudTime = document.getElementById('hud-time');
const resultOverlay = document.getElementById('result-overlay');
const resultMoves = document.getElementById('result-moves');
const resultTime = document.getElementById('result-time');
const resultBest = document.getElementById('result-best');
const resultRetryBtn = document.getElementById('result-retry');
const resultNextBtn = document.getElementById('result-next');
const resultSelectBtn = document.getElementById('result-select');

let game = null;
let currentStageIndex = 0;
let startTime = 0;
let timerInterval = null;
let progress = loadProgress();

function showView(name) {
  viewSelect.hidden = name !== 'select';
  viewGame.hidden = name !== 'game';
}

function renderStageGrid() {
  stageGrid.innerHTML = '';

  STAGES.forEach((stage, index) => {
    const btn = document.createElement('button');
    btn.className = 'stage-card';

    const title = document.createElement('div');
    title.className = 'stage-card-title';
    title.textContent = stage.name;
    btn.appendChild(title);

    const best = progress[stage.id];
    const sub = document.createElement('div');
    sub.className = 'stage-card-sub';
    sub.textContent = best ? `Best ${best.bestMoves} / ${formatTime(best.bestTimeMs)}` : '미완료';
    btn.appendChild(sub);

    btn.addEventListener('click', () => startStage(index));
    stageGrid.appendChild(btn);
  });
}

function updateHud() {
  hudStageName.textContent = STAGES[currentStageIndex].name;
  hudMoves.textContent = `${game.history.length} 이동`;
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function startTimer() {
  stopTimer();
  startTime = Date.now();
  hudTime.textContent = formatTime(0);
  timerInterval = setInterval(() => {
    hudTime.textContent = formatTime(Date.now() - startTime);
  }, 250);
}

function hideResult() {
  resultOverlay.hidden = true;
  resultBest.hidden = true;
}

function startStage(index) {
  currentStageIndex = index;
  game = new Game(canvas, STAGES[index].lines);
  hideResult();
  showView('game');
  updateHud();
  startTimer();
}

function retryStage() {
  game.reset();
  hideResult();
  updateHud();
  startTimer();
}

function backToSelect() {
  stopTimer();
  hideResult();
  progress = loadProgress();
  renderStageGrid();
  showView('select');
}

function handleWin() {
  stopTimer();
  const elapsedMs = Date.now() - startTime;
  const moves = game.history.length;
  const stage = STAGES[currentStageIndex];

  const prevBest = progress[stage.id];
  const isNewBest = !prevBest || elapsedMs < prevBest.bestTimeMs;
  if (isNewBest) {
    progress[stage.id] = { bestMoves: moves, bestTimeMs: elapsedMs };
    saveProgress(progress);
  }

  resultMoves.textContent = `${moves}`;
  resultTime.textContent = formatTime(elapsedMs);
  resultBest.hidden = !isNewBest;
  resultNextBtn.style.display = currentStageIndex + 1 < STAGES.length ? '' : 'none';
  resultOverlay.hidden = false;
}

function afterAction() {
  updateHud();
  if (game.won) handleWin();
}

// ---- 스테이지 선택 / 상단 이동 ----

renderStageGrid();
showView('select');

backBtn.addEventListener('click', backToSelect);
resultSelectBtn.addEventListener('click', backToSelect);
resultRetryBtn.addEventListener('click', retryStage);
resultNextBtn.addEventListener('click', () => {
  if (currentStageIndex + 1 < STAGES.length) startStage(currentStageIndex + 1);
});

// ---- 조작 ----

const KEY_TO_DIR = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  w: [0, -1],
  s: [0, 1],
  a: [-1, 0],
  d: [1, 0],
};

const DIR_BY_NAME = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

window.addEventListener('keydown', (e) => {
  if (viewGame.hidden || !game) return;

  if (e.key === 'z' || e.key === 'Z' || e.key === 'Backspace') {
    e.preventDefault();
    game.undo();
    afterAction();
    return;
  }

  if (e.key === 'y' || e.key === 'Y' || e.key === 'x' || e.key === 'X') {
    e.preventDefault();
    game.redo();
    afterAction();
    return;
  }

  const dir = KEY_TO_DIR[e.key];
  if (!dir) return;

  e.preventDefault();
  game.move(dir[0], dir[1]);
  afterAction();
});

document.querySelectorAll('#dpad [data-dir]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const dir = DIR_BY_NAME[btn.dataset.dir];
    game.move(dir[0], dir[1]);
    afterAction();
  });
});

document.getElementById('undo-btn').addEventListener('click', () => {
  game.undo();
  afterAction();
});

document.getElementById('redo-btn').addEventListener('click', () => {
  game.redo();
  afterAction();
});

document.getElementById('reset-btn').addEventListener('click', retryStage);

const fullscreenBtn = document.getElementById('fullscreen-btn');
if (!document.fullscreenEnabled) {
  fullscreenBtn.style.display = 'none';
} else {
  fullscreenBtn.addEventListener('click', () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  });
}
