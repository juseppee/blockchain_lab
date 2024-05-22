document.getElementById('rollButton').addEventListener('click', function() {
    const selectedDice = document.querySelector('input[name="dice"]:checked').value;
    const result = rollDice(selectedDice);
    document.getElementById('result').textContent = `Результат броска: ${result}`;
    rollDiceAnimation(result);
});

function rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

function rollDiceAnimation(result) {
    const dice = document.getElementById('dice');
    const randomX = Math.floor(Math.random() * 360);
    const randomY = Math.floor(Math.random() * 360);
    dice.style.transform = `rotateX(${randomX}deg) rotateY(${randomY}deg)`;
}
