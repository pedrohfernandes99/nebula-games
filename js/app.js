const money = new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const state = {
  balance: Number(localStorage.getItem('nebula_demo_balance') || 1000)
};
const updateBalance = () => {
  document.getElementById('balanceTop').textContent = money.format(state.balance);
  document.getElementById('balanceModal').textContent = money.format(state.balance);
  localStorage.setItem('nebula_demo_balance', state.balance.toFixed(2));
};
const toast = msg => {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),2200);
};
updateBalance();

document.querySelectorAll('[data-modal]').forEach(btn=>btn.addEventListener('click',()=>{
  document.getElementById(btn.dataset.modal).classList.add('open');
}));
document.querySelectorAll('.close').forEach(btn=>btn.addEventListener('click',()=>btn.closest('.modal').classList.remove('open')));
document.querySelectorAll('.modal').forEach(modal=>modal.addEventListener('click',e=>{ if(e.target===modal) modal.classList.remove('open'); }));
document.getElementById('fakeLogin')?.addEventListener('click',()=>{ document.getElementById('loginModal').classList.remove('open'); toast('Entrou na demonstração.'); });
document.querySelectorAll('[data-money]').forEach(btn=>btn.addEventListener('click',()=>{
  state.balance = Math.max(0, state.balance + Number(btn.dataset.money));
  updateBalance();
  toast(`Saldo atualizado: ${money.format(state.balance)}`);
}));
document.getElementById('scrollGames')?.addEventListener('click',()=>document.getElementById('games').scrollIntoView({behavior:'smooth'}));
document.querySelectorAll('.chip').forEach(chip=>chip.addEventListener('click',()=>{
  document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
  chip.classList.add('active');
  const filter = chip.dataset.filter;
  document.querySelectorAll('.game-card').forEach(card=>{
    card.style.display = (filter==='all' || card.dataset.category===filter) ? '' : 'none';
  });
}));
document.querySelectorAll('.cover.locked').forEach(btn=>btn.addEventListener('click',()=>toast(`${btn.dataset.coming} será o próximo da fila.`)));
document.querySelectorAll('.heart').forEach(btn=>btn.addEventListener('click',()=>{
  btn.textContent = btn.textContent === '♡' ? '♥' : '♡';
}));
