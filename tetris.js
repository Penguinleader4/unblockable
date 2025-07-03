// PURE JS TETRIS - paste into your browser's console or as a <script> in HTML

(function(){
  // Create canvas
  let cvs = document.createElement('canvas');
  cvs.width = 300;
  cvs.height = 600;
  cvs.style.position = 'fixed';
  cvs.style.left = '50%';
  cvs.style.top = '50%';
  cvs.style.transform = 'translate(-50%,-50%)';
  cvs.style.background = '#111';
  cvs.style.zIndex = 99999;
  document.body.appendChild(cvs);
  let ctx = cvs.getContext('2d');

  const COLS = 10, ROWS = 20, BLOCK = 30;
  const COLORS = [null,'#0ff','#ff0','#f00','#0f0','#00f','#f0f','#fa0'];
  const SHAPES = [
    [], // empty
    [[1,1,1,1]],                        // I
    [[2,2],[2,2]],                      // O
    [[0,3,0],[3,3,3]],                  // T
    [[0,4,4],[4,4,0]],                  // S
    [[5,5,0],[0,5,5]],                  // Z
    [[6,0,0],[6,6,6]],                  // J
    [[0,0,7],[7,7,7]]                   // L
  ];

  function randomPiece() {
    const type = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
    return {
      type: type,
      shape: SHAPES[type].map(row=>row.slice()),
      x: Math.floor(COLS/2) - Math.ceil(SHAPES[type][0].length/2),
      y: 0
    };
  }

  let arena = Array.from({length: ROWS}, () => Array(COLS).fill(0));
  let piece = randomPiece();
  let dropCounter = 0, dropInterval = 600, lastTime = 0, score = 0, gameOver = false;

  function collide(arena, piece) {
    for(let y=0; y<piece.shape.length; ++y)
      for(let x=0; x<piece.shape[y].length; ++x)
        if(piece.shape[y][x] &&
           (arena[piece.y + y] && arena[piece.y + y][piece.x + x]) !== 0)
          return true;
    return false;
  }

  function merge(arena, piece) {
    for(let y=0; y<piece.shape.length; ++y)
      for(let x=0; x<piece.shape[y].length; ++x)
        if(piece.shape[y][x])
          arena[piece.y + y][piece.x + x] = piece.shape[y][x];
  }

  function drawBlock(x, y, type) {
    ctx.fillStyle = COLORS[type];
    ctx.fillRect(x*BLOCK, y*BLOCK, BLOCK, BLOCK);
    ctx.strokeStyle = '#222';
    ctx.strokeRect(x*BLOCK, y*BLOCK, BLOCK, BLOCK);
  }

  function draw() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0,0, cvs.width, cvs.height);
    // Arena
    for(let y=0; y<ROWS; y++)
      for(let x=0; x<COLS; x++)
        if(arena[y][x]) drawBlock(x, y, arena[y][x]);
    // Piece
    for(let y=0; y<piece.shape.length; y++)
      for(let x=0; x<piece.shape[y].length; x++)
        if(piece.shape[y][x])
          drawBlock(piece.x + x, piece.y + y, piece.shape[y][x]);
    // Score
    ctx.fillStyle = "#fff";
    ctx.font = "bold 20px monospace";
    ctx.fillText("Score: " + score, 10, 25);
    if (gameOver) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 32px monospace";
      ctx.fillText("GAME OVER", 40, cvs.height/2);
    }
  }

  function rotate(matrix) {
    return matrix[0].map((_,i)=>matrix.map(row=>row[i]).reverse());
  }

  function playerDrop() {
    piece.y++;
    if (collide(arena, piece)) {
      piece.y--;
      merge(arena, piece);
      resetPiece();
      sweep();
      if (collide(arena, piece)) gameOver = true;
    }
    dropCounter = 0;
  }

  function playerMove(dir) {
    piece.x += dir;
    if (collide(arena, piece)) piece.x -= dir;
  }

  function playerRotate() {
    let old = piece.shape;
    piece.shape = rotate(piece.shape);
    if (collide(arena, piece)) piece.shape = old;
  }

  function sweep() {
    let lines = 0;
    outer: for(let y=arena.length-1; y>=0; y--) {
      for(let x=0; x<COLS; ++x)
        if(!arena[y][x]) continue outer;
      arena.splice(y, 1);
      arena.unshift(Array(COLS).fill(0));
      lines++;
      y++;
    }
    if(lines) score += lines*100;
  }

  function resetPiece() {
    piece = randomPiece();
    piece.y = 0; piece.x = Math.floor(COLS/2) - Math.ceil(piece.shape[0].length/2);
  }

  function update(time = 0) {
    if (gameOver) { draw(); return; }
    dropCounter += time - lastTime; lastTime = time;
    if (dropCounter > dropInterval) playerDrop();
    draw();
    requestAnimationFrame(update);
  }

  document.addEventListener('keydown', e => {
    if (gameOver) return;
    if (e.key === 'ArrowLeft') playerMove(-1);
    else if (e.key === 'ArrowRight') playerMove(1);
    else if (e.key === 'ArrowDown') playerDrop();
    else if (e.key === 'ArrowUp') playerRotate();
    draw();
  });

  draw();
  requestAnimationFrame(update);
})();
