document.addEventListener('DOMContentLoaded', () => {
    const envelopeContainer = document.getElementById('envelope-container');
    const envelope = document.getElementById('envelope');
    const envelopeFlap = document.getElementById('envelope-flap');
    const envelopeText = document.getElementById('envelope-text');
    const greetingContainer = document.getElementById('greeting-container');
    const sunburstBg = document.getElementById('sunburst-bg');
    const mainBody = document.getElementById('main-body');
    const rabanAudio = document.getElementById('raban-audio');

    // Wait a short time before showing the envelope, letting the fireworks capture attention first
    setTimeout(() => {
        envelopeContainer.classList.remove('hidden');
        envelopeContainer.classList.add('animate-fade-in');
    }, 2000);

    let isOpened = false;

    // Click envelope
    envelope.addEventListener('click', () => {
        if (isOpened) return;
        isOpened = true;

        // Try to play audio - needs user interaction which this click provides
        rabanAudio.volume = 0.5;
        rabanAudio.play().catch(e => {
            console.log('Audio file not provided or blocked.', e);
        });

        // Start opening sequence
        envelope.classList.remove('animate-float');
        envelope.classList.remove('hover:scale-105');
        envelope.classList.remove('group');

        // Hide text and open flap
        envelopeText.style.opacity = '0';
        envelopeFlap.classList.add('open-flap');

        // After flap opens, shrink and fade envelope
        setTimeout(() => {
            envelope.classList.add('animate-envelope-open');

            // After envelope shrinks away
            setTimeout(() => {
                envelopeContainer.classList.add('hidden');

                // Change background to festive sunny gradient
                mainBody.classList.remove('bg-gray-900', 'bg-[#210000]');
                mainBody.className = "h-screen w-screen overflow-hidden transition-colors duration-[2000ms] relative sunny-aurora";

                // Show greeting and sunburst background
                sunburstBg.classList.remove('hidden');
                setTimeout(() => sunburstBg.classList.remove('opacity-0'), 50); // slight delay for transition
                greetingContainer.classList.remove('hidden');

                // Fire celebration fireworks
                launchFireworks(25000);
            }, 1000); // Wait for envelope-open animation

        }, 600); // Wait for flap to open
    });

    // Reusable Custom Canvas Fireworks Effect (High Quality / Kolatiyata)
    function launchFireworks(duration) {
        const fv = document.createElement('canvas');
        fv.className = 'fireworks-layer';
        fv.style.position = 'absolute';
        fv.style.top = '0';
        fv.style.left = '0';
        fv.style.width = '100%';
        fv.style.height = '100%';
        fv.style.pointerEvents = 'none';
        fv.style.zIndex = '20';

        document.getElementById('main-body').appendChild(fv);

        const ctx = fv.getContext('2d');
        let cw = window.innerWidth;
        let ch = window.innerHeight;

        // High DPI Display Support for extreme sharpness
        const dpr = window.devicePixelRatio || 1;
        fv.width = cw * dpr;
        fv.height = ch * dpr;
        ctx.scale(dpr, dpr);

        window.addEventListener('resize', () => {
            cw = window.innerWidth;
            ch = window.innerHeight;
            fv.width = cw * dpr;
            fv.height = ch * dpr;
            ctx.scale(dpr, dpr);
        });

        const fireworks = [];
        const particles = [];

        // Base HUE values: 45=Gold, 15=Orange, 0=Red, 180=Cyan, 320=Pink, 120=Green
        const hues = [45, 15, 0, 180, 320, 120, 50, 10];

        function random(min, max) { return Math.random() * (max - min) + min; }

        class Particle {
            constructor(x, y, baseHue) {
                this.x = x;
                this.y = y;
                this.coordinates = [];
                this.coordinateCount = 8;
                while (this.coordinateCount--) {
                    this.coordinates.push([this.x, this.y]);
                }

                // Modern, spherical burst physics (biasing towards the outer edge for rings)
                let angle = random(0, Math.PI * 2);
                let speed = random(1, 12);
                if (Math.random() > 0.4) speed = random(8, 12); // Outer ring clustering

                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
                this.friction = 0.92; // high friction looks like real fireworks stopping
                this.gravity = 0.8;

                // Rich hue shifts
                this.hue = random(baseHue - 30, baseHue + 30);
                this.brightness = random(50, 80);
                this.alpha = 1;
                this.decay = random(0.008, 0.02);
                this.width = random(1, 2.5);
                this.hasTwinkle = Math.random() > 0.5;
            }
            update(index) {
                this.coordinates.pop();
                this.coordinates.unshift([this.x, this.y]);
                this.vx *= this.friction;
                this.vy *= this.friction;
                this.vy += this.gravity;
                this.x += this.vx;
                this.y += this.vy;
                this.alpha -= this.decay;

                // Twinkle effect
                if (this.hasTwinkle) {
                    this.brightness = random(60, 100);
                }

                if (this.alpha <= this.decay) {
                    particles.splice(index, 1);
                }
            }
            draw() {
                // Modern fade-out tail
                ctx.beginPath();
                ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
                ctx.lineTo(this.x, this.y);
                ctx.strokeStyle = `hsla(${Math.floor(this.hue)}, 100%, ${Math.floor(this.brightness)}%, ${this.alpha * 0.5})`;
                ctx.lineWidth = this.width;
                ctx.lineCap = 'round';
                ctx.stroke();

                // Rich, glowing core (Piripun look)
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.width * 0.8, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${Math.floor(this.hue)}, 100%, 90%, ${this.alpha})`;
                ctx.fill();
            }
        }

        class Firework {
            constructor(sx, sy, tx, ty) {
                this.x = sx;
                this.y = sy;
                this.sx = sx;
                this.sy = sy;
                this.tx = tx;
                this.ty = ty;
                this.distanceToTarget = Math.sqrt(Math.pow(tx - sx, 2) + Math.pow(ty - sy, 2));
                this.distanceTraveled = 0;
                this.coordinates = [];
                this.coordinateCount = 4;
                while (this.coordinateCount--) {
                    this.coordinates.push([this.x, this.y]);
                }
                this.angle = Math.atan2(ty - sy, tx - sx);
                this.speed = 4;
                this.acceleration = 1.05;
                this.baseHue = hues[Math.floor(Math.random() * hues.length)];
                this.brightness = random(50, 70);
            }
            update(index) {
                this.coordinates.pop();
                this.coordinates.unshift([this.x, this.y]);
                this.speed *= this.acceleration;
                let vx = Math.cos(this.angle) * this.speed;
                let vy = Math.sin(this.angle) * this.speed;
                this.distanceTraveled = Math.sqrt(Math.pow(this.x - this.sx, 2) + Math.pow(this.y - this.sy, 2));

                if (this.distanceTraveled >= this.distanceToTarget) {
                    let count = Math.floor(random(60, 100)); // Optimal for visual flair
                    while (count--) {
                        particles.push(new Particle(this.tx, this.ty, this.baseHue));
                    }
                    fireworks.splice(index, 1);
                } else {
                    this.x += vx;
                    this.y += vy;
                }
            }
            draw() {
                ctx.beginPath();
                ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
                ctx.lineTo(this.x, this.y);
                ctx.strokeStyle = `hsla(${this.baseHue}, 100%, ${this.brightness}%, 1)`;
                ctx.lineWidth = 3.5;
                ctx.lineCap = 'round';
                ctx.stroke();
            }
        }

        let fwTimer = 0;
        let fwLimit = 15;

        function loop() {
            requestAnimationFrame(loop);
            ctx.clearRect(0, 0, cw, ch);
            ctx.globalCompositeOperation = 'lighter';

            let i = fireworks.length;
            while (i--) { fireworks[i].draw(); fireworks[i].update(i); }

            let j = particles.length;
            while (j--) { particles[j].draw(); particles[j].update(j); }

            if (fwTimer >= fwLimit) {
                let fwCount = Math.floor(random(1, 3));
                while (fwCount--) {
                    let sx = random(cw * 0.15, cw * 0.85);
                    let sy = ch;
                    let tx = sx + random(-250, 250);
                    let ty = random(ch * 0.1, ch * 0.45);
                    fireworks.push(new Firework(sx, sy, tx, ty));
                }
                fwTimer = 0;
                fwLimit = random(20, 50); // Natural randomized timings
            } else {
                fwTimer++;
            }
        }

        loop();

        // Let it run for the specified duration, then fade out
        setTimeout(() => {
            fwLimit = 10000;
            setTimeout(() => {
                fv.style.transition = 'opacity 2s ease-in-out';
                fv.style.opacity = '0';
                setTimeout(() => fv.remove(), 2000);
            }, 6000);
        }, duration);
    }

    // Launch initial fireworks immediately on page load
    launchFireworks(10000); // 10 seconds of initial fireworks
});
