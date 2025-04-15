class GameObject {
    constructor(x, y, width, height, color) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.color = color;
    }
  
    draw(ctx) {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2, this.y); // Topo da nave
      ctx.lineTo(this.x, this.y + this.height); // Base esquerda
      ctx.lineTo(this.x + this.width, this.y + this.height); // Base direita
      ctx.closePath();
      ctx.fill();
    }
  
    collidesWith(obj) {
      return (
        this.x < obj.x + obj.width &&
        this.x + this.width > obj.x &&
        this.y < obj.y + obj.height &&
        this.y + this.height > obj.y
      );
    }
  }
  
  class Player extends GameObject {
    constructor(x, y) {
      super(x, y, 40, 40, 'lime');
    }
  
    move(keys, canvasWidth) {
      if (keys['ArrowLeft']) this.x -= 3;
      if (keys['ArrowRight']) this.x += 3;
      this.x = Math.max(0, Math.min(canvasWidth - this.width, this.x));
    }
  }
  
  class Bullet extends GameObject {
    constructor(x, y) {
      super(x, y, 5, 10, 'white');
      this.speed = 8;
    }
  
    update() {
      this.y -= this.speed;
    }
  }
  
  class Alien extends GameObject {
    constructor(x, y, speed) {
      super(x, y, 40, 40, 'red');
      this.speed = speed;
    }
  
    update() {
      this.y += this.speed;
    }
  }
  
  class Game {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.player = new Player(this.canvas.width / 2 - 20, this.canvas.height - 40);
      this.bullets = [];
      this.aliens = [];
      this.keys = {};
      this.lastShoot = 0;
      this.isGameOver = false;
      this.score = 0;
  
      this.lossSound = new Audio('sounds/derrota.mp3');
      this.shootSound = new Audio('sounds/tiro.mp3'); // Som de tiro
  
      this.difficultyTimer = 0;
      this.alienSpeed = 1;
      this.spawnInterval = 2000;
  
      this.spawnAliens();
      this.loop = this.loop.bind(this);
  
      this.restartButton = document.createElement("button");
      this.restartButton.innerText = "Recomeçar";
      this.restartButton.style.position = "absolute";
      this.restartButton.style.top = "50%";
      this.restartButton.style.left = "50%";
      this.restartButton.style.transform = "translate(-50%, -50%)";
      this.restartButton.style.fontSize = "20px";
      this.restartButton.style.padding = "10px 20px";
      this.restartButton.style.backgroundColor = "lime";
      this.restartButton.style.border = "none";
      this.restartButton.style.cursor = "pointer";
      this.restartButton.style.display = "none";
      document.body.appendChild(this.restartButton);
  
      this.restartButton.addEventListener("click", this.restart.bind(this));
  
      window.addEventListener('keydown', (e) => this.keys[e.key] = true);
      window.addEventListener('keyup', (e) => this.keys[e.key] = false);
  
      requestAnimationFrame(this.loop);
    }
  
    restart() {
      this.isGameOver = false;
      this.aliens = [];
      this.bullets = [];
      this.score = 0;
      this.player = new Player(this.canvas.width / 2 - 20, this.canvas.height - 40);
      this.spawnAliens();
      this.restartButton.style.display = "none";
      requestAnimationFrame(this.loop);
    }
  
    spawnAliens() {
      setInterval(() => {
        const x = Math.random() * (this.canvas.width - 40);
        this.aliens.push(new Alien(x, 0, this.alienSpeed));
      }, this.spawnInterval);
    }
  
    shoot() {
      const now = Date.now();
      if (now - this.lastShoot > 300) {
        const bulletX = this.player.x + this.player.width / 2 - 2.5;
        const bulletY = this.player.y;
        this.bullets.push(new Bullet(bulletX, bulletY));
        this.lastShoot = now;
        this.shootSound.play(); // Toca o som de tiro
      }
    }
  
    update() {
      if (this.isGameOver) return;
  
      this.player.move(this.keys, this.canvas.width);
      if (this.keys[' ']) this.shoot();
  
      this.bullets.forEach(b => b.update());
      this.aliens.forEach(a => a.update());
  
      this.difficultyTimer += 1;
      if (this.difficultyTimer % 6000 === 0) { // Demora mais pra aumentar
      this.alienSpeed += 0.2; // Sobe a velocidade mais devagar
      this.spawnInterval = Math.max(800, this.spawnInterval - 20); // Não reduz tão rápido
      this.spawnAliens();
  }
  
  
      this.bullets = this.bullets.filter(b => b.y + b.height > 0);
      this.aliens = this.aliens.filter(a => {
        const hitBottom = a.y + a.height >= this.canvas.height;
        const hitPlayer = a.collidesWith(this.player);
        if (hitBottom || hitPlayer) {
          this.lossSound.play();
          this.isGameOver = true;
          this.showGameOver();
        }
        return !hitBottom && !hitPlayer;
      });
  
      this.aliens = this.aliens.filter(alien => {
        const hit = this.bullets.some(bullet => bullet.collidesWith(alien));
        if (hit) {
          this.bullets = this.bullets.filter(b => !b.collidesWith(alien));
          this.score += 10; // Adiciona pontos ao destruir um alien
        }
        return !hit;
      });
    }
  
    showGameOver() {
      this.ctx.font = "40px Arial";
      this.ctx.fillStyle = "white";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText("GAME OVER", this.canvas.width / 2, this.canvas.height / 2 - 60);
      this.ctx.font = "24px Arial";
      this.ctx.fillText(`PONTUAÇÃO FINAL: ${this.score}`, this.canvas.width / 2, 10);
  
      this.restartButton.style.display = "block";
    }
  
    draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.player.draw(this.ctx);
      this.bullets.forEach(b => b.draw(this.ctx));
      this.aliens.forEach(a => a.draw(this.ctx));
  
      if (this.isGameOver) {
        this.showGameOver();
      } else {
        this.ctx.font = "20px Arial";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "top";
        this.ctx.fillText(`PONTUAÇÃO: ${this.score}`, this.canvas.width / 2, 10);
      }
    }
  
    loop() {
      this.update();
      this.draw();
      if (!this.isGameOver) {
        requestAnimationFrame(this.loop);
      }
    }
  }
  
  const game = new Game('gameCanvas');