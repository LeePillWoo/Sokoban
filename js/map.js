// 타일 기호 정의
// # = 벽, @ = 플레이어, $ = 박스, . = 목표지점
// * = 박스+목표지점, + = 플레이어+목표지점, 공백 = 바닥

const TILE = {
  WALL: '#',
  PLAYER: '@',
  BOX: '$',
  GOAL: '.',
  BOX_ON_GOAL: '*',
  PLAYER_ON_GOAL: '+',
  FLOOR: ' ',
};

// 스테이지 목록. 새 스테이지를 추가하려면 이 배열에 항목만 더하면 된다.
const STAGES = [
  {
    id: 'stage-1',
    name: '스테이지 1',
    lines: [
      '    #####',
      '    #   #',
      '    #$  #',
      '  ###  $##',
      '  #  $ $ #',
      '### # ## #   ######',
      '#   # ## #####  ..#',
      '# $  $          ..#',
      '##### ### #@##  ..#',
      '    #     #########',
      '    #######',
    ],
  },
  {
    id: 'stage-2',
    name: '스테이지 2',
    lines: [
      '#######',
      '#     #',
      '#  $  #',
      '#     #',
      '#  .  #',
      '#     #',
      '#  @  #',
      '#######',
    ],
  },
  {
    id: 'stage-3',
    name: '스테이지 3',
    lines: [
      '#######',
      '#     #',
      '#  $  #',
      '#     #',
      '#  .  #',
      '#     #',
      '#  $  #',
      '#     #',
      '#  .  #',
      '#     #',
      '#  @  #',
      '#######',
    ],
  },
  {
    id: 'stage-4',
    name: '스테이지 4',
    lines: [
      '#########',
      '#   #   #',
      '#   #   #',
      '#  $#$  #',
      '#   #   #',
      '### # ###',
      '#   #   #',
      '#  .#.  #',
      '#   #   #',
      '#   @   #',
      '#########',
    ],
  },
];

// 텍스트 맵을 파싱해서 grid(벽/바닥/목표 정보), 플레이어 좌표, 박스 좌표 목록으로 변환
function parseMap(lines) {
  const width = Math.max(...lines.map(line => line.length));
  const height = lines.length;

  const grid = [];
  let player = null;
  const boxes = [];

  for (let y = 0; y < height; y++) {
    const row = [];
    const line = lines[y].padEnd(width, ' ');

    for (let x = 0; x < width; x++) {
      const ch = line[x];
      let isWall = false;
      let isGoal = false;

      switch (ch) {
        case TILE.WALL:
          isWall = true;
          break;
        case TILE.GOAL:
          isGoal = true;
          break;
        case TILE.BOX:
          boxes.push({ x, y });
          break;
        case TILE.BOX_ON_GOAL:
          isGoal = true;
          boxes.push({ x, y });
          break;
        case TILE.PLAYER:
          player = { x, y };
          break;
        case TILE.PLAYER_ON_GOAL:
          isGoal = true;
          player = { x, y };
          break;
        case TILE.FLOOR:
        default:
          break;
      }

      row.push({ wall: isWall, goal: isGoal });
    }

    grid.push(row);
  }

  return { grid, width, height, player, boxes };
}
