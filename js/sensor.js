class Sensor{
    constructor(player, length, yPositions){
        this.player = player;
        this.length = length;
        this.yPositions = yPositions;

        this.rays = [];

        this.readings = [];
        this.colors = distributeColors(8);
    }

    update(obstacles,ground){
        this.#castRays();
        this.readings = [];
        for (let i = 0; i < this.rays.length; i++) {
            this.readings.push(
                this.#getReadings(
                    this.rays[i],
                    obstacles,
                    ground
                )
            );
        }
    }

    #castRays(){
        this.rays = [];
        // Front forward
        for (let i = 0; i < this.yPositions.length; i++) {
            this.rays.push([
                {x:this.player.x-this.player.width/2, y:this.yPositions[i]},
                {x:this.player.x-this.player.width/2+this.length, y:this.yPositions[i]}
            ]);
        }
        // Back up
        this.rays.push([
            {x: this.player.x-this.player.width/2, y: this.player.y-this.player.height/2},
            {x: this.player.x-this.player.width/2, y: this.player.y-this.player.height/2-this.length}
        ]);
        // Back down
        this.rays.push([
            {x: this.player.x-this.player.width/2, y: this.player.y-this.player.height/2},
            {x: this.player.x-this.player.width/2, y: this.player.y-this.player.height/2+this.length}
        ]);
        // Front up
        this.rays.push([
            {x: this.player.x+this.player.width/2, y: this.player.y-this.player.height/2},
            {x: this.player.x+this.player.width/2, y: this.player.y-this.player.height/2-this.length}
        ]);
        // Front down
        this.rays.push([
            {x: this.player.x+this.player.width/2, y: this.player.y-this.player.height/2},
            {x: this.player.x+this.player.width/2, y: this.player.y-this.player.height/2+this.length}
        ]);
    }


    #getReadings(ray,obstacles,ground){
        let touches = [];
        // Intersection with obstacles
        for (let i = 0; i < obstacles.length; i++) {
            for (let j = 0; j < obstacles[i].collider.length; j++) {
                const touch = getIntersection(
                    ray[0],
                    ray[1],
                    obstacles[i].collider[j],
                    obstacles[i].collider[(j+1)%obstacles[i].collider.length]
                )
                if(touch){
                    touches.push(touch);
                }
            }
        }
        // Intersection with ground
        for (let i = 0; i < ground.collider.length; i++) {
            const touch = getIntersection(
                ray[0],
                ray[1],
                ground.collider[i],
                ground.collider[(i+1)%ground.collider.length]
            )
            if(touch){
                touches.push(touch);
            }
        }
        if(touches.length == 0){
            return null;
        }
        else{
            // Get closest touch and return it
            const offsets = touches.map(e=>e.offset);
            const minOffset = Math.min(...offsets);
            return touches.find(e=>e.offset==minOffset);
        }
    }

    draw(ctx){
        // Draw rays (lines)
        for (let i = 0; i < this.rays.length; i++) {
            ctx.beginPath();
            ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y);
            ctx.lineTo(this.rays[i][1].x, this.rays[i][1].y);
            ctx.strokeStyle = this.colors[i+1];
            ctx.stroke();
            ctx.strokeStyle = 'black';
        }
        // Draw readings (dots)
        for (let i = 0; i < this.readings.length; i++) {
            if(this.readings[i] == null) continue;
            ctx.beginPath();
            ctx.arc(this.readings[i].x, this.readings[i].y, 4, 0, Math.PI * 2, true);
            ctx.fillStyle = 'orange';
            ctx.fill();
        }
    }
}