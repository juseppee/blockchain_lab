document.addEventListener('DOMContentLoaded', async function() {
    // Убедитесь, что MetaMask установлен
    if (typeof window.ethereum !== 'undefined') {
        // Запросить доступ к аккаунтам MetaMask
        await ethereum.request({ method: 'eth_requestAccounts' });
        const web3 = new Web3(window.ethereum);

        // Адрес контракта и ABI (Application Binary Interface)
        const contractAddress = '0x4bCC4d60cFfa3836bE33297F75fDFFd9455c5D08';
        const contractABI = [ [
            {
                "inputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "message",
                        "type": "string"
                    },
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "returnValue",
                        "type": "string"
                    }
                ],
                "name": "PaymentEvent",
                "type": "event"
            },
            {
                "payable": true,
                "stateMutability": "payable",
                "type": "fallback"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "balance",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [],
                "name": "doPayment",
                "outputs": [],
                "payable": true,
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "getBalance",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "getSegments",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [],
                "name": "kill",
                "outputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "owner",
                "outputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "newSegments",
                        "type": "uint256"
                    }
                ],
                "name": "setSegments",
                "outputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "withdrawBalance",
                "outputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ] ];

        const contract = new web3.eth.Contract(contractABI, contractAddress);

        // Получение аккаунта пользователя
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];

        const balanceSpan = document.getElementById('balance');
        const betAmountInput = document.getElementById('bet-amount');
        const betValueInput = document.getElementById('bet-value');
        const spinButton = document.getElementById('spin');
        const resultDiv = document.getElementById('result');
        const depositAmountInput = document.getElementById('deposit-amount');
        const depositButton = document.getElementById('deposit');
        const withdrawButton = document.getElementById('withdraw');

        // Обновление баланса на экране
        async function updateBalance() {
            const balance = await contract.methods.getBalance().call();
            balanceSpan.innerText = balance;
        }

        // Функция для внесения платежа
        async function makePayment(betAmount) {
            await contract.methods.doPayment().send({
                from: account,
                value: web3.utils.toWei(betAmount, 'ether')
            });
        }

        // Функция для пополнения баланса
        async function depositFunds(amount) {
            await web3.eth.sendTransaction({
                from: account,
                to: contractAddress,
                value: web3.utils.toWei(amount, 'ether')
            });
            updateBalance();
        }

        // Функция для вывода баланса
        async function withdrawFunds() {
            const balance = await contract.methods.getBalance().call();
            await contract.methods.withdrawBalance(balance).send({ from: account });
            updateBalance();
        }

        // Обработчик клика на кнопку Spin
        spinButton.addEventListener('click', async () => {
            const betAmount = parseFloat(betAmountInput.value);
            if (!isNaN(betAmount) && betAmount > 0) {
                await makePayment(betAmount.toString());
                spin();
            } else {
                alert("Пожалуйста, введите корректную сумму ставки.");
            }
        });

        // Обработчик клика на кнопку пополнения
        depositButton.addEventListener('click', async () => {
            const depositAmount = parseFloat(depositAmountInput.value);
            if (!isNaN(depositAmount) && depositAmount > 0) {
                await depositFunds(depositAmount.toString());
            } else {
                alert("Пожалуйста, введите корректную сумму для пополнения.");
            }
        });

        // Обработчик клика на кнопку вывода
        withdrawButton.addEventListener('click', async () => {
            await withdrawFunds();
        });

        // Пример обработки события
        contract.events.PaymentEvent({}, (error, event) => {
            console.log(event.returnValues);
        });

        // Обработчик изменения количества сегментов
        document.querySelectorAll('input[name="wheel-options"]').forEach(radio => {
            radio.addEventListener('change', async event => {
                const newSegments = parseInt(event.target.value);
                await contract.methods.setSegments(newSegments).send({ from: account });
                drawWheel(newSegments);
            });
        });

        // Обновить баланс при загрузке
        updateBalance();

        // Остальной ваш код...

   // Остальной ваш код...
    function spin() {
        const betAmount = parseFloat(betAmountInput.value);
        const betValue = parseInt(betValueInput.value);

        if (isNaN(betAmount) || isNaN(betValue) || betValue < 1 || betValue > currentSegments) {
            alert("Пожалуйста, введите корректные значения ставки и числа.");
            return;
        }

        if (betAmount > balance) {
            alert("Недостаточно средств на балансе.");
            return;
        }

        container.on("click", null);

        if (oldpick.length === currentSegments) {
            container.on("click", null);
            return;
        }

        const ps = 360 / currentSegments;
        const rng = Math.floor((Math.random() * 1440) + 360);

        rotation = (Math.round(rng / ps) * ps);

        picked = Math.round(currentSegments - (rotation % 360) / ps);
        picked = picked >= currentSegments ? (picked % currentSegments) : picked;

        if (oldpick.indexOf(picked) !== -1) {
            spin();
            return;
        } else {
            oldpick.push(picked);
        }

        rotation += 90 - Math.round(ps / 2) + (Math.random() * ps - ps / 2); // добавляем случайное смещение

        vis.transition()
            .duration(5000) // Увеличиваем продолжительность для уменьшения скорости
            .attrTween("transform", rotTween)
            .each("end", function() {
                d3.select(".slice:nth-child(" + (picked + 1) + ") path");
                const resultText = `Winning Segment: ${picked + 1}`;
                if (picked + 1 === betValue) {
                    const winAmount = betAmount * currentSegments;
                    balance += winAmount;
                    resultDiv.innerText = `${resultText}\nВы выиграли ${winAmount} единиц!`;
                } else {
                    balance -= betAmount;
                    resultDiv.innerText = `${resultText}\nВы проиграли.`;
                }
                balanceSpan.innerText = balance;
                oldrotation = rotation;
                container.on("click", spin);
            });
    }

    function drawWheel(segments) {
        const data = Array.from({length: segments}, (_, i) => ({
            label: `Значение ${i + 1}`,
            value: i + 1,
        }));

        svg.data([data]);

        const arcs = vis.selectAll("g.slice")
            .data(pie(data))
            .enter()
            .append("g")
            .attr("class", "slice");

        arcs.append("path")
            .attr("fill", (d, i) => color(i))
            .attr("d", arc);

        arcs.append("text")
            .attr("transform", function(d) {
                d.innerRadius = 0;
                d.outerRadius = r;
                d.angle = (d.startAngle + d.endAngle) / 2;
                return `rotate(${d.angle * 180 / Math.PI - 90})translate(${d.outerRadius - 10})`;
            })
            .attr("text-anchor", "end")
            .text((d, i) => data[i].label);

        container.on("click", spin);

        svg.append("g")
            .attr("transform", `translate(${w + padding.left + padding.right}, ${(h / 2) + padding.top})`)
            .append("path")
            .attr("d", `M-${r * .15},0L0,${r * .05}L0,-${r * .05}Z`)
            .style({"fill":"black"});

        container.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 60)
            .style({"fill":"white","cursor":"pointer"});

        container.append("text")
            .attr("x", 0)
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .text("SPIN")
            .style({"font-weight":"bold", "font-size":"30px"});
    }
    } else {
        alert('Please install MetaMask!');
    }
});
