document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');
  const G      = 3000;    // gravity‐constant (tweak)
  const damping = 0.98;  // near-1 keeps orbits alive
  const ballsCount = 300;
  const minDist = 150;    // inside this radius, we won’t make the force any stronger
  const orbitStrength = 0.05;  // tweak to dial how “snappy” the orbit is
  const positionJitter = 0.5;    // small random nudge to position each frame
  const forceJitter    = 0.1;    // randomize the strength of the pull/repel

  const mouse = { x: null, y: null };
  let repel = false;
  let W, H;

  // resize
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // track mouse
  window.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    console.log(mouse.x, mouse.y);
  });
  window.addEventListener('mousedown', () => { repel = true; });
  window.addEventListener('mouseup',   () => { repel = false; });

  class Ball {
    constructor() {
      this.radius = 10//5 + Math.random() * 12;
      this.x      = Math.random() * (W - 2*this.radius) + this.radius;
      this.y      = Math.random() * (H - 2*this.radius) + this.radius;
      this.vx     = (Math.random() - 0.5) * 4;
      this.vy     = (Math.random() - 0.5) * 4;
      this.color  = `rgba(255, 255, 255, 0.2)`;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }

    update() {
      // inverse‐square attraction
    //   if (mouse.x !== null) {
    //     const dx = mouse.x - this.x;
    //     const dy = mouse.y - this.y;
    //     //const distSq =  Math.sqrt(dx*dx + dy*dy);
    //     const distSq =  (dx*dx + dy*dy);
    //     const sign  = repel ? -1 : 1;
    //     const force = sign * G / (distSq || 1000);
    //     this.vx += dx * force;
    //     this.vy += dy * force;
    //   }

      if (mouse.x !== null) {
        const dx     = mouse.x - this.x;
        const dy     = mouse.y - this.y;
        const distSq = dx*dx + dy*dy;
        const dist   = Math.sqrt(distSq) || 1;
        // 1) clamp denominator so force can’t blow up
        const effectiveDistSq = Math.max(distSq, minDist*minDist);
        // 2) radial force (in or out)
        const sign  = repel ? -1 : 1;
        const Fmag  = sign * G / effectiveDistSq;
        const ax    = (dx / dist) * Fmag;
        const ay    = (dy / dist) * Fmag;

        // 3) tangential “orbit” kick
        const tx = -dy / dist;   // unit perpendicular vector
        const ty =  dx / dist;
        const tAccel = orbitStrength;

        this.vx += ax + tx * tAccel;
        this.vy += ay + ty * tAccel;
        this.vx += (Math.random() - 0.5) * forceJitter;
        this.vy += (Math.random() - 0.5) * forceJitter;

        //adjust transparency based on speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const maxSpeed = 5;
        const alpha = Math.min(speed / maxSpeed, 0.5);
        this.color  = `rgba(255, 255, 255, ${alpha})`;
    }

      // light damping
      this.vx *= damping;
      this.vy *= damping;

      // move
      this.x += this.vx;
      this.y += this.vy;

      // optional wall bounce
      if (this.x + this.radius > W) {
        this.x = W - this.radius;
        this.vx *= -1;
      }
      if (this.x - this.radius < 0) {
        this.x = this.radius;
        this.vx *= -1;
      }
      if (this.y + this.radius > H) {
        this.y = H - this.radius;
        this.vy *= -1;
      }
      if (this.y - this.radius < 0) {
        this.y = this.radius;
        this.vy *= -1;
      }
    }
  }

  // create balls
  const balls = Array.from({ length: ballsCount }, () => new Ball());

  // loop
  (function animate() {
    ctx.clearRect(0, 0, W, H);
    balls.forEach(b => { b.update(); b.draw(); });
    requestAnimationFrame(animate);
  })();
});