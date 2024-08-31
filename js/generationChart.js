class GenerationChart{

    // Draw generation chart
    draw(ctx){
        // Get data from local storage
        let generationsBrains = JSON.parse(localStorage.getItem("ChromeDino_generationBrains"));
        
        // Get all generations
        let genLabels = [];
        for (let i = 0; i < generationsBrains.length; i++) {
            let genBrain = generationsBrains[i]; // {gen: x, brain: {x}}
            genLabels.push(genBrain.generation);
        }
        // Get number of weights and weights 1D array
        let weightsCounter = 0;
        let weights1D = [];
        for (let i = 0; i < generationsBrains.length; i++) {
            for (let j = 0; j < generationsBrains[i].brain.levels.length; j++) {
                let level = generationsBrains[i].brain.levels[j];
                let weights = level.weights;
                for (let k = 0; k < weights.length; k++) {
                    for (let m = 0; m < weights[k].length; m++) {
                        if(i == 0){ // Increment weight number until next generation
                            weightsCounter++;
                        }
                        weights1D.push(weights[k][m]);
                    }
                }
            }
        }
        // Generate weights 2D array
        const weights2D = [];
        for (let i = 0; i < weightsCounter; i++) {
            let dataset = [];
            for (let j = 0; j < genLabels.length; j++) {
                let index = i+(j*weightsCounter)
                dataset.push(weights1D[index]);
            }
            weights2D.push(dataset);
        }
        // Create datasets for all lines (weights)
        const colors = distributeColors(weights2D.length);
        const borderColors = colors;
        let datasets = [];
        for (let i = 0; i < weights2D.length; i++) {
            let borderWidth = 1;
            datasets.push({
                label: `Weight ${i}`,
                data: weights2D[i],
                backgroundColor: colors[i % colors.length],
                borderColor: borderColors[i % borderColors.length],
                borderWidth: borderWidth,
                pointStyle: false
            });
        }
        // If there is no chart instance -> create new
        if(!genChartInstance){
            genChartInstance = new Chart(ctx, {
                type: "line",
                data: {
                    labels: genLabels,
                    datasets: datasets
                },
                options: {
                    scales: {
                        y: {
                            title: {
                                display: true,
                                text: 'Weight value',
                                color: 'white'
                            },
                            ticks: {
                                color: 'white'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Generation',
                                color: 'white'
                            },
                            ticks: {
                                color: 'white'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false, // disable legend
                            position: 'right'
                        }
                    },
                    hover: {
                        mode: null // Disables hover effects
                    },
                    // Disable interaction (e.g., no panning, zooming, etc.)
                    interaction: {
                        mode: null // Disables all interactions
                    },
                }
            });
        }
        else{ // Otherwise update existing chart instance
            genChartInstance.data.labels = genLabels;
            genChartInstance.data.datasets = datasets;
            genChartInstance.update("none");
        }
    }
}

let generationCanvas = document.getElementById("generation-canvas");
let genChartInstance = null;
let genChart = new GenerationChart();