document.getElementById('rollButton').addEventListener('click', function() {
    const selectedDice = document.querySelector('input[name="dice"]:checked').value;
    const result = rollDice(selectedDice);
    document.getElementById('result').textContent = `Результат броска: ${result}`;
    visualizeDice(result, selectedDice);
});

function rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

function visualizeDice(result, sides) {
    const diceContainer = document.getElementById('diceContainer');
    diceContainer.innerHTML = ''; // Clear previous dice
    for (let i = 1; i <= sides; i++) {
        const dice = document.createElement('div');
        dice.className = 'dice';
        dice.textContent = i;
        if (i == result) {
            dice.style.backgroundColor = '#28a745'; // Highlight the rolled number
        }
        diceContainer.appendChild(dice);
    }
}
