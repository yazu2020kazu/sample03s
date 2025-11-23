const TILE_COUNT = 20;
const board = document.getElementById('board');
const rollBtn = document.getElementById('rollBtn');
const resetBtn = document.getElementById('resetBtn');
const diceResult = document.getElementById('diceResult');
const messageEl = document.getElementById('message');

let playerPos = 0;
let moving = false;
let skipTurn = false;

const tileEffects = {
  2: {type: 'forward', value: 3, text: 'ラッキー！3マス進む'},
  5: {type: 'back', value: 2, text: '落とし穴！2マス戻る'},
  8: {type: 'skip', value: 0, text: '休み！次のターンを休む'},
  12: {type: 'forward', value: 2, text: 'ブースト！2マス進む'},
  15: {type: 'extra', value: 0, text: 'もう一度振れる！'},
};

function createBoard(){
  board.innerHTML = '';
  for(let i=0;i<TILE_COUNT;i++){
    const t = document.createElement('div');
    t.className = 'tile';
    t.dataset.index = i;
    const n = document.createElement('div');
    n.className = 'num';
    n.textContent = i+1;
    t.appendChild(n);
    if(tileEffects[i]){
      t.classList.add('special');
      const s = document.createElement('div');
      s.className = 'hint';
      s.textContent = tileEffects[i].text;
      s.style.fontSize='11px';
      s.style.position='absolute';
      s.style.bottom='6px';
      s.style.padding='2px 6px';
      s.style.borderRadius='6px';
      s.style.background='rgba(0,0,0,0.04)';
      t.appendChild(s);
    }
    if(i===TILE_COUNT-1) t.classList.add('finish');
    board.appendChild(t);
  }
  const startTile = board.querySelector('.tile');
  const token = document.createElement('div');
  token.className = 'token';
  token.id = 'playerToken';
  token.textContent = 'P';
  startTile.appendChild(token);
}

function updateMessage(msg, isWin){
  messageEl.textContent = msg;
  if(isWin) messageEl.classList.add('win'); else messageEl.classList.remove('win');
}

function placeTokenAt(index){
  const tiles = board.querySelectorAll('.tile');
  const token = document.getElementById('playerToken');
  const target = tiles[Math.min(index, tiles.length-1)];
  if(!token || !target) return;
  target.appendChild(token);
  target.scrollIntoView({behavior:'smooth',inline:'center'});
}

async function moveSteps(steps){
  moving = true;
  for(let i=0;i<steps;i++){
    if(playerPos >= TILE_COUNT-1) break;
    playerPos++;
    placeTokenAt(playerPos);
    await new Promise(r=>setTimeout(r,250));
  }
  moving = false;
  handleLanding();
}

function handleLanding(){
  if(playerPos >= TILE_COUNT-1){
    playerPos = TILE_COUNT-1;
    placeTokenAt(playerPos);
    updateMessage('ゴール！おめでとう！', true);
    rollBtn.disabled = true;
    return;
  }
  const effect = tileEffects[playerPos];
  if(effect){
    if(effect.type === 'forward'){
      updateMessage(effect.text);
      setTimeout(()=>{ moveSteps(effect.value); }, 400);
      return;
    } else if(effect.type === 'back'){
      playerPos = Math.max(0, playerPos - effect.value);
      placeTokenAt(playerPos);
      updateMessage(effect.text);
      return;
    } else if(effect.type === 'skip'){
      skipTurn = true;
      updateMessage(effect.text);
      return;
    } else if(effect.type === 'extra'){
      updateMessage(effect.text);
      // allow another roll immediately
      return;
    }
  }
  updateMessage('そのまま進む');
}

rollBtn.addEventListener('click', async ()=>{
  if(moving) return;
  if(skipTurn){ skipTurn=false; updateMessage('休みを1回消費しました'); return; }
  const v = Math.floor(Math.random()*6)+1;
  diceResult.textContent = v;
  await moveSteps(v);
});

resetBtn.addEventListener('click', ()=>{
  playerPos = 0;
  moving = false;
  skipTurn = false;
  diceResult.textContent = '-';
  rollBtn.disabled = false;
  updateMessage('リセットしました');
  createBoard();
});

createBoard();
updateMessage('サイコロを振ってください');
