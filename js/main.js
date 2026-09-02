const canvas = document.getElementById('game-canvas');
const game = new Game(canvas, LEVEL_1);

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

window.addEventListener('keydown', (e) => {
  if (e.key === 'z' || e.key === 'Z' || e.key === 'Backspace') {
    e.preventDefault();
    game.undo();
    return;
  }

  const dir = KEY_TO_DIR[e.key];
  if (!dir) return;

  e.preventDefault();
  game.move(dir[0], dir[1]);
});

const DIR_BY_NAME = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

document.querySelectorAll('#dpad .btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const dir = DIR_BY_NAME[btn.dataset.dir];
    game.move(dir[0], dir[1]);
  });
});

document.getElementById('undo-btn').addEventListener('click', () => {
  game.undo();
});
