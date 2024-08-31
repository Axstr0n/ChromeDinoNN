class Controls{
    constructor(){
        this.jump = false;
        this.bend = false;
        this.forward = false;
        this.backward = false;

        this.#addKeyboardListeners();
    }

    #addKeyboardListeners(){
        document.onkeydown = (event)=>{
            switch(event.key){
                case "ArrowUp":
                    this.jump = true;
                    break;
                case "ArrowDown":
                    this.bend = true;
                    break;
                // For testing//
                case "ArrowRight":
                    this.forward = true;
                    break;
                case "ArrowLeft":
                    this.backward = true;
                    break;
                ////////////////
            }
        }
        document.onkeyup = (event)=>{
            switch(event.key){
                case "ArrowUp":
                    this.jump = false;
                    break;
                case "ArrowDown":
                    this.bend = false;
                    break;
                // For testing//
                case "ArrowRight":
                    this.forward = false;
                    break;
                case "ArrowLeft":
                    this.backward = false;
                    break;
                ////////////////
            }
        }
    }
}