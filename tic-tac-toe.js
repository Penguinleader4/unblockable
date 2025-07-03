(function() {
  if (window._tictacpopup) window._tictacpopup.remove();

  // --- Setup popup
  const popup = document.createElement('div');
  popup.style = `
    position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);
    background:#222;border-radius:14px;box-shadow:0 8px 32px #000a;z-index:99999;
    display:flex;flex-direction:column;align-items:center;width:340px;height:440px;
    user-select:none;
  `;
  popup.id = "_tictacpopup";
  window._tictacpopup = popup;

  // --- Title + Difficulty
  const titleBar = document.createElement('div');
  titleBar.style = "width:100%;background:#444;color:#fff;font-family:sans-serif;font-size:19px;font-weight:bold;text-align:center;padding:12px 0 6px 0;border-top-left-radius:14px;border-top-right-radius:14px;letter-spacing:2px;cursor:move;position:relative;";
  titleBar.innerHTML = `Tic Tac Toe vs AI
    <select id="_tttdiff" style="margin-left:10px;font-size:14px;border-radius:6px;padding:2px 7px;background:#223;color:#fff;border:none;outline:none;">
      <option value="easy">Easy</option>
      <option value="hard">Hard</option>
    </select>
  `;
  popup.appendChild(titleBar);

  // --- Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✖';
  closeBtn.style = "position:absolute;right:22px;top:12px;background:none;border:none;color:#fff;font-size:20px;cursor:pointer;";
  closeBtn.onclick = () => popup.remove();
  popup.appendChild(closeBtn);

  // --- Draggable
  (function() {
    let isDown=false,offsetX=0,offsetY=0;
    titleBar.onmousedown=function(e){
      isDown=true;offsetX=e.clientX-popup.offsetLeft;offsetY=e.clientY-popup.offsetTop;document.body.style.userSelect="none";
    };
    window.onmousemove=function(e){
      if(isDown){popup.style.left=e.clientX-offsetX+"px";popup.style.top=e.clientY-offsetY+"px";popup.style.transform="";}
    };
    window.onmouseup=function(){isDown=false;document.body.style.userSelect="";}
  })();

  // --- Board UI
  const boardDiv = document.createElement('div');
  boardDiv.style = "display:grid;grid-template:repeat(3, 1fr)/repeat(3, 1fr);gap:7px;width:280px;height:280px;margin:32px 0 10px 0;background:#333;padding:8px;border-radius:14px;box-shadow:0 2px 10px #0008;";
  popup.appendChild(boardDiv);

  // --- Info + restart
  const info = document.createElement('div');
  info.style = "color:#fff;font-family:sans-serif;font-size:17px;font-weight:bold;text-align:center;margin:6px 0;";
  popup.appendChild(info);
  const restart = document.createElement('button');
  restart.textContent = "Restart";
  restart.style = "margin:8px 0 0 0;font-size:15px;background:#2196f3;color:white;border:none;border-radius:7px;padding:7px 22px;font-weight:bold;cursor:pointer;box-shadow:0 1px 6px #0006;";
  restart.onclick = () => setupBoard();
  popup.appendChild(restart);

  document.body.appendChild(popup);

  // --- Game state
  let board, playerTurn, gameOver, aiLevel;
  const DIFF_SELECT = () => document.getElementById('_tttdiff');

  // --- Helpers
  function winner(b) {
    for (let i=0;i<3;i++) {
      if (b[i][0] && b[i][0]===b[i][1] && b[i][1]===b[i][2]) return b[i][0];
      if (b[0][i] && b[0][i]===b[1][i] && b[1][i]===b[2][i]) return b[0][i];
    }
    if (b[1][1] && b[1][1]===b[0][0] && b[0][0]===b[2][2]) return b[1][1];
    if (b[1][1] && b[1][1]===b[0][2] && b[0][2]===b[2][0]) return b[1][1];
    if ([...b[0],...b[1],...b[2]].every(x=>x)) return 'tie';
    return null;
  }

  // --- Minimax AI
  function minimax(b, isAi) {
    let w = winner(b);
    if (w==='O') return {score:1};
    if (w==='X') return {score:-1};
    if (w==='tie') return {score:0};
    let best = {score:isAi?-2:2};
    for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(!b[i][j]){
      b[i][j]=isAi?'O':'X';
      let val = minimax(b, !isAi).score;
      b[i][j]=null;
      if (isAi && val>best.score) best={score:val,i,j};
      if (!isAi && val<best.score) best={score:val,i,j};
    }
    return best;
  }

  function aiMove() {
    if (aiLevel==="hard") {
      let move = minimax(board,true);
      if (move.i!=undefined) board[move.i][move.j] = 'O';
    } else {
      // Easy: random empty cell
      let empties = [];
      for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(!board[i][j]) empties.push([i,j]);
      if(!empties.length) return;
      let [i,j] = empties[Math.floor(Math.random()*empties.length)];
      board[i][j] = 'O';
    }
  }

  function setupBoard() {
    board = [[null,null,null],[null,null,null],[null,null,null]];
    playerTurn = true;
    gameOver = false;
    aiLevel = DIFF_SELECT().value;
    drawBoard();
    info.textContent = `Your turn (X) — Difficulty: ${aiLevel[0].toUpperCase()+aiLevel.slice(1)}`;
  }

  function drawBoard() {
    boardDiv.innerHTML = '';
    for(let i=0;i<3;i++) for(let j=0;j<3;j++) {
      const cell = document.createElement('div');
      cell.style = `
        background:${board[i][j]?'#264':'#222'};
        border-radius:9px;
        display:flex;align-items:center;justify-content:center;
        font-size:55px;font-weight:bold;
        color:${board[i][j]==='X'?'#fff':board[i][j]==='O'?'#0cf':'#ddd'};
        cursor:${!board[i][j]&&playerTurn&&!gameOver?'pointer':'default'};
        transition:background 0.11s;
        box-shadow:0 1px 6px #0005;
        user-select:none;
        height:82px;width:82px;
      `;
      cell.textContent = board[i][j]?board[i][j]:'';
      if (!board[i][j] && playerTurn && !gameOver) {
        cell.onclick = function() {
          board[i][j] = 'X';
          playerTurn = false;
          drawBoard();
          let w = winner(board);
          if (w) {
            endGame(w);
            return;
          }
          setTimeout(function() {
            aiMove();
            playerTurn = true;
            drawBoard();
            let w2 = winner(board);
            if (w2) endGame(w2);
          }, 340);
        };
      }
      boardDiv.appendChild(cell);
    }
  }

  function endGame(w) {
    gameOver = true;
    if (w==='tie') info.textContent = "It's a tie!";
    else if (w==='X') info.textContent = "You win! 🎉";
    else info.textContent = "AI wins! 🤖";
  }

  // Difficulty change on dropdown
  DIFF_SELECT().onchange = setupBoard;

  setupBoard();
})();
