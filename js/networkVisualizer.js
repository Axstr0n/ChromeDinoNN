
class NetworkVisualizer{
    constructor(){
        
    }
    // Draw network
    draw(canvas, ctx, player){
        let network = player.brain;
        // Clear canvas
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.save();

        // Calculate bounds, spaces, increments for positions
        const numOfLayers = network.levels.length+1;
        let height = canvas.height * 0.8;
        let yIncrement =  height / (numOfLayers-1);
        let yPositions = [];
        let ySpace= (canvas.height - height) / 2;
        for (let i = 0; i < numOfLayers; i++) {
            yPositions.push(height+ySpace - i * yIncrement);
        }
        let width = canvas.width * 0.9;
        let xSpace = (canvas.width - width) / 2;


        // Positions for all nodes
        let positions = [];
        let xIncrement = width / (network.levels[0].inputs.length);
        let layerPositions = [];
        // First input layer
        for (let i = 0; i < network.levels[0].inputs.length; i++) {
            layerPositions.push({
                x: xSpace + i * xIncrement + 0.5*xIncrement, y: yPositions[0]
            })
        }
        positions.push(layerPositions);
        // All output layers
        for (let i = 0; i < network.levels.length; i++) {
            let level = network.levels[i];
            layerPositions = [];
            xIncrement = width / (level.outputs.length);
            for (let j = 0; j < level.outputs.length; j++) {
                layerPositions.push({
                    x: xSpace + j * xIncrement + 0.5*xIncrement, y: yPositions[i+1]
                })
            }
            positions.push(layerPositions);
        }

        // Draw connections
        const weightColor = "white";
        for (let ii = 0; ii < positions.length-1; ii++) {
            for (let i = 0; i < positions[ii].length; i++) {
                for (let j = 0; j < positions[ii+1].length; j++) {
                    ctx.strokeStyle = weightColor;
                    ctx.beginPath();
                    // Map width based on weight value
                    ctx.lineWidth = mapValue(
                        player.brain.levels[ii].weights[i][j],
                        -1,
                        1,
                        0,
                        3
                    );
                    // Map alpha based on weight value
                    ctx.globalAlpha = mapValue(
                        player.brain.levels[ii].weights[i][j],
                        -1,
                        1,
                        0,
                        1
                    );
                    ctx.moveTo(positions[ii][i].x, positions[ii][i].y);
                    ctx.lineTo(positions[ii+1][j].x, positions[ii+1][j].y);
                    ctx.stroke();
                }
            }
        }
        // Reset ctx
        ctx.strokeStyle = "black";
        ctx.globalAlpha=1;


        // Draw nodes
        const activeColor = "rgb(32, 133, 216)";
        const inActiveColor = "black";
        // Draw input nodes
        for (let i = 0; i < positions[0].length; i++) {
            const x = positions[0][i].x;
            const y = positions[0][i].y;
            // Circle background
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.globalAlpha=0.3;
            ctx.arc(x, y, 20, 0, Math.PI*2, true);
            ctx.fillStyle = player.sensor.colors[i+1];
            ctx.fill();
            // Circle foreground
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.globalAlpha=1;
            ctx.arc(x, y, 20, 0, mapValue(player.inputs[i],0,1,0,Math.PI*2), true);
            ctx.fillStyle = player.sensor.colors[i+1];
            ctx.fill();
        }
        // Draw output nodes
        for (let i = 0; i < positions.length-1; i++) {
            for (let j = 0; j < positions[i+1].length; j++) {
                const x = positions[i+1][j].x;
                const y = positions[i+1][j].y;
                ctx.beginPath();
                ctx.arc(x, y, 20, 0, Math.PI * 2, true);
                if(network.levels[i].outputs[j] == 1){
                    ctx.fillStyle = activeColor;
                }
                else{
                    ctx.fillStyle = inActiveColor;
                }
                ctx.fill();
            }
        }

        // Draw arrows for outputs
        const arrowLength = 15;
        const lineWidth = 5;
        // Jump arrow
        let start = {
            x: positions[positions.length-1][0].x,
            y: positions[positions.length-1][0].y+arrowLength/2+lineWidth/2
        };
        let end = {
            x: positions[positions.length-1][0].x,
            y: positions[positions.length-1][0].y-arrowLength/2
        };
        drawArrow(ctx,start,end,arrowLength,"white",lineWidth);
        // Bend arrow
        start = {
            x: positions[positions.length-1][1].x,
            y: positions[positions.length-1][1].y-arrowLength/2-lineWidth/2
        };
        end = {
            x: positions[positions.length-1][1].x,
            y: positions[positions.length-1][1].y+arrowLength/2
        };
        drawArrow(ctx,start,end,arrowLength,"white",lineWidth);

        ctx.restore();
    }

}

function drawArrow(ctx, start, end, arrowLength, color, lineWidth){
    let arrowSize = arrowLength * 0.4;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    // Draw the line
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    // Draw the arrowhead
    ctx.beginPath();
    ctx.moveTo(end.x - arrowSize * Math.cos(angle - Math.PI / 6), end.y - arrowSize * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(end.x, end.y);
    ctx.lineTo(end.x - arrowSize * Math.cos(angle + Math.PI / 6), end.y - arrowSize * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

const networkCanvas = document.getElementById("network-canvas");
networkCanvas.height = 300;
networkCanvas.width = 600;
const networkCtx = networkCanvas.getContext("2d");

let networkVisualizer = new NetworkVisualizer();
