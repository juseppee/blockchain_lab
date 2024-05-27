document.addEventListener('DOMContentLoaded', function() {
    const padding = {top: 20, right: 40, bottom: 0, left: 0};
    const w = 500 - padding.left - padding.right;
    const h = 500 - padding.top - padding.bottom;
    const r = Math.min(w, h) / 2;
    let rotation = 0;
    let oldrotation = 0;
    let picked = 100000;
    let oldpick = [];
    const color = d3.scale.category20();
    
    let currentSegments = 4;
    const resultDiv = document.getElementById('result');
    const betAmountInput = document.getElementById('bet-amount');
    const betValueInput = document.getElementById('bet-value');
    const spinButton = document.getElementById('spin');
    const balanceSpan = document.getElementById('balance');
    const contractBalanceSpan = document.getElementById('contract-balance');
    const depositButton = document.getElementById('deposit');
    const withdrawButton = document.getElementById('withdraw');
    
    let balance = 1000; // Initial balance
    let userAccount;
    let web3;
    let contract;
    let svg; // Объявляем переменную svg здесь

    const contractAddress = '0x4bCC4d60cFfa3836bE33297F75fDFFd9455c5D08';
    const contractABI = [
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
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "payoutToUser",
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
    ];

    async function initWeb3() {
        if (window.ethereum) {
            web3 = new Web3(window.ethereum);
            try {
                await window.ethereum.enable();
                const accounts = await web3.eth.getAccounts();
                userAccount = accounts[0];
                contract = new web3.eth.Contract(contractABI, contractAddress);
                updateBalances();
            } catch (error) {
                console.error("User denied account access");
            }
        } else {
            console.log('Please install MetaMask!');
            alert('Please install MetaMask!');
        }
    }

    async function updateBalances() {
        const balance = await web3.eth.getBalance(userAccount);
        balanceSpan.innerText = web3.utils.fromWei(balance, 'ether');

        const contractBalance = await contract.methods.getBalance().call();
        contractBalanceSpan.innerText = web3.utils.fromWei(contractBalance, 'ether');
    }

    async function deposit() {
        const amount = parseFloat(betAmountInput.value);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        await contract.methods.doPayment().send({
            from: userAccount,
            value: web3.utils.toWei(amount.toString(), 'ether')
        });
        updateBalances();
    }

    async function withdraw() {
        const amount = parseFloat(prompt('Enter amount to withdraw:'));
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        await contract.methods.withdrawBalance(web3.utils.toWei(amount.toString(), 'ether')).send({ from: userAccount });
        updateBalances();
    }

    function drawWheel(svg, segments) { // Добавляем svg в аргументы функции
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

    // Добавлено обновление балансов и инициализация Web3
    spinButton.addEventListener('click', async function() {
        await deposit();
        spin();
    });   // Инициализация Web3
    initWeb3();

    function spin() {
        const betAmount = parseFloat(betAmountInput.value);
        const betValue = parseInt(betValueInput.value);
        
        if (isNaN(betAmount) || isNaN(betValue) || betValue < 1 || betValue > currentSegments) {
            alert("Please enter valid bet amount and value.");
            return;
        }
        
        if (betAmount > parseFloat(balanceSpan.innerText)) {
            alert("Insufficient funds.");
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
            .each("end", async function() {
                const resultText = `Winning Segment: ${picked + 1}`;
                if (picked + 1 === betValue) {
                    const winAmount = betAmount * currentSegments;
                    await contract.methods.payoutToUser(web3.utils.toWei(winAmount.toString(), 'ether')).send({ from: userAccount });
                    resultDiv.innerText = `${resultText}\nYou won ${winAmount} units!`;
                } else {
                    resultDiv.innerText = `${resultText}\nYou lost.`;
                }
                updateBalances();
                oldrotation = rotation;
                container.on("click", spin);
            });
    }

    function rotTween(to) {
        const i = d3.interpolate(oldrotation % 360, rotation);
        return function(t) {
            return `rotate(${i(t)})`;
        };
    }

    document.querySelectorAll('input[name="wheel-options"]').forEach(radio => {
        radio.addEventListener('change', event => {
            currentSegments = parseInt(event.target.value);
            oldpick = [];
            rotation = 0;
            oldrotation = 0;
            vis.selectAll("*").remove();
            drawWheel(svg, currentSegments); // Передаем svg в drawWheel
        });
    });

    drawWheel(svg, currentSegments); // Передаем svg в drawWheel
});