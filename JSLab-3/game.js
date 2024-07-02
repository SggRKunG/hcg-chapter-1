class Game{
    constructor(){
        this.canvas = document.getElementById("game");
        this.context = this.canvas.getContext("2d");
        this.sprites = [];

        this.spriteImage = new Image();
        this.spriteImage.src = "flower.png";

        const game = this;
        this.spriteImage.onload = function(){
            game.lastRefreshTime = Date.now();
            game.spawn();
            game.refresh();
        }
    }

    spawn(){
        const sprite = new Sprite({
            context: this.context,
            x: Math.random()*this.canvas.clientWidth,
            y: Math.random()*this.canvas.clientHeight,
            width: this.spriteImage.width,
            height: this.spriteImage.height,
            image: this.spriteImage,
            states: [
                {mode: "spawn", duration: 0.5},
                {mode: "static", duration: 1.5},
                {mode: "die", duration: 0.8}
            ]
        });

        this.sprites.push(sprite);
        this.sinceLastSpawn = 0;
    }

    refresh(){
        const now = Date.now();
        const dt = (now-this.lastRefreshTime)/1000.0;

        this.update(dt);
        this.render();

        this.lastRefreshTime = now;

        const game = this;
        requestAnimationFrame(function(){game.refresh();});
    }

    update(dt){
        this.sinceLastSpawn+=dt;
        if(this.sinceLastSpawn>1) this.spawn();

        let removed;
        do{
            removed = false;
            for(let sprite of this.sprites){
                if(sprite.kill){
                    const index = this.sprites.indexOf(sprite);
                    this.sprites.splice(index,1);
                    removed = true;
                    break;
                }
            }
        }while(removed);

        for(let sprite of this.sprites){
            if(sprite==null) continue;
            sprite.update(dt);
        }
    }

    render(){

        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
        
        for(let sprite of this.sprites){
            sprite.render();
        }
    }
}