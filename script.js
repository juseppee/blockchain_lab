document.addEventListener('DOMContentLoaded', async function() {
    // Убедитесь, что MetaMask установлен
    if (typeof window.ethereum !== 'undefined') {
        // Запросить доступ к аккаунтам MetaMask
        await ethereum.request({ method: 'eth_requestAccounts' });
        const web3 = new Web3(window.ethereum);

        // Адрес контракта и ABI (Application Binary Interface)
        const contractAddress = 'YOUR_CONTRACT_ADDRESS';
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

        function spin() {
            // Ваш код для спина колеса
        }

        function drawWheel(segments) {
            // Ваш код для рисования колеса
        }
    } else {
        alert('Please install MetaMask!');
    }
});
