const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 300;


let drawColliders = false;
let drawGraphics = true;
let drawSensors = false;


//#region CONFIGURE BUTTONS / SLIDER
const buttonToggleColliders = document.getElementById("toggle-colliders");
buttonToggleColliders.addEventListener("click", () => {
    buttonToggleColliders.classList.toggle("active");
    if(buttonToggleColliders.classList.contains("active")){
        drawColliders = true;
    } else{
        drawColliders = false;
    }
});
const buttonToggleGraphics = document.getElementById("toggle-graphics");
buttonToggleGraphics.addEventListener("click", () => {
    buttonToggleGraphics.classList.toggle("active");
    if(buttonToggleGraphics.classList.contains("active")){
        drawGraphics = true;
    } else{
        drawGraphics = false;
    }
});
const buttonToggleSensors = document.getElementById("toggle-sensors");
buttonToggleSensors.addEventListener("click", () => {
    buttonToggleSensors.classList.toggle("active");
    if(buttonToggleSensors.classList.contains("active")){
        drawSensors = true;
    } else{
        drawSensors = false;
    }
});
const sliderValue = document.getElementById("sliderValue");
const sliderDinos = document.getElementById("dinosSlider");
sliderDinos.addEventListener("input", () => {
    // Get the current value of the slider
    const value = sliderDinos.value;
    // Update the content of the div with the slider value
    sliderValue.innerHTML = sliderDinos.value;
});
const buttonToggleNetworkGeneration = document.getElementById("toggle-network-generation");
buttonToggleNetworkGeneration.addEventListener("click", () => {
    buttonToggleNetworkGeneration.classList.toggle("active");
    document.getElementById("network-canvas-container").classList.toggle("hide");
    document.getElementById("generation-canvas-container").classList.toggle("hide");
    if(buttonToggleNetworkGeneration.classList.contains("active")){
        buttonToggleNetworkGeneration.innerHTML = "Generation Chart";
    }
    else{
        buttonToggleNetworkGeneration.innerHTML = "Network Visulizer";
    }
});
//#endregion

// Variables
let generation = 0;
let highscore = 0;
let N;
let players = [];
let bestPlayer;
let bestBrain;

let ground;

// Obstacle parameters
let obstacles = [];
const groundObstacleDim = {width:{min:20, max:30}, height:{min:30, max:40}};
const airObstacleDim = {width:{min:40, max:60}, height:{min:25, max:30}};
const airObstacleSpeeds = {min:1 , max:2};
var nextSpawnX;
let spawnDistance = {min:200, max:350};


init();

// FPS
setInterval(function() {
    animate()
}, 1/60);

// Erase local storage
function eraseLocalStorage(){
    localStorage.removeItem("ChromeDino_highscore");
    localStorage.removeItem("ChromeDino_bestBrain");
    localStorage.removeItem("ChromeDino_generation");
    localStorage.removeItem("ChromeDino_generationBrains");
    init();
}
// Save local storage
function saveToLocalStorage(){
    localStorage.setItem("ChromeDino_bestBrain", JSON.stringify(bestPlayer.brain));
}

function animate(){
    // Increment obstacle distance and spawn/despawn
    spawnDistance.min += 0.005;
    spawnDistance.max += 0.005;
    spawnDespawnObstacles(0.6);
    
    // Remove dead players and display
    for (let i = 0; i < players.length; i++) {
        if(players[i].died){
            players.splice(i,1);
            i--;
        }
    }
    document.getElementById("players").innerHTML = `Dinos: ${players.length} / ${N}`;

    // Increment player speed and update
    let speed;
    for (let i = 0; i < players.length; i++) {
        if(players[i].died) continue;
        players[i].speed += 0.0001;
        speed = players[i].speed;
        players[i].update(ground, obstacles);
    }

    // Find best player
    bestPlayer = players.find(
        p=>p.x==Math.max(
            ...players.map(p=>p.x)
        )
    );
    
    // If everyone dies
    if(allPlayersDied()){
        // If no highscore -> set highscore
        if(!localStorage.getItem("ChromeDino_highscore")){
            localStorage.setItem("ChromeDino_highscore",
                JSON.stringify(bestPlayer.x));
        }
        // If highscore less than best player score -> set highscore, bestBrain
        if(JSON.parse(localStorage.getItem("ChromeDino_highscore")) < bestPlayer.x){
            bestBrain = bestPlayer.brain;
            highscore = bestPlayer.x;
            localStorage.setItem("ChromeDino_bestBrain",
                JSON.stringify(bestPlayer.brain));
            localStorage.setItem("ChromeDino_highscore",
                JSON.stringify(Math.round(bestPlayer.x)));
            // Display highscore
            document.getElementById("highscore").innerHTML =
            `Highscore: ${JSON.parse(localStorage.getItem("ChromeDino_highscore"))}`;
        }
        // If no [{generations,brains}] -> set current [{generation,brain}]
        if(!localStorage.getItem("ChromeDino_generationBrains")){
            let genBrains = [];
            genBrains.push({
                generation: JSON.parse(localStorage.getItem("ChromeDino_generation")),
                brain: bestPlayer.brain
            });
            localStorage.setItem("ChromeDino_generationBrains",
                JSON.stringify(genBrains));
        }
        // Else -> append current [{generation,brain}]
        else{
            let genBrains = JSON.parse(localStorage.getItem("ChromeDino_generationBrains"));
            genBrains.push({
                generation: JSON.parse(localStorage.getItem("ChromeDino_generation")),
                brain: bestPlayer.brain
            });
            localStorage.setItem("ChromeDino_generationBrains",
                JSON.stringify(genBrains));
        }
        // Draw chart and reset
        genChart.draw(generationCanvas.getContext("2d"));
        init();
    }


    // Draw
    
    ctx.clearRect(0,0,canvas.width,canvas.height); // Clear
    ctx.save();
    ctx.translate(-bestPlayer.x + canvas.width*0.2, 0); // Follow best player

    // Write score
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    const text = `Score: ${Math.round(bestPlayer.x)}`;
    const x = bestPlayer.x + canvas.width*0.2;
    const y = 30;
    ctx.fillText(text, x, y);

    // Draw ground
    ground.draw(ctx, drawColliders, drawGraphics);
    // Draw players
    ctx.globalAlpha=0.2;
    for (let i = 0; i < players.length; i++) {
        players[i].draw(ctx, drawColliders,drawGraphics);
    }
    // Draw best player
    ctx.globalAlpha=1;
    bestPlayer.draw(ctx, drawColliders, drawGraphics, drawSensors);
    // Draw obstacles
    obstacles.forEach(obstacle => {
        obstacle.draw(ctx, drawColliders, drawGraphics);
    });

    ctx.restore();

    // Draw network
    networkVisualizer.draw(networkCanvas, networkCtx, bestPlayer);
}

function spawnDespawnObstacles(percentOfGround){
    const distanceToDespawn = 200;
    const distanceToSpawn = 700;
    // Despawn
    for (let i = 0; i < obstacles.length; i++) {
        if(bestPlayer.x-obstacles[i].x > distanceToDespawn){
            obstacles.splice(i, 1);
            i--;
        }
    }
    // Spawn
    const rand = Math.random();
    if(rand >= 1-percentOfGround){ // Ground obstacle
        if(nextSpawnX-bestPlayer.x < distanceToSpawn){
            // Random width/height from interval
            let width = lerp(
                groundObstacleDim.width.min,
                groundObstacleDim.width.max,
                Math.random()
            );
            let height = lerp(
                groundObstacleDim.height.min,
                groundObstacleDim.height.max,
                Math.random()
            );
            obstacles.push(new GroundObstacle(nextSpawnX,ground.y,width,height));
            // Increment next spawn location
            nextSpawnX += lerp(spawnDistance.min,spawnDistance.max,Math.random());
        }
    }
    else{ // Air obstacle
        if(nextSpawnX-bestPlayer.x < distanceToSpawn){
            // Random width/height from interval
            let width = lerp(
                airObstacleDim.width.min,
                airObstacleDim.width.max,
                Math.random()
            );
            let height = lerp(
                airObstacleDim.height.min,
                airObstacleDim.height.max,
                Math.random()
            );
            let speed = lerp(
                airObstacleSpeeds.min,
                airObstacleSpeeds.max,
                Math.random()
            )
            obstacles.push(new AirObstacle(nextSpawnX,ground.y-35,width,height,speed));
            // Increment next spawn location
            nextSpawnX += lerp(spawnDistance.min,spawnDistance.max,Math.random());
        }
    }
}



function init(){
    N = sliderDinos.value; // Number of dinos from slider

    // Set generation if not already
    if(!localStorage.getItem("ChromeDino_generation")){
        let gen = 1;
        localStorage.setItem(
            "ChromeDino_generation",
            JSON.stringify(gen)
        );
    }
    else{
        let gen = JSON.parse(localStorage.getItem("ChromeDino_generation")) + 1;
        localStorage.setItem(
            "ChromeDino_generation",
            JSON.stringify(gen)
        );
    }
    let gen = JSON.parse(localStorage.getItem("ChromeDino_generation"));
    document.getElementById("generation").innerHTML =
    `Generation: ${gen}`;

    // Set highscore if not already
    if(!localStorage.getItem("ChromeDino_highscore")){
        let high = 0;
        localStorage.setItem(
            "ChromeDino_highscore",
            JSON.stringify(high)
        );
    }
    // Display highscore
    document.getElementById("highscore").innerHTML =
        `Highscore: ${JSON.parse(localStorage.getItem("ChromeDino_highscore"))}`;

    // Display number of players
    document.getElementById("players").innerHTML = `Players: ${N} / ${N}`;
    // Init
    ground = new Ground(250);
    players = [];
    for (let i = 0; i < N; i++) {
        players.push(new Player(50,50,40,ground.y, "AI"));
        //players.push(new Player(50,50,40)); // manual
    }
    bestPlayer = players[0];
    obstacles = [];
    nextSpawnX = 400;
    spawnDistance = {min:200, max:350};
    
    // If best brain exist
    if(localStorage.getItem("ChromeDino_bestBrain")){
        for (let i = 0; i < players.length; i++) {
            // Set best brain to all players
            players[i].brain = JSON.parse(localStorage.getItem("ChromeDino_bestBrain"));
            if(i == 0){ // Don't mutate to first player
                continue;
            }
            // Mutate brain (Gauss)
            const limit = 2;
            const mappedValue = mapValue(
                i - players.length/2,
                -players.length/2,
                players.length/2,
                -limit,
                limit);
            let mutateAmount = gauss(mappedValue);
            NeuralNetworkManager.mutate(players[i].brain, 1-mutateAmount);
        }
    }
}

function allPlayersDied(){
    let died = getDeadPlayers();
    if(died == players.length) return true;
    return false;
}

function getDeadPlayers(){
    let died = 0;
    for (let i = 0; i < players.length; i++) {
        if(players[i].died){
            died++;
        }
    }
    return died;
}