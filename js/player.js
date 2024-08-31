class Player{
    constructor(x,y,height,groundY,controlType){
        this.x = x;
        this.y = y;
        // Dimensions
        this.normalWidth = height;
        this.normalHeight = height;
        this.bendWidth = height*1.4;
        this.bendHeight = height/1.4;
        this.width = height;
        this.height = height;
        // Velocity
        this.gravity = 0.1;
        this.maxYVelocity = 2;
        this.jumpVelocity = 5;
        this.velocity = {x:0, y:0};
        this.speed = 1;
        // Bools
        this.isGrounded = false;
        this.isJumping = true;
        this.isBending = false;
        this.died = false;
        this.prevJumpControl = false;
        // Collider
        this.collider = [];
        this.#createCollider();
        // AI / sensor / controls
        this.inputs = [];
        this.useBrain = controlType=="AI";
        this.controls = new Controls();
        this.sensor = new Sensor(this,500, [groundY-25,groundY-40]);
        if(this.sensor){
            this.brain = new NeuralNetwork([7,10,2]);
        }
        // For animation
        this.i = 0;
        this.imageNum = 1;
        this.image = new Image();
        this.imageSrc = 'images/dino/dino.png';
    }

    #createCollider(){
        // Collider for bending
        if(this.isBending && !this.isJumping){
            this.collider = [
                {x:this.x-this.bendWidth/2, y:this.y},
                {x:this.x+this.bendWidth/2, y:this.y},
                {x:this.x+this.bendWidth/2, y:this.y-this.bendHeight},
                {x:this.x-this.bendWidth/2, y:this.y-this.bendHeight}
            ];
            this.width = this.bendWidth;
            this.height = this.bendHeight;
        }
        // Collider for standing / jumping
        else{
            this.collider = [
                {x:this.x-this.normalWidth/2, y:this.y},
                {x:this.x+this.normalWidth/2, y:this.y},
                {x:this.x+this.normalWidth/2, y:this.y-this.normalHeight},
                {x:this.x-this.normalWidth/2, y:this.y-this.normalHeight}
            ];
            this.width = this.normalWidth;
            this.height = this.normalHeight;
        }
    }


    update(ground, obstacles){
        if(this.died) return;
        
        // Update isGrounded
        if(polysIntersect(this.collider, ground.collider)){
            this.isGrounded = true;
        }
        else{
            this.isGrounded = false;
        }
        // Check collisions
        obstacles.forEach(obstacle => {
            if(polysIntersect(this.collider, obstacle.collider)){
                this.died = true;
            }

        });
        // If AI add speed
        if(this.useBrain){
            this.velocity.x = this.speed;
        }
        // For testing ///
        else{
            if(this.controls.forward && !this.controls.backward){
                this.velocity.x = 1;
            }
            else if(this.controls.backward && !this.controls.forward){
                this.velocity.x = -1;
            }
            else{
                this.velocity.x = 0;
            }
        }
        ///////////////////
        // Jump
        if(this.controls.jump && this.isGrounded && !this.isBending && !this.prevJumpControl){
            this.velocity.y = -this.jumpVelocity;
            this.isJumping = true;
            this.prevJumpControl = true;
        }
        else{
            this.velocity.y += this.gravity;
            if(this.velocity.y > this.maxYVelocity){
                this.velocity.y = this.maxYVelocity;
            }
            if(this.isGrounded){
                this.velocity.y = 0;
                this.y = ground.y;
                this.isJumping = false;
            }
        }
        if(!this.controls.jump){
            this.prevJumpControl = false;
        }
        // Bend
        if(this.controls.bend && !this.isGrounded && this.controls.bend){
            this.velocity.y += 2;
        }
        if(this.controls.bend && this.isGrounded){
            this.isBending = true;
        }
        else if(!this.controls.bend){
            this.isBending = false;
        }
        // Update position based on velocity
        this.x += this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.#createCollider();
        // If sensor -> update sensor, neural network
        if(this.sensor){
            this.sensor.update(obstacles,ground);
            let offsets = this.sensor.readings.map(
                s=>s==null?0:1-s.offset
            );
            offsets = offsets.map(
                s=>s<0 ? 0 : s
            );
            this.inputs = offsets;
            this.inputs.push(this.speed);
            //const outputs = this.brain.feedForward(offsets);
            const outputs = NeuralNetworkManager.feedForward(this.brain, this.inputs)
            if(this.useBrain){
                this.controls.jump = outputs[0];
                this.controls.bend = outputs[1];
            }
        }
    }

    draw(ctx, drawCollider, drawGraphics, drawSensor=false){
        if(drawCollider){
            this.drawCollider(ctx);
        }
        if(drawGraphics){
            this.drawPlayer(ctx);
        }
        if(this.sensor && drawSensor){
            this.sensor.draw(ctx);
        }
    }

    drawPlayer(ctx){
        if(!this.isJumping){
            // For animation
            this.i++;
            if(this.i > 50){
                this.i = 0;
                this.imageNum++;
                if(this.imageNum > 2){
                    this.imageNum = 1;
                }
            }
        }
        // Change dimensions and image based on state
        let width = this.width;
        let height = this.height;
        if(this.isBending && !this.isJumping){
            this.image.src = `images/dino/dino_bend_${this.imageNum}.png`;
            width = this.bendWidth;
            height = this.bendHeight;
        }
        if(!this.isBending && this.isGrounded){
            this.image.src = `images/dino/dino_run_${this.imageNum}.png`;
            width = this.normalWidth;
            height = this.normalHeight;
        }
        if(this.isJumping){
            this.image.src = `images/dino/dino.png`;
            width = this.normalWidth;
            height = this.normalHeight;
        }
        // Draw image
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.image, this.x-width/2, this.y-height, width, height);
    }

    drawCollider(ctx){
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
}