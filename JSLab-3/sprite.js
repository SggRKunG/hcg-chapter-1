class Sprite{
    constructor(options){
        this.context = options.context;
        this.width = options.width;
        this.height = options.height;
        this.image = options.image;
        this.x = options.x;
        this.y = options.y;
        this.states = options.states;
        this.state = 0;
        this.scale = (options.scale==null)?1.0:options.scale;
        this.opacity = (options.opacity==null)?1.0:options.opacity;
        this.currentTime = 0;
        this.kill = false;
    }
    
    set state(index){
        this.stateIndex = index;
        this.stateTime = 0;
    }

    get state(){
        let result;

        if(this.stateIndex<this.states.length) result = this.states[this.stateIndex];

        return result;
    }

    render(){

        const alpha = this.context.globalAlpha;

        this.context.globalAlpha = this.opacity;
        
        this.context.drawImage(
            this.image,
            0,
            0,
            this.width,
            this.height,
            this.x,
            this.y,
            this.width*this.scale,
            this.height*this.scale
        );

        this.context.globalAlpha = alpha;
    }

    update(dt){
        this.stateTime+=dt;
        const state = this.state;
        if(state==null){
            this.kill = true;
            return;
        }
        const delta = this.stateTime/state.duration;
        if(delta>1) this.state = this.stateIndex+1;

        switch(state.mode){
            case "spawn":
                this.scale = delta;
                this.opacity = delta;
                break;
            case "static":
                this.scale = 1.0;
                this.opacity = 1.0;
                break;
            case "die":
                this.scale = 1.0+delta;
                this.opacity = 1.0-delta;
                if(this.opacity<0) this.opacity = 0;
                break;
        }
    }
}