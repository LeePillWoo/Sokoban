const TILE_SIZE = 40;

const COLORS = {
  wall: '#4a4a4a',
  floor: '#e0dcd0',
  goal: '#c9a227',
  box: '#a0522d',
  boxOnGoal: '#2e8b57',
  player: '#3b82f6',
  outline: '#00000033',
};

class Game {
  constructor(canvas, mapLines) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.mapLines = mapLines;

    const { grid, width, height, player, boxes } = parseMap(mapLines);
    this.grid = grid;
    this.width = width;
    this.height = height;
    this.player = player;
    this.boxes = boxes;

    canvas.width = width * TILE_SIZE;
    canvas.height = height * TILE_SIZE;

    this.history = [];

    this.render();
  }

  // 레벨을 초기 상태로 되돌림 (플레이어/박스 위치, undo 히스토리 모두 리셋)
  reset() {
    const { grid, player, boxes } = parseMap(this.mapLines);
    this.grid = grid;
    this.player = player;
    this.boxes = boxes;
    this.history = [];
    this.render();
  }

  isWall(x, y) {
    if (y < 0 || y >= this.height || x < 0 || x >= this.width) return true;
    return this.grid[y][x].wall;
  }

  getBoxAt(x, y) {
    return this.boxes.find(b => b.x === x && b.y === y) || null;
  }

  // dx, dy는 -1, 0, 1 중 하나. 이동 성공 시 true 반환.
  move(dx, dy) {
    const nx = this.player.x + dx;
    const ny = this.player.y + dy;

    if (this.isWall(nx, ny)) return false;

    const box = this.getBoxAt(nx, ny);
    if (box) {
      const bx = nx + dx;
      const by = ny + dy;
      if (this.isWall(bx, by) || this.getBoxAt(bx, by)) return false;
    }

    this.history.push({
      player: { ...this.player },
      boxes: this.boxes.map(b => ({ ...b })),
    });

    if (box) {
      box.x = nx + dx;
      box.y = ny + dy;
    }

    this.player.x = nx;
    this.player.y = ny;

    this.render();
    return true;
  }

  // 직전 이동을 되돌림. 되돌릴 이동이 없으면 false 반환.
  undo() {
    const prev = this.history.pop();
    if (!prev) return false;

    this.player = prev.player;
    this.boxes = prev.boxes;

    this.render();
    return true;
  }

  render() {
    const { ctx } = this;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.grid[y][x];
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        ctx.fillStyle = cell.wall ? COLORS.wall : COLORS.floor;
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = COLORS.outline;
        ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);

        if (!cell.wall && cell.goal) {
          ctx.fillStyle = COLORS.goal;
          ctx.beginPath();
          ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, TILE_SIZE * 0.12, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    for (const box of this.boxes) {
      const px = box.x * TILE_SIZE;
      const py = box.y * TILE_SIZE;
      const onGoal = this.grid[box.y][box.x].goal;

      ctx.fillStyle = onGoal ? COLORS.boxOnGoal : COLORS.box;
      const pad = 4;
      ctx.fillRect(px + pad, py + pad, TILE_SIZE - pad * 2, TILE_SIZE - pad * 2);
      ctx.strokeStyle = '#00000055';
      ctx.strokeRect(px + pad, py + pad, TILE_SIZE - pad * 2, TILE_SIZE - pad * 2);
    }

    const pp = this.player;
    const ppx = pp.x * TILE_SIZE;
    const ppy = pp.y * TILE_SIZE;
    ctx.fillStyle = COLORS.player;
    ctx.beginPath();
    ctx.arc(ppx + TILE_SIZE / 2, ppy + TILE_SIZE / 2, TILE_SIZE * 0.32, 0, Math.PI * 2);
    ctx.fill();
  }
}
