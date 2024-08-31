class AirObstacle{
    constructor(x, y, width, height, speed){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = speed;

        this.collider = [];
        this.#createColliders();

        this.image = new Image();
        let rand = Math.random();
        this.imageNum = Math.ceil(lerp(0,4,rand));
        this.image.src = `images/pterodactyl/pterodactyl${this.imageNum}.png`;
        this.i = 0;
    }

    #createColliders(){
        // Create points for collider edges
        this.collider = [
            {x:this.x-this.width/2, y:this.y},
            {x:this.x+this.width/2, y:this.y},
            {x:this.x+this.width/2, y:this.y-this.height},
            {x:this.x-this.width/2, y:this.y-this.height},
        ];
    }

    animate(){
        this.x -= this.speed; // Move
        this.#createColliders();
    }

    draw(ctx, drawCollider, drawGraphics){
        if(drawCollider){
            ctx.strokeStyle = 'red';
            ctx.beginPath();
            ctx.moveTo(this.collider[0].x, this.collider[0].y);
            ctx.lineTo(this.collider[1].x, this.collider[1].y);
            ctx.lineTo(this.collider[2].x, this.collider[2].y);
            ctx.lineTo(this.collider[3].x, this.collider[3].y);
            ctx.lineTo(this.collider[0].x, this.collider[0].y);
            ctx.stroke();
            ctx.strokeStyle = 'black';
        }
        if(drawGraphics){
            // For animation
            this.i++;
            if(this.i > 30){
                this.i = 0;
                this.imageNum++;
                if(this.imageNum > 4){
                    this.imageNum = 1;
                }
            }
            this.image.src = `images/pterodactyl/pterodactyl${this.imageNum}.png`;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(this.image, this.x-this.width/2, this.y-this.height, this.width, this.height);
        }
    }
}