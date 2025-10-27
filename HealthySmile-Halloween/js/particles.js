// js/particles.js
export class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-1, 1);
    this.vy = random(-2, -0.5);
    this.alpha = 255;
    this.size = random(6, 12);
    this.color = color(random(180, 255), random(100, 150), random(0, 100), this.alpha);
    this.shape = random(['circle', 'ghost']);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 3;
  }

  display(p) {
    p.push();
    p.noStroke();
    if (this.shape === 'circle') {
      p.fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.alpha);
      p.ellipse(this.x, this.y, this.size);
    } else {
      p.fill(255, 255, 255, this.alpha * 0.8);
      p.ellipse(this.x, this.y, this.size * 1.2, this.size);
      p.triangle(this.x - this.size / 2, this.y,
                 this.x, this.y + this.size / 1.5,
                 this.x + this.size / 2, this.y);
    }
    p.pop();
  }

  isDead() {
    return this.alpha <= 0;
  }
}
