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
    
    let balance = 1000; // Initial balance

    const svg = d3.select('#chart')
        .append("svg")
        .data([[]])
        .attr("width",  w + padding.left + padding.right)
        .attr("height", h + padding.top + padding.bottom);
    
    const container = svg.append("g")
        .attr("class", "chartholder")
        .attr("transform", "translate(" + (w / 2 + padding.left) + "," + (h / 2 + padding.top) + ")");
    
    const vis = container.append("g");
    
    const pie = d3.layout.pie().sort(null).value(function(d) { return 1; });
    
    const arc = d3.svg.arc().outerRadius(r);
    
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
            drawWheel(currentSegments);
        });
    });
    
    spinButton.addEventListener('click', spin);
    
    drawWheel(currentSegments);

    // MetaMask Integration
    async function initializeMetaMask() {
        if (window.ethereum === undefined) {
            alert('Please install MetaMask!');
        } else {
            try {
                const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
                const account = accounts[0];
                console.log('Connected account:', account);
                getBalance(account);
            } catch (error) {
                console.error('Error connecting to MetaMask:', error);
            }
        }
    }

    async function getBalance(account) {
        try {
            const balance = await ethereum.request({
                method: 'eth_getBalance',
                params: [account, 'latest']
            });
            const ethBalance = parseInt(balance, 16) / 1e18;
            console.log('Баланс:', ethBalance);
            balanceSpan.innerText = ethBalance.toFixed(4); // Display ETH balance
        } catch (error) {
            console.error('Error getting balance:', error);
        }
    }

    initializeMetaMask();
});
