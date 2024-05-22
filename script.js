document.addEventListener('DOMContentLoaded', function() {
    const wheelCanvas = document.getElementById('wheel');
    const ctx = wheelCanvas.getContext('2d');
    const spinButton = document.getElementById('spin');
    const resultDiv = document.getElementById('result');
    let currentSegments = 4;
    let currentRotation = 0;

    function drawWheel(segments) {
        const angleStep = 2 * Math.PI / segments;
        const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A5', '#FFFF33', '#33FFF6', '#FF8233', '#8D33FF'];

        ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);

        for (let i = 0; i < segments; i++) {
            ctx.beginPath();
            ctx.moveTo(wheelCanvas.width / 2, wheelCanvas.height / 2);
            ctx.arc(wheelCanvas.width / 2, wheelCanvas.height / 2, wheelCanvas.width / 2, i * angleStep, (i + 1) * angleStep);
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            ctx.stroke();
            ctx.closePath();

            ctx.save();
            ctx.translate(wheelCanvas.width / 2, wheelCanvas.height / 2);
            ctx.rotate((i + 0.5) * angleStep);
            ctx.textAlign = "right";
            ctx.fillStyle = "#000";
            ctx.font = "20px Arial";
            ctx.fillText(i + 1, wheelCanvas.width / 2 - 10, 10);
            ctx.restore();
        }
    }

    function spinWheel() {
        const spinAngle = Math.random() * 360 + 720; // Spin at least 2 full rounds
        const duration = 3000; // Spin for 3 seconds
        const start = performance.now();
        
        function animate(now) {
            const elapsed = now - start;
            const easeOutCubic = t => (--t) * t * t + 1;
            const progress = easeOutCubic(Math.min(elapsed / duration, 1));
            const angle = progress * spinAngle;
            currentRotation = (currentRotation + angle) % 360;

            ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
            ctx.save();
            ctx.translate(wheelCanvas.width / 2, wheelCanvas.height / 2);
            ctx.rotate(currentRotation * Math.PI / 180);
            ctx.translate(-wheelCanvas.width / 2, -wheelCanvas.height / 2);
            drawWheel(currentSegments);
            ctx.restore();

            if (elapsed < duration) {
                requestAnimationFrame(animate);
            } else {
                const finalAngle = (currentRotation % 360) * Math.PI / 180;
                const segmentAngle = 2 * Math.PI / currentSegments;
                const winningSegment = Math.floor((2 * Math.PI - finalAngle + segmentAngle / 2) / segmentAngle) % currentSegments + 1;
                resultDiv.innerText = `Winning Segment: ${winningSegment}`;
            }
        }

        requestAnimationFrame(animate);
    }

    document.querySelectorAll('input[name="wheel-options"]').forEach(radio => {
        radio.addEventListener('change', (event) => {
            currentSegments = parseInt(event.target.value);
            currentRotation = 0; // Reset the angle to 0 to point to the first segment
            drawWheel(currentSegments);
        });
    });

    spinButton.addEventListener('click', spinWheel);

    // Initial draw
    currentRotation = 0; // Ensure initial angle is set to 0
    drawWheel(currentSegments);
});
