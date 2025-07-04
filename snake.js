(function() {
  if (window._snakePopup) window._snakePopup.remove();

  // --- Popup setup
  const popup = document.createElement('div');
  popup.style = `
    position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);
    background:#222;border-radius:14px;box-shadow:0 8px 32px #000a;z-index:99999;
    display:flex;flex-direction:column;align-items:center;width:350px;height:460px;
    user-select:none;
  `;
  popup.id = "_snakePopup";
  window._snakePopup = popup;

  // --- Title bar
  const title = document.createElement('div');
  title.textContent = "Snake Game";
  title.style = "width:100%;background:#444;color:#fff;font-family:sans-serif;font-size:19px;font-weight:bold;text-align:center;padding:12px 0;border-top-left-radius:14px;border-top-right-radius:14px;letter-spacing:2px;cursor:move;";
  popup.appendChild(title);

  // --- Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✖';
  closeBtn.style = "position:absolute;right:22px;top:12px;background:none;border:none;color:#fff;font-size:20px;cursor:pointer;";
  closeBtn.onclick = () => popup.remove();
  popup.appendChild(closeBtn);

  // --- Draggable logic
  (function() {
    let isDown=false,offsetX=0,offsetY=0;
    title.onmousedown=function(e){
      isDown=true;offsetX=e.clientX-popup.offsetLeft;offsetY=e.clientY-popup.offsetTop;document.body.style.userSelect="none";
    };
    window.onmousemove=function(e){
      if(isDown){popup.style.left=e.clientX-offsetX+"px";popup.style.top=e.clientY-offsetY+"px";popup.style.transform="";}
    };
    window.onmouseup=function(){isDown=false;document.body.style.userSelect="";}
  })();

  // --- Canvas and UI
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 300;
  canvas.style = "background:#111;margin:32px 0 8px 0;border-radius:10px;box-shadow:0 2px 10px #0008;";
  popup.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const scoreDiv = document.createElement('div');
  scoreDiv.style = "color:#fff;font-family:sans-serif;font-size:18px;font-weight:bold;text-align:center;margin:2px 0 10px 0;";
  popup.appendChild(scoreDiv);

  const restart = document.createElement('button');
  restart.textContent = "Restart";
  restart.style = "margin:8px 0 0 0;font-size:15px;background:#2196f3;color:white;border:none;border-radius:7px;padding:7px 22px;font-weight:bold;cursor:pointer;box-shadow:0 1px 6px #0006;";
  restart.onclick = () => startGame();
  popup.appendChild(restart);

  document.body.appendChild(popup);

  // --- Game logic
  const SIZE = 15, CELLS = 20;
  let snake, dir, nextDir, food, score, gameOver, interval;

  function startGame() {
    snake = [{x:10, y:10}];
    dir = {x:1, y:0};
    nextDir = {x:1, y:0};
    placeFood();
    score = 0;
    gameOver = false;
    draw();
    if (interval) clearInterval(interval);
    interval = setInterval(step, 90);
  }

  function placeFood() {
    while (true) {
      food = {x:Math.floor(Math.random()*CELLS), y:Math.floor(Math.random()*CELLS)};
      if (!snake.some(s=>s.x===food.x && s.y===food.y)) break;
    }
  }

  function step() {
    if (gameOver) return;
    // Update direction
    dir = {...nextDir};
    // Move head
    const head = {x:snake[0].x+dir.x, y:snake[0].y+dir.y};
    // Check wall or self collision
    if (head.x<0||head.x>=CELLS||head.y<0||head.y>=CELLS||snake.some(s=>s.x===head.x&&s.y===head.y)) {
      gameOver = true;
      scoreDiv.textContent = `Game Over! Final Score: ${score}`;
      clearInterval(interval);
      draw();
      return;
    }
    snake.unshift(head);
    if (head.x===food.x && head.y===food.y) {
      score++;
      placeFood();
    } else {
      snake.pop();
    }
    draw();
  }

  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // Draw food
    ctx.fillStyle = "#fb4";
    ctx.beginPath();
    ctx.arc((food.x+0.5)*SIZE,(food.y+0.5)*SIZE, SIZE*0.45, 0, 2*Math.PI);
    ctx.fill();
    // Draw snake
    for (let i=0; i<snake.length; ++i) {
      ctx.fillStyle = i==0?"#0cf":"#7cf";
      ctx.fillRect(snake[i].x*SIZE, snake[i].y*SIZE, SIZE-1, SIZE-1);
    }
    scoreDiv.textContent = gameOver ? `Game Over! Final Score: ${score}` : `Score: ${score}`;
  }

  // Controls
  window.addEventListener('keydown', function(e) {
    if (gameOver) return;
    if (e.key==="ArrowUp"    && dir.y!==1)  nextDir={x:0,y:-1};
    if (e.key==="ArrowDown"  && dir.y!==-1) nextDir={x:0,y:1};
    if (e.key==="ArrowLeft"  && dir.x!==1)  nextDir={x:-1,y:0};
    if (e.key==="ArrowRight" && dir.x!==-1) nextDir={x:1,y:0};
  });

  startGame();
})();
