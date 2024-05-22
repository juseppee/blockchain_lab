document.getElementById('rollButton').addEventListener('click', function() {
    const selectedDice = document.querySelector('input[name="dice"]:checked').value;
    const result = rollDice(selectedDice);
    document.getElementById('result').textContent = `Результат броска: ${result}`;
    createDice(selectedDice);
    rollDiceAnimation(result, selectedDice);
});

function rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

function createDice(sides) {
    const diceContainer = document.getElementById('diceContainer');
    diceContainer.innerHTML = ''; // Clear previous dice

    const dice = document.createElement('div');
    dice.className = 'dice';
    dice.id = 'dice';

    for (let i = 1; i <= 10; i++) {
        const face = document.createElement('div');
        face.className = 'face';
        face.textContent = i;
        if (i > sides) {
            face.classList.add('face-hidden');
        }
        dice.appendChild(face);
    }

    diceContainer.appendChild(dice);
}

function rollDiceAnimation(result, sides) {
    const dice = document.getElementById('dice');
    const randomX = Math.floor(Math.random() * 360);
    const randomY = Math.floor(Math.random() * 360);

    const angleX = 90 * ((result - 1) % 4);
    const angleY = 90 * Math.floor((result - 1) / 4);

    dice.style.transform = `rotateX(${randomX + angleX}deg) rotateY(${randomY + angleY}deg)`;
}
