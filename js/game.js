// 정사각형 LCD 논리 해상도(px). 스테이지 크기와 무관하게 화면은 항상 이 크기의 정사각형이고,
// 레벨은 그 안에 꽉 차도록 비율을 맞춰 그려지며 남는 여백은 바닥색(아이보리)으로 채운다.
const SCREEN_SIZE = 480;

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

    this.tileSize = SCREEN_SIZE / Math.max(width, height);
    this.offsetX = (SCREEN_SIZE - width * this.tileSize) / 2;
    this.offsetY = (SCREEN_SIZE - height * this.tileSize) / 2;

    canvas.width = SCREEN_SIZE;
    canvas.height = SCREEN_SIZE;

    this.history = [];
    this.redoStack = [];
    this.won = false;

    this.render();
  }

  // 레벨을 초기 상태로 되돌림 (플레이어/박스 위치, undo/redo 히스토리 모두 리셋)
  reset() {
    const { grid, player, boxes } = parseMap(this.mapLines);
    this.grid = grid;
    this.player = player;
    this.boxes = boxes;
    this.history = [];
    this.redoStack = [];
    this.won = false;
    this.render();
  }

  // 모든 목표 지점 위에 박스가 놓였는지 확인
  isWon() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.grid[y][x].goal && !this.getBoxAt(x, y)) return false;
      }
    }
    return true;
  }

  snapshot() {
    return {
      player: { ...this.player },
      boxes: this.boxes.map(b => ({ ...b })),
    };
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
    if (this.won) return false;

    const nx = this.player.x + dx;
    const ny = this.player.y + dy;

    if (this.isWall(nx, ny)) return false;

    const box = this.getBoxAt(nx, ny);
    if (box) {
      const bx = nx + dx;
      const by = ny + dy;
      if (this.isWall(bx, by) || this.getBoxAt(bx, by)) return false;
    }

    this.history.push(this.snapshot());
    this.redoStack = [];

    if (box) {
      box.x = nx + dx;
      box.y = ny + dy;
    }

    this.player.x = nx;
    this.player.y = ny;
    this.won = this.isWon();

    this.render();
    return true;
  }

  // 직전 이동을 되돌림. 되돌릴 이동이 없으면 false 반환.
  undo() {
    const prev = this.history.pop();
    if (!prev) return false;

    this.redoStack.push(this.snapshot());
    this.player = prev.player;
    this.boxes = prev.boxes;
    this.won = this.isWon();

    this.render();
    return true;
  }

  // undo를 다시 실행. 다시 실행할 이동이 없으면 false 반환.
  redo() {
    const next = this.redoStack.pop();
    if (!next) return false;

    this.history.push(this.snapshot());
    this.player = next.player;
    this.boxes = next.boxes;
    this.won = this.isWon();

    this.render();
    return true;
  }

  render() {
    const { ctx } = this;
    const t = this.tileSize;
    const ox = this.offsetX;
    const oy = this.offsetY;

    // 레벨 크기와 무관하게 화면 전체를 바닥색으로 채운 뒤 그 위에 레벨을 그린다 (여백 = 바닥색)
    ctx.fillStyle = COLORS.floor;
    ctx.fillRect(0, 0, SCREEN_SIZE, SCREEN_SIZE);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.grid[y][x];
        const px = ox + x * t;
        const py = oy + y * t;

        ctx.fillStyle = cell.wall ? COLORS.wall : COLORS.floor;
        ctx.fillRect(px, py, t, t);
        ctx.strokeStyle = COLORS.outline;
        ctx.strokeRect(px, py, t, t);

        if (!cell.wall && cell.goal) {
          ctx.fillStyle = COLORS.goal;
          ctx.beginPath();
          ctx.arc(px + t / 2, py + t / 2, t * 0.12, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    for (const box of this.boxes) {
      const px = ox + box.x * t;
      const py = oy + box.y * t;
      const onGoal = this.grid[box.y][box.x].goal;

      ctx.fillStyle = onGoal ? COLORS.boxOnGoal : COLORS.box;
      const pad = t * 0.1;
      ctx.fillRect(px + pad, py + pad, t - pad * 2, t - pad * 2);
      ctx.strokeStyle = '#00000055';
      ctx.strokeRect(px + pad, py + pad, t - pad * 2, t - pad * 2);
    }

    const pp = this.player;
    const ppx = ox + pp.x * t;
    const ppy = oy + pp.y * t;
    ctx.fillStyle = COLORS.player;
    ctx.beginPath();
    ctx.arc(ppx + t / 2, ppy + t / 2, t * 0.32, 0, Math.PI * 2);
    ctx.fill();
  }
}
