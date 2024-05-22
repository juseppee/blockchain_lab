document.getElementById('rollButton').addEventListener('click', function() {
    const selectedDice = document.querySelector('input[name="dice"]:checked').value;
    const result = rollDice(selectedDice);
    document.getElementById('result').textContent = `Результат броска: ${result}`;
});

function rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
}