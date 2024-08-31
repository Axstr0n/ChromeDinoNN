class Ground{
    constructor(y){
        this.y = y;
        this.infinity = 1000000;

        this.collider = [];
        this.#createCollider();
    }

    #createCollider(){
        // Make collider based on dimensions and positions
        this.collider.push({x:-this.infinity, y:this.y});
        this.collider.push({x:this.infinity, y:this.y});
    }

    animate(){

    }

    draw(ctx, drawCollider, drawGraphics){
        // Draw
        if(drawCollider){
            ctx.strokeStyle = 'red';
            ctx.beginPath();
            ctx.moveTo(this.collider[0].x, this.collider[0].y);
            ctx.lineTo(this.collider[1].x, this.collider[1].y);
            ctx.stroke();
            ctx.strokeStyle = 'black';
        }

        if(drawGraphics){
            ctx.strokeStyle = 'white';
            ctx.beginPath();
            ctx.moveTo(this.collider[0].x, this.collider[0].y-10);
            ctx.lineTo(this.collider[1].x, this.collider[1].y-10);
            ctx.stroke();
            ctx.strokeStyle = 'black';
        }
    }
}