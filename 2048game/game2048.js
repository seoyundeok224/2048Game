// 2048 게임 보드 크기 설정 (4x4)
const size = 4;

// 게임 상태 변수들
let board = Array.from({ length: size }, () => Array(size).fill(0)); // 보드 배열 초기화
let score = 0;          // 현재 점수
let history = [];       // Undo 기능을 위한 이전 상태 저장

// 숫자별 배경색 매핑
const colorMap = {
  2: '#eee4da', 4: '#ede0c8', 8: '#f2b179',
  16: '#f59563', 32: '#f67c5f', 64: '#f65e3b',
  128: '#edcf72', 256: '#edcc61', 512: '#edc850',
  1024: '#edc53f', 2048: '#edc22e'
};

// 빈 칸 중 하나에 2 또는 4를 랜덤으로 추가
function addRandomTile() {
  const empty = []; // 빈 칸 위치를 저장할 배열
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (board[r][c] === 0) empty.push([r, c]); // 값이 0인 경우 저장

  if (empty.length === 0) return; // 빈 칸이 없으면 종료
  const [r, c] = empty[Math.floor(Math.random() * empty.length)]; // 랜덤 위치 선택
  board[r][c] = Math.random() < 0.9 ? 2 : 4; // 90% 확률로 2, 10% 확률로 4 생성
}

// 보드를 HTML 화면에 그리는 함수
function drawBoard() {
  const boardDiv = document.getElementById('game-board'); // 보드 컨테이너
  const scoreSpan = document.getElementById('score');     // 점수 표시 영역
  if (!boardDiv) return;

  boardDiv.innerHTML = ''; // 이전 내용 초기화

  board.forEach(row => {
    const rowDiv = document.createElement('div'); // 행 요소 생성
    rowDiv.style.display = 'flex'; // 가로 방향 배치

    row.forEach(cell => {
      const cellDiv = document.createElement('div'); // 셀 요소 생성
      cellDiv.textContent = cell === 0 ? '' : cell; // 값이 0이면 비우기

      // 셀 스타일 적용
      Object.assign(cellDiv.style, {
        width: '60px', height: '60px', margin: '5px',
        border: '2px solid black', borderRadius: '10px',
        background: colorMap[cell] || '#ffffff',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '1em',
        fontWeight: 'bold', color: (cell <= 4) ? '#776e65' : '#fff'
      });

      rowDiv.appendChild(cellDiv); // 행에 셀 추가
    });

    boardDiv.appendChild(rowDiv); // 보드에 행 추가
  });

  if (scoreSpan) scoreSpan.textContent = score; // 점수 표시 업데이트
}

// 한 줄을 왼쪽으로 밀고 합치는 함수
function slide(row) {
  let arr = row.filter(v => v); // 0을 제외한 숫자만 추출

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;             // 같은 숫자면 합치기
      score += arr[i];         // 점수 증가
      arr[i + 1] = 0;          // 다음 칸은 0으로 설정
    }
  }

  arr = arr.filter(v => v);    // 다시 0 제거
  while (arr.length < size) arr.push(0); // 오른쪽에 0 채우기
  return arr;
}

// 2차원 배열을 왼쪽으로 90도 회전 (상하좌우 이동을 위한 보조 함수)
function rotateLeft(mat) {
  return mat[0].map((_, i) => mat.map(row => row[size - 1 - i]));
}

// 보드를 방향에 따라 이동시키는 함수
function move(dir) {
  const old = JSON.stringify(board); // 이동 전 보드 상태 저장 (비교용)
  history.push(JSON.stringify({ board, score })); // undo용 상태 저장

  // 회전으로 방향 처리 (0: 좌, 1: 상, 2: 우, 3: 하)
  for (let i = 0; i < dir; i++) board = rotateLeft(board);
  board = board.map(slide); // 각 행을 왼쪽으로 슬라이드
  for (let i = 0; i < (4 - dir) % 4; i++) board = rotateLeft(board); // 원래 방향으로 되돌림

  if (JSON.stringify(board) !== old) {
    addRandomTile();     // 보드가 바뀐 경우 새 타일 추가
    drawBoard();         // 화면 다시 그림
    if (checkWin()) {
      alert("축하합니다! 2048을 달성했습니다!");
    } else if (isGameOver()) {
      alert("게임 오버! 더 이상 이동할 수 없습니다.");
    }
  } else {
    history.pop(); // 보드가 안 바뀌었으면 undo 기록 제거
  }
}

// 이동 가능한 타일이 없고 빈 칸도 없으면 게임 오버
function isGameOver() {
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (board[r][c] === 0) return false; // 빈 칸이 있으면 아직 게임 가능

  for (let r = 0; r < size; r++)
    for (let c = 0; c < size - 1; c++)
      if (board[r][c] === board[r][c + 1]) return false; // 가로 방향으로 합칠 수 있으면 게임 가능

  for (let c = 0; c < size; c++)
    for (let r = 0; r < size - 1; r++)
      if (board[r][c] === board[r + 1][c]) return false; // 세로 방향으로 합칠 수 있으면 게임 가능

  return true; // 위 조건을 모두 통과하면 게임 오버
}

// 2048이 만들어졌는지 확인
function checkWin() {
  return board.some(row => row.includes(2048));
}

// 한 번 되돌리기 기능
function undo() {
  if (history.length === 0) {
    alert("더 이상 되돌릴 수 없습니다.");
    return;
  }
  const last = JSON.parse(history.pop()); // 가장 최근 상태 불러오기
  board = JSON.parse(JSON.stringify(last.board)); // 깊은 복사로 복원
  score = last.score;
  drawBoard(); // 화면 다시 그림
}

// 게임 리셋 (보드, 점수 초기화)
function reset2048() {
  board = Array.from({ length: size }, () => Array(size).fill(0)); // 보드 초기화
  score = 0;
  history = [];
  addRandomTile(); // 타일 2개 추가
  addRandomTile();
  drawBoard();
}

// 키보드 입력 처리
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') move(0);      // 왼쪽 화살표
  else if (e.key === 'ArrowUp') move(1);   // 위쪽 화살표
  else if (e.key === 'ArrowRight') move(2); // 오른쪽 화살표
  else if (e.key === 'ArrowDown') move(3); // 아래쪽 화살표
  else if (e.key === 'Escape') reset2048(); // Esc 키로 리셋
  else if (e.key.toLowerCase() === 'u') undo(); // 'u' 키로 Undo
});

// 초기 시작 시 보드 생성 및 랜덤 타일 2개 추가
reset2048();