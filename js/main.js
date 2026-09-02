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
  const dir = KEY_TO_DIR[e.key];
  if (!dir) return;

  e.preventDefault();
  game.move(dir[0], dir[1]);
});
