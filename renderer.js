const head = document.getElementById('head');
const newGameBtn = document.getElementById('newGameBtn')

newGameBtn.addEventListener('click', () => {
   props.newGame();
})