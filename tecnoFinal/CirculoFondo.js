class CirculoFondo {
  constructor(x, y, r, colores) {
      this.x = x;
      this.y = y;
      this.r = r;
      this.colores = colores;
      this.color = color(random(this.colores));
  }

  // Dibujar círculo de fondo
  dibujar() {
      fill(this.color);
      noStroke();
      ellipse(this.x, this.y, this.r * 2, this.r * 2);
  }
}