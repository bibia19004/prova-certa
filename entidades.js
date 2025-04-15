class JogoObjetos {
    constructor(x, y, largura, altura, cor) {
      this.x = x;
      this.y = y;
      this.width = largura;
      this.height = altura;
      this.color = cor;
    }
  
    desenhar(ctx) {
      ctx.fillStyle = this.cor;
      ctx.beginPath();
      ctx.moveTo(this.x + this.largura / 2, this.y); 
      ctx.lineTo(this.x, this.y + this.altura);
      ctx.lineTo(this.x + this.largura, this.y + this.altura); 
      ctx.closePath();
      ctx.fill();
    }
  
    Colisão(obj) {
      return (
        this.x < obj.x + obj.width &&
        this.x + this.width > obj.x &&
        this.y < obj.y + obj.height &&
        this.y + this.height > obj.y
      );
    }
  }