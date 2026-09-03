const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const LS_KEY = 'fortune_lynx_state_v11';

const state = {
  balance: 1000,
  betOptions: [0.4, 0.8, 1.2, 2, 4, 8, 16, 32, 64, 100],
  betIndex: 3,
  freeSpins: 0,
  bonusMultiplier: 1,
  lastWin: 0,
  turbo: false,
  autoSpins: 0,
  spinning: false,
  sound: true,
  bonusCharge: 0,
  grid: [],
};

const symbols = {
  wild: { label: 'WILD', payout3: 15, payout2: 4, weight: 5, img: '../../assets/symbols/wild.webp', special: 'wild' },
  scatter: { label: 'SCATTER', payout3: 0, payout2: 0, weight: 2, img: '../../assets/symbols/scatter.webp', special: 'scatter' },
  gold: { label: 'Tesouro', payout3: 10, payout2: 2.5, weight: 7, img: '../../assets/symbols/gold.webp' },
  jade: { label: 'Jade', payout3: 9, payout2: 2.2, weight: 7, img: '../../assets/symbols/jade.webp' },
  envelope: { label: 'Envelope', payout3: 8, payout2: 2, weight: 8, img: '../../assets/symbols/envelope.webp' },
  firecrackers: { label: 'Fogos', payout3: 7, payout2: 1.8, weight: 8, img: '../../assets/symbols/firecrackers.webp' },
  accessory: { label: 'Acessório', payout3: 8.5, payout2: 2.1, weight: 8, img: '../../assets/symbols/accessory.webp' },
  a: { label: 'A', payout3: 5, payout2: 1.4, weight: 12, img: '../../assets/symbols/a.webp' },
  k: { label: 'K', payout3: 4.8, payout2: 1.3, weight: 12, img: '../../assets/symbols/k.webp' },
  q: { label: 'Q', payout3: 4.4, payout2: 1.2, weight: 12, img: '../../assets/symbols/q.webp' },
  j: { label: 'J', payout3: 4.2, payout2: 1.1, weight: 12, img: '../../assets/symbols/j.webp' },
  ten: { label: '10', payout3: 4, payout2: 1, weight: 13, img: '../../assets/symbols/ten.webp' },
};
const normalIds = Object.keys(symbols);
const paylines = [[0,1,2],[3,4,5],[6,7,8],[0,4,8],[2,4,6]];

const el = {
  grid: document.getElementById('slotGrid'), balanceTop: document.getElementById('balanceTop'), balanceInline: document.getElementById('balanceInline'),
  betValue: document.getElementById('betValue'), lastWin: document.getElementById('lastWin'), balanceQuick: document.getElementById('balanceQuick'),
  freeSpins: document.getElementById('freeSpins'), bonusMultiplier: document.getElementById('bonusMultiplier'),
  statusBanner: document.getElementById('statusBanner'), history: document.getElementById('history'),
  paytable: document.getElementById('paytable'), spinBtn: document.getElementById('spinBtn'),
  betDown: document.getElementById('betDown'), betUp: document.getElementById('betUp'),
  turboBtn: document.getElementById('turboBtn'), autoBtn: document.getElementById('autoBtn'),
  soundBtn: document.getElementById('soundBtn'), loadingScreen: document.getElementById('loadingScreen'),
  loadingFill: document.getElementById('loadingFill'), loadingText: document.getElementById('loadingText'),
  winFlash: document.getElementById('winFlash'), coinRain: document.getElementById('coinRain'),
  bonusChargeLabel: document.getElementById('bonusChargeLabel'), bonusChargeFill: document.getElementById('bonusChargeFill'),
  lynxStage: document.getElementById('lynxStage'), lynxPotDrop: document.getElementById('lynxPotDrop'),
  lynxPotValue: document.getElementById('lynxPotValue'), lynxCharacter: document.getElementById('lynxCharacter'), slotMachine: document.getElementById('slotMachine'),
  bigWinOverlay: document.getElementById('bigWinOverlay'), bigWinKicker: document.getElementById('bigWinKicker'), bigWinTitle: document.getElementById('bigWinTitle'), bigWinAmount: document.getElementById('bigWinAmount'), bigWinSubtitle: document.getElementById('bigWinSubtitle')
};

let audioCtx = null;
function getAudio(){ if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }
function tone(freq=440,duration=.08,type='sine',gain=.03,delay=0){ if(!state.sound) return; const ctx=getAudio(); const osc=ctx.createOscillator(); const g=ctx.createGain(); osc.type=type; osc.frequency.value=freq; g.gain.setValueAtTime(.0001,ctx.currentTime+delay); g.gain.exponentialRampToValueAtTime(gain,ctx.currentTime+delay+.01); g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+delay+duration); osc.connect(g).connect(ctx.destination); osc.start(ctx.currentTime+delay); osc.stop(ctx.currentTime+delay+duration+.03); }
function sfxSpin(){ tone(170,.07,'square',.014); tone(235,.05,'square',.01,.04); }
function sfxStop(){ tone(440,.05,'triangle',.018); }
function sfxWin(){ [523,659,784,1047].forEach((f,i)=>tone(f,.16,'sine',.03,i*.06)); }
function sfxBonus(){ [392,523,659,784,1047].forEach((f,i)=>tone(f,.22,'triangle',.038,i*.08)); }
function sfxLynx(){ [330,440,660,880,1100].forEach((f,i)=>tone(f,.22,'triangle',.042,i*.065)); tone(150,.35,'sine',.035,.18); }
function sfxLynxLaunch(){ [260,320,420,580].forEach((f,i)=>tone(f,.12,'triangle',.03,i*.05)); tone(780,.22,'sine',.028,.16); }
function sfxFillTick(step=0){ tone(320 + step*26,.07,'square',.014); tone(520 + step*18,.05,'triangle',.012,.02); }
function sfxFillFinish(){ [440,554,659,880].forEach((f,i)=>tone(f,.14,'triangle',.026,i*.05)); }
function sfxSuspense(){ [210,240,270].forEach((f,i)=>tone(f,.18,'sawtooth',.016,i*.12)); tone(520,.16,'triangle',.018,.40); }
function sfxBigWin(mega=false){ const seq=mega?[392,523,659,784,1047,1319]:[392,494,587,784,988]; seq.forEach((f,i)=>tone(f,.2,'triangle',.038,i*.075)); if(mega) tone(130,.7,'sine',.042,.18); }
function winTier(value){ return value>=50?'MEGA GANHO':value>=10?'GRANDE GANHO':''; }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
async function animateWinCounter(target,{force=false,subtitle='Parabéns!',duration=1700}={}){
  if(!el.bigWinOverlay || target<=0) return;
  const tier=winTier(target) || (force?'GRANDE GANHO':'');
  if(!tier) return;
  const mega=tier==='MEGA GANHO';
  el.bigWinOverlay.classList.remove('mega','counting');
  if(mega) el.bigWinOverlay.classList.add('mega');
  el.bigWinOverlay.classList.add('show','counting');
  el.bigWinOverlay.setAttribute('aria-hidden','false');
  el.bigWinKicker.textContent='CONTANDO SEU PRÊMIO';
  el.bigWinTitle.textContent='GANHO';
  el.bigWinSubtitle.textContent=subtitle;
  sfxBigWin(mega);
  const start=performance.now();
  await new Promise(resolve=>{
    function step(now){
      const t=Math.min(1,(now-start)/duration);
      const eased=1-Math.pow(1-t,3);
      el.bigWinAmount.textContent=money.format(target*eased);
      if(t<1) requestAnimationFrame(step); else resolve();
    }
    requestAnimationFrame(step);
  });
  el.bigWinAmount.textContent=money.format(target);
  el.bigWinOverlay.classList.remove('counting');
  el.bigWinKicker.textContent=tier;
  el.bigWinTitle.textContent=tier;
  el.bigWinSubtitle.textContent=mega?'Prêmio especial!':'Grande prêmio!';
  await sleep(1300);
  el.bigWinOverlay.classList.remove('show','mega');
  el.bigWinOverlay.setAttribute('aria-hidden','true');
  await sleep(180);
}


function createCoinRain(count=22){ if(!el.coinRain) return; el.coinRain.innerHTML=''; for(let i=0;i<count;i++){ const c=document.createElement('i'); c.className='coin'; c.style.left=`${Math.random()*94+2}%`; c.style.setProperty('--dur',`${1.1+Math.random()*1.2}s`); c.style.animationDelay=`${Math.random()*.35}s`; el.coinRain.appendChild(c);} setTimeout(()=>el.coinRain.innerHTML='',2600); }
function showWinFx(big=false){ if(el.winFlash){el.winFlash.classList.remove('show'); void el.winFlash.offsetWidth; el.winFlash.classList.add('show');} createCoinRain(big?34:18); }

function saveState(){ localStorage.setItem(LS_KEY, JSON.stringify({ balance:state.balance,betIndex:state.betIndex,freeSpins:state.freeSpins,bonusMultiplier:state.bonusMultiplier,turbo:state.turbo,sound:state.sound,bonusCharge:state.bonusCharge })); }
function loadState(){ const raw=localStorage.getItem(LS_KEY); if(!raw) return; try{ const p=JSON.parse(raw); if(typeof p.balance==='number')state.balance=p.balance; if(typeof p.betIndex==='number')state.betIndex=p.betIndex; if(typeof p.freeSpins==='number')state.freeSpins=p.freeSpins; if(typeof p.bonusMultiplier==='number')state.bonusMultiplier=p.bonusMultiplier; if(typeof p.turbo==='boolean')state.turbo=p.turbo; if(typeof p.sound==='boolean')state.sound=p.sound; if(typeof p.bonusCharge==='number')state.bonusCharge=p.bonusCharge; }catch{} }
function setBonusCharge(v){ const prev = state.bonusCharge; state.bonusCharge=Math.max(0,Math.min(100,Math.round(v))); if(el.bonusChargeLabel)el.bonusChargeLabel.textContent=`${state.bonusCharge}%`; if(el.bonusChargeFill)el.bonusChargeFill.style.width=`${state.bonusCharge}%`; if(el.lynxStage)el.lynxStage.classList.toggle('charged',state.bonusCharge>=100); if(prev < 100 && state.bonusCharge >= 100){ updateStatus('O Lynx está segurando o pote bônus!', 'bonus'); addHistory('O <b>Pote do Lince</b> ficou pronto para ser lançado.'); } }
function addBonusCharge(v){ setBonusCharge(state.bonusCharge+v); }

const reelProfiles = [
  { wild:2, scatter:1, gold:6, jade:6, envelope:8, firecrackers:8, accessory:8, a:12, k:12, q:12, j:12, ten:13 },
  { wild:4, scatter:2, gold:6, jade:6, envelope:8, firecrackers:8, accessory:8, a:11, k:11, q:11, j:11, ten:12 },
  { wild:2, scatter:1, gold:6, jade:6, envelope:8, firecrackers:8, accessory:8, a:12, k:12, q:12, j:12, ten:13 }
];
function weightedRandomSymbol(col=0){ const profile = reelProfiles[col] || reelProfiles[0]; const pool=[]; normalIds.forEach(id=>{ const w = profile[id] ?? symbols[id].weight; for(let i=0;i<w;i++) pool.push(id); }); return pool[Math.floor(Math.random()*pool.length)]; }
function generateGrid(){ const grid = Array.from({length:9},(_,idx)=>weightedRandomSymbol(idx%3)); const boostRoll = Math.random(); if(boostRoll < 0.42){ const line = paylines[Math.floor(Math.random()*paylines.length)]; const chosen = Math.random() < 0.24 ? 'wild' : ['ten','j','q','k','a','accessory','firecrackers'][Math.floor(Math.random()*7)]; const cellsToForce = Math.random() < 0.72 ? 2 : 3; line.slice(0,cellsToForce).forEach(i=>{ grid[i] = chosen === 'wild' && Math.random() < 0.55 ? 'wild' : chosen; }); if(cellsToForce === 2 && Math.random() < 0.35){ const wildCell = line[2]; grid[wildCell] = 'wild'; } } if(Math.random() < 0.22){ const centerChoices = ['wild','gold','jade','envelope','accessory']; grid[4] = centerChoices[Math.floor(Math.random()*centerChoices.length)]; } return grid; }
function makeInitialGrid(){ state.grid=generateGrid(); }
function renderGrid(highlights=[], blankIndices=[]){ el.grid.innerHTML=''; state.grid.forEach((id,idx)=>{ const isBlank = blankIndices.includes(idx) || !id; const cell=document.createElement('div'); cell.className='symbol-cell'+(highlights.includes(idx)?' highlight':'')+(isBlank?' empty':''); if(!isBlank){ const img=document.createElement('img'); img.src=symbols[id].img; img.alt=symbols[id].label; cell.appendChild(img); } else { const spark=document.createElement('span'); spark.className='empty-core'; cell.appendChild(spark);} el.grid.appendChild(cell); }); }
function renderPaytable(){ if(!el.paytable) return; const ids=['wild','scatter','gold','jade','envelope','firecrackers','accessory','a','k','q','j','ten']; el.paytable.innerHTML=''; ids.forEach(id=>{ const s=symbols[id]; const row=document.createElement('div'); row.className='pay-row'; row.innerHTML=`<img src="${s.img}" alt="${s.label}"><div><strong>${s.label}</strong><small>${id==='wild'?'Substitui todos, exceto SCATTER':id==='scatter'?'3 ativam bônus':'Símbolo pagante'}</small></div><div><strong>${s.payout3?`x${s.payout3}`:'BÔNUS'}</strong></div>`; el.paytable.appendChild(row); }); }
function updateUI(){ const bet=state.betOptions[state.betIndex]; el.balanceTop.textContent=money.format(state.balance); if(el.balanceInline) el.balanceInline.textContent=money.format(state.balance); if(el.balanceQuick) el.balanceQuick.textContent=money.format(state.balance); el.betValue.textContent=money.format(bet); el.lastWin.textContent=money.format(state.lastWin); el.freeSpins.textContent=String(state.freeSpins); el.bonusMultiplier.textContent=`x${state.bonusMultiplier}`; setBonusCharge(state.bonusCharge); el.turboBtn.classList.toggle('active',state.turbo); el.autoBtn.classList.toggle('active',state.autoSpins>0); el.soundBtn.classList.toggle('active',state.sound); el.soundBtn.textContent=state.sound?'Som':'Mudo'; saveState(); }
function addHistory(message){ if(!el.history) return; const item=document.createElement('div'); item.className='history-item'; item.innerHTML=`<b>${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</b> — ${message}`; el.history.prepend(item); while(el.history.children.length>12)el.history.removeChild(el.history.lastChild); }
function updateStatus(message,type='normal'){ el.statusBanner.textContent=message; if(type==='win')el.statusBanner.style.background='linear-gradient(135deg,#f2ca65,#f48f37)'; else if(type==='bonus')el.statusBanner.style.background='linear-gradient(135deg,#8436ff,#ff5a79)'; else el.statusBanner.style.background='linear-gradient(135deg,#0b6e58,#17a26f)'; }

function evaluatePayline(indices){ const ids=indices.map(i=>state.grid[i]); const nonWild=ids.filter(id=>id!=='wild'); if(nonWild.length===0)return{symbol:'wild',count:3,payout:symbols.wild.payout3,cells:indices}; const base=nonWild[0]; if(base==='scatter')return null; const matchCount=ids.filter(id=>id===base||id==='wild').length; if(matchCount>=3)return{symbol:base,count:3,payout:symbols[base].payout3,cells:indices}; if(matchCount===2){const pairCells=indices.filter(i=>state.grid[i]===base||state.grid[i]==='wild').slice(0,2);return{symbol:base,count:2,payout:symbols[base].payout2,cells:pairCells}} return null; }
function evaluateGrid(){ let total=0; const scatters=state.grid.filter(id=>id==='scatter').length; const wilds=state.grid.filter(id=>id==='wild').length; const wildIndices=state.grid.map((id,idx)=>id==='wild'?idx:-1).filter(idx=>idx!==-1); let highlights=[]; let messages=[]; let lineWins=[]; paylines.forEach((line,idx)=>{const r=evaluatePayline(line);if(r&&r.payout>0){const w=r.payout*state.betOptions[state.betIndex]*state.bonusMultiplier;total+=w;highlights.push(...r.cells);messages.push(`Linha ${idx+1}: ${r.symbol.toUpperCase()} x${r.count} pagou ${money.format(w)}.`); lineWins.push({lineIndex:idx+1,cells:r.cells,symbol:r.symbol,count:r.count,amount:w});}}); return{total,scatters,wilds,wildIndices,highlights:[...new Set(highlights)],messages,lineWins}; }
function randomBonusMultiplier(){ const a=[2,2,3,3]; return a[Math.floor(Math.random()*a.length)]; }
function setColumnValues(grid,col,values){ [0,1,2].forEach((row,i)=>{ grid[row*3+col] = values[i]; }); }
function getColumnValues(grid,col){ return [grid[col], grid[col+3], grid[col+6]]; }
function randomColumn(col){ return [weightedRandomSymbol(col), weightedRandomSymbol(col), weightedRandomSymbol(col)]; }
async function animateSpin(){ const cycles=state.turbo?11:18; const delay=state.turbo?82:150; const stopAt = state.turbo ? [6,8,11] : [10,14,18]; const finalGrid = generateGrid(); const workingGrid = generateGrid(); for(let i=0;i<cycles;i++){ for(let col=0; col<3; col++){ const columnValues = i >= stopAt[col]-1 ? getColumnValues(finalGrid,col) : randomColumn(col); setColumnValues(workingGrid,col,columnValues); } state.grid = [...workingGrid]; renderGrid(); if(i%2===0)sfxSpin(); if(i===stopAt[0]-1 || i===stopAt[1]-1 || i===stopAt[2]-1) sfxStop(); await new Promise(r=>setTimeout(r,delay)); } state.grid = [...finalGrid]; renderGrid(); }

function refreshPotTarget(){
  if(!el.lynxStage || !el.lynxPotDrop || !el.grid) return;
  const stageRect = el.lynxStage.getBoundingClientRect();
  const gridRect = el.grid.getBoundingClientRect();
  const charRect = el.lynxCharacter ? el.lynxCharacter.getBoundingClientRect() : stageRect;
  const potW = 72;
  const potH = 72;
  const startX = Math.max(10, (charRect.left + charRect.width*0.74) - stageRect.left - potW/2);
  const startY = Math.max(6, (charRect.top + charRect.height*0.50) - stageRect.top - potH/2);
  const endX = (gridRect.left + gridRect.width/2) - stageRect.left - potW/2;
  const endY = (gridRect.top + gridRect.height/2) - stageRect.top - potH/2;
  const midX = startX + (endX - startX) * 0.58;
  const midY = Math.max(0, startY - 34);
  const mid2X = startX + (endX - startX) * 0.84;
  const mid2Y = startY + (endY - startY) * 0.68 - 12;
  el.lynxPotDrop.style.setProperty('--pot-start-x', `${startX}px`);
  el.lynxPotDrop.style.setProperty('--pot-start-y', `${startY}px`);
  el.lynxPotDrop.style.setProperty('--pot-mid-x', `${midX}px`);
  el.lynxPotDrop.style.setProperty('--pot-mid-y', `${midY}px`);
  el.lynxPotDrop.style.setProperty('--pot-mid2-x', `${mid2X}px`);
  el.lynxPotDrop.style.setProperty('--pot-mid2-y', `${mid2Y}px`);
  el.lynxPotDrop.style.setProperty('--pot-end-x', `${endX}px`);
  el.lynxPotDrop.style.setProperty('--pot-end-y', `${endY}px`);
}

async function animateLynxFillSequence(){
  const delay = state.turbo ? 145 : 260;
  const previous = [...state.grid];
  const fillOrder = [0,3,6,1,4,7,2,5,8];
  state.grid = new Array(9).fill(null);
  renderGrid([], fillOrder);
  if(el.slotMachine) el.slotMachine.classList.add('fill-sequence');
  updateStatus('O pote caiu no centro do slot... preenchendo as lacunas!', 'bonus');
  await new Promise(r=>setTimeout(r, 320));
  for(let i=0;i<fillOrder.length;i++){
    const idx = fillOrder[i];
    const pick = previous[idx] || weightedRandomSymbol(idx%3);
    state.grid[idx] = pick;
    const stillBlank = fillOrder.slice(i+1);
    renderGrid([idx], stillBlank);
    sfxFillTick(i);
    await new Promise(r=>setTimeout(r, delay));
  }
  if(el.slotMachine) el.slotMachine.classList.remove('fill-sequence');
  sfxFillFinish();
  const finalOutcome = evaluateGrid();
  renderGrid(finalOutcome.highlights);
  return finalOutcome;
}

async function playLynxBonusPot(baseWin){
  const bonus=Number((baseWin*10).toFixed(2));
  const animationMs = 2400;
  refreshPotTarget();
  if(el.lynxPotValue)el.lynxPotValue.textContent=`+ ${money.format(bonus)}`;
  if(el.lynxStage){el.lynxStage.classList.remove('charged');el.lynxStage.classList.add('bonus-release');}
  if(el.slotMachine){el.slotMachine.classList.remove('lynx-impact');}
  if(el.lynxCharacter){
    const staticSrc = el.lynxCharacter.dataset.staticSrc || '../../assets/characters/lynx-top.webp';
    const gifSrc = (el.lynxCharacter.dataset.gifSrc || '../../assets/characters/lynx-bonus.webp') + '?v=' + Date.now();
    el.lynxCharacter.src = gifSrc;
    setTimeout(()=>{ el.lynxCharacter.src = staticSrc; }, animationMs);
  }
  updateStatus('Lynx segurando o pote... lançando bônus!', 'bonus');
  sfxLynx();
  await new Promise(r=>setTimeout(r, 260));
  if(el.lynxPotDrop){el.lynxPotDrop.classList.remove('show');void el.lynxPotDrop.offsetWidth;el.lynxPotDrop.classList.add('show');}
  sfxLynxLaunch();
  setTimeout(()=>{ if(el.slotMachine) el.slotMachine.classList.add('lynx-impact'); }, 720);
  await new Promise(r=>setTimeout(r, 980));
  const fillOutcome = await animateLynxFillSequence();
  const extraWin = Number(fillOutcome.total.toFixed(2));
  if(extraWin>0){ state.balance += extraWin; state.lastWin = Number((state.lastWin + extraWin).toFixed(2)); addHistory(`O preenchimento do slot gerou <b>${money.format(extraWin)}</b> adicionais.`); showWinFx(extraWin >= state.betOptions[state.betIndex]*5); }
  state.balance+=bonus; state.lastWin=Number((state.lastWin+bonus).toFixed(2)); setBonusCharge(0);
  const lynxBonusTotal = Number((bonus + extraWin).toFixed(2));
  addHistory(`O <b>Pote do Lince</b> foi liberado: bônus extra de <b>${money.format(bonus)}</b> (10x do ganho base).`);
  updateStatus(`POTE DO LINCE! +${money.format(bonus)} em bônus x10!`,'bonus');
  await animateWinCounter(lynxBonusTotal,{force:true,subtitle:'Bônus WILD x10',duration:2200});
  await new Promise(r=>setTimeout(r, 420));
  if(el.lynxStage)el.lynxStage.classList.remove('bonus-release');
  if(el.slotMachine)el.slotMachine.classList.remove('lynx-impact');
  updateUI();
}

async function animateWinningLines(lineWins){
  if(!lineWins || !lineWins.length) return;
  for(const win of lineWins){
    renderGrid(win.cells);
    updateStatus(`Linha ${win.lineIndex} venceu com ${win.symbol.toUpperCase()} x${win.count} — ${money.format(win.amount)}.`, 'win');
    await new Promise(r=>setTimeout(r, state.turbo ? 220 : 420));
  }
}

async function animateAlmostBonus(outcome){
  if(!el.slotMachine) return;
  el.slotMachine.classList.add('almost-bonus');
  renderGrid(outcome.wildIndices, []);
  updateStatus('Quase! 2 WILDs apareceram e o Lynx entrou em suspense...', 'bonus');
  addHistory('Quase bônus: <b>2 WILDs</b> apareceram neste giro.');
  sfxSuspense();
  await new Promise(r=>setTimeout(r, 900));
  el.slotMachine.classList.remove('almost-bonus');
  renderGrid(outcome.highlights, []);
}

async function spin(){
  if(state.spinning)return;
  const bet=state.betOptions[state.betIndex]; const inFreeSpins=state.freeSpins>0;
  if(!inFreeSpins&&state.balance<bet){updateStatus('Saldo insuficiente para girar.');addHistory('Tentativa de giro sem saldo suficiente.');return;}
  state.spinning=true;el.spinBtn.disabled=true;
  if(inFreeSpins){state.freeSpins-=1;updateStatus(`Rodada grátis... ${state.freeSpins} restantes.`,'bonus')}else{state.balance-=bet;updateStatus('Girando...')}
  updateUI(); await animateSpin();
  const outcome=evaluateGrid(); renderGrid(outcome.highlights);
  if(outcome.wilds===2){ await animateAlmostBonus(outcome); }
  if(outcome.wilds>0){ addBonusCharge(outcome.wilds * 25); addHistory(`WILD x${outcome.wilds}: o Pote do Lince acumulou energia.`); }
  state.lastWin=Number(outcome.total.toFixed(2));
  if(outcome.total>0){state.balance+=state.lastWin; await animateWinningLines(outcome.lineWins); updateStatus(`Você ganhou ${money.format(state.lastWin)}!`,'win');showWinFx(state.lastWin>=bet*10);sfxWin();addHistory(`Vitória de <b>${money.format(state.lastWin)}</b>. ${outcome.messages.join(' ')}`); renderGrid(outcome.highlights); if(state.lastWin>=10) await animateWinCounter(state.lastWin,{subtitle:'Vitória do giro'});}else{updateStatus(inFreeSpins?'Rodada grátis sem prêmio.':'Sem vitória neste giro.');addHistory(inFreeSpins?'Rodada grátis sem premiação.':'Giro sem vitória.')}
  if(outcome.scatters>=3){state.freeSpins+=8;state.bonusMultiplier=randomBonusMultiplier();updateStatus(`BÔNUS! 8 giros grátis + multiplicador x${state.bonusMultiplier}.`,'bonus');showWinFx(true);sfxBonus();addHistory(`SCATTER x${outcome.scatters}: <b>8 giros grátis</b> e multiplicador <b>x${state.bonusMultiplier}</b>.`)}else if(state.freeSpins===0){state.bonusMultiplier=1}
  const baseWin=state.lastWin; if(baseWin>0&&state.bonusCharge>=100) await playLynxBonusPot(baseWin);
  updateUI(); state.spinning=false;el.spinBtn.disabled=false;
  if(state.autoSpins>0){state.autoSpins-=1;updateUI();setTimeout(spin,state.turbo?340:760)}
}

function setupEvents(){
  el.betDown.addEventListener('click',()=>{if(state.spinning)return;state.betIndex=Math.max(0,state.betIndex-1);updateUI()});
  el.betUp.addEventListener('click',()=>{if(state.spinning)return;state.betIndex=Math.min(state.betOptions.length-1,state.betIndex+1);updateUI()});
  el.spinBtn.addEventListener('click',spin);
  el.turboBtn.addEventListener('click',()=>{state.turbo=!state.turbo;updateUI()});
  el.autoBtn.addEventListener('click',()=>{if(state.spinning)return;state.autoSpins=state.autoSpins>0?0:10;updateUI();if(state.autoSpins>0)spin()});
  el.soundBtn.addEventListener('click',()=>{state.sound=!state.sound;updateUI()});
}
window.addEventListener('resize', refreshPotTarget);
window.addEventListener('load', refreshPotTarget);

function bootLoading(){ let p=0;const phases=['Carregando símbolos...','Preparando o Lynx...','Ajustando efeitos...','Pronto para jogar!'];const timer=setInterval(()=>{p+=Math.random()*20+7;const val=Math.min(100,p);el.loadingFill.style.width=`${val}%`;if(el.loadingText)el.loadingText.textContent=phases[Math.min(phases.length-1,Math.floor(val/27))];if(p>=100){clearInterval(timer);setTimeout(()=>el.loadingScreen.classList.add('hide'),220)}},95); }

loadState(); state.turbo = false; makeInitialGrid(); renderGrid(); renderPaytable(); setupEvents(); updateUI(); refreshPotTarget(); addHistory('Fortune Lynx reequilibrado: mais próximo do ritmo do Fortune Tiger, com mais WILD e ganhos mais consistentes.'); updateStatus('Pronto para girar.'); bootLoading();
