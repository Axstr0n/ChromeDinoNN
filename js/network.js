class NeuralNetworkManager{
    static mutate(brain, amount=1){
        brain.levels.forEach(level => {
            // For each level mutate biases
            for (let i = 0; i < level.biases.length; i++) {
                level.biases[i] = lerp(
                    level.biases[i],
                    Math.random() * 2 - 1,
                    amount
                );
            }
            // For each level mutate weights
            for (let i = 0; i < level.weights.length; i++) {
                for (let j = 0; j < level.weights[i].length; j++) {
                    level.weights[i][j] = lerp(
                        level.weights[i][j],
                        Math.random() * 2 - 1,
                        amount
                    );
                }
            }
        });
    }
    static feedForward(brain, inputs){
        // Calculate output
        let outputs = LevelManager.feedForward(brain.levels[0], inputs);
        for (let i = 1; i < brain.levels.length; i++) {
            outputs = LevelManager.feedForward(brain.levels[i], outputs);
        }
        return outputs;
    }
}

class NeuralNetwork{
    constructor(neuronCount){ // [sensors,5,2]
        this.levels = [];
        for (let i = 0; i < neuronCount.length-1; i++) {
            this.levels.push(new Level(neuronCount[i], neuronCount[i+1]));
        }
    }
}

class LevelManager{

    static feedForward(level, inputs){
        // Calculate output
        for (let i = 0; i < level.biases.length; i++) {
            let sum = 0;
            for (let j = 0; j < inputs.length; j++) {
                sum += inputs[j] * level.weights[j][i];
            }
            if(sum >= level.biases[i]){
                level.outputs[i] = 1;
            }
            else{
                level.outputs[i] = 0;
            }
        }
        return level.outputs;
    }
}

class Level{
    constructor(inputCount, outputCount){
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);
        this.biases = new Array(outputCount);
        this.weights = [];
        for (let i = 0; i < inputCount; i++) {
            this.weights.push(new Array(outputCount));
        }

        this.#randomize();
    }
    
    #randomize(){
        for (let i = 0; i < this.biases.length; i++) {
            this.biases[i] = Math.random();
        }
        for (let i = 0; i < this.inputs.length; i++) {
            for (let j = 0; j < this.outputs.length; j++) {
                this.weights[i][j] = Math.random();
            }
        }
    }
}