class GroundObstacle{
    constructor(x, y, width, height){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        // Rand image
        this.image = new Image();
        let rand = Math.random();
        this.image.src = `images/cactus/cactus${Math.ceil(lerp(0,4,rand))}.png`;

        this.collider = [];
        this.#createColliders();
    }

    #createColliders(){
        // Make collider based on dimensions and positions
        this.collider = [
            {x:this.x-this.width/2, y:this.y},
            {x:this.x+this.width/2, y:this.y},
            {x:this.x+this.width/2, y:this.y-this.height},
            {x:this.x-this.width/2, y:this.y-this.height},
        ];
    }

    draw(ctx, drawCollider, drawGraphics){
        // Draw
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
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(this.image, this.x-this.width/2, this.y-this.height, this.width, this.height);
        }
    }
}