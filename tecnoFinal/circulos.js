class Circulo {
    constructor(paleta) {
        this.x = random(width);
        this.y = random(height);
        this.tamanoreal = 0;
        this.tieneCirculoInterior = random() < 0.5;

        //Tamaño de los circulos
        const sizeOptions = [10, 15, 25];
        this.sizeCategory = random(sizeOptions);
        this.r = this.sizeCategory * 5; 
        this.growthRate = this.sizeCategory; 

        this.growthRate = map(this.sizeCategory, 1, 8, 0.1, 0.2);

        //Color de la paleta
        this.rColor = color(random(paleta.circulos));
        this.innerRColor = color(random(paleta.circulos));
    }

    //Dibuja el circulo
    dibujar() {
        noStroke();
        fill(this.rColor);
        ellipse(this.x, this.y, this.r * 2 * this.tamanoreal, this.r * 2 * this.tamanoreal);
        if (this.tieneCirculoInterior) {
            fill(this.innerRColor);
            ellipse(this.x, this.y, this.r * this.tamanoreal, this.r * this.tamanoreal);
        }
    }

    crecer() {
        this.tamanoreal += 0.01 * this.growthRate;
        this.tamanoreal = constrain(this.tamanoreal, 0, 1);
        for (let otro of circulos) {
            if (otro !== this && this.seVaAChocarCon(otro)) {
                this.tamanoreal -= 0.01 * this.growthRate;
                break;
            }
        }
    }

    decrecer() {
        this.tamanoreal -= 0.01 * this.growthRate;
        this.tamanoreal = constrain(this.tamanoreal, 0, 1);
    }

    detenerCrecimiento() {
        this.tamanorealDetenido = this.tamanoreal;
    }

    seVaAChocarCon(otro) {
        const minDist = 5; //ajusta el espacio entre cada uno de los circulos
        return dist(this.x, this.y, otro.x, otro.y) < (this.r * this.tamanoreal + otro.r * otro.tamanoreal + minDist);
    }

    seEstaChocandoConOtros(otrosCirculos) {
        
        for (let otro of otrosCirculos) {
            if (otro !== this && this.seVaAChocarCon(otro)) {
                return true;
            }
        }
        return false;
    }

    actualizar() {
        
    }

    fueraDePantalla() {
        return (this.x + this.r * this.tamanoreal < 0 || this.x - this.r * this.tamanoreal > width || this.y + this.r * this.tamanoreal < 0 || this.y - this.r * this.tamanoreal > height);
    }
}
