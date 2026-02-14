const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bowImg = new Image();
bowImg.src = "bow.png";

let arrowImg = new Image();
arrowImg.src = "arrow.png";

let antImg = new Image();
antImg.src = "ant.png";

let arrows = [];
let ants = [];
let score = 0;
let angle = 0;
let gameOver = false;
let charging = false;

/* =========================
   GYROSCOPE AIM
========================= */

window.addEventListener("deviceorientation", (event)=>{
    if(event.gamma !== null){
        angle = event.gamma;
    }
});

/* =========================
   CHARGER DETECTION
========================= */

if(navigator.getBattery){
    navigator.getBattery().then(function(battery){

        function updateCharging(){
            if(battery.charging){
                charging = true;
                console.log("Charging...");
            } else {
                if(charging){
                    shootArrow();
                }
                charging = false;
            }
        }

        updateCharging();
        battery.addEventListener("chargingchange", updateCharging);
    });
}

/* =========================
   SHOOT FUNCTION
========================= */

function shootArrow(){

    if(gameOver) return;

    arrows.push({
        x: canvas.width/2,
        y: canvas.height - 180,
        angle: angle
    });
}

/* =========================
   SPAWN ANTS SYSTEM
========================= */

let spawnRate = 2000; // start slow
let antCount = 1;

function spawnAnts(){

    for(let i=0;i<antCount;i++){
        ants.push({
            x: Math.random()*(canvas.width-120),
            y: -120,
            speed: 1 + score*0.05
        });
    }
}

setInterval(spawnAnts, spawnRate);

/* Increase difficulty */
setInterval(()=>{
    if(score > 5) antCount = 2;
    if(score > 15) antCount = 3;
}, 3000);

/* =========================
   GAME LOOP
========================= */

function gameLoop(){

    if(gameOver) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    /* DRAW BOW (BIG) */
    ctx.save();
    ctx.translate(canvas.width/2, canvas.height-150);
    ctx.rotate(angle*Math.PI/180);
    ctx.drawImage(bowImg, -120, -200, 240, 400); // BIG SIZE
    ctx.restore();

    /* DRAW ARROWS (BIG) */
    arrows.forEach((arrow,index)=>{

        let rad = arrow.angle*Math.PI/180;

        arrow.x += Math.sin(rad)*10;
        arrow.y -= Math.cos(rad)*10;

        ctx.save();
        ctx.translate(arrow.x,arrow.y);
        ctx.rotate(rad);
        ctx.drawImage(arrowImg, -40,-120,80,240); // BIG ARROW
        ctx.restore();

        if(arrow.y < 0){
            arrows.splice(index,1);
        }
    });

    /* DRAW ANTS (BIG) */
    ants.forEach((ant,aIndex)=>{

        ant.y += ant.speed;

        ctx.drawImage(antImg, ant.x, ant.y, 120, 120); // BIG ANT

        /* GAME OVER */
        if(ant.y > canvas.height-120){
            gameOver = true;
            document.getElementById("gameOver").style.display="block";
        }

        /* COLLISION */
        arrows.forEach((arrow,rIndex)=>{
            if(
                arrow.x > ant.x &&
                arrow.x < ant.x+120 &&
                arrow.y > ant.y &&
                arrow.y < ant.y+120
            ){
                ants.splice(aIndex,1);
                arrows.splice(rIndex,1);
                score++;
            }
        });

    });

    /* SCORE DISPLAY */
    ctx.fillStyle="white";
    ctx.font="30px Arial";
    ctx.fillText("Score: "+score,20,40);

    requestAnimationFrame(gameLoop);
}

gameLoop();

/* =========================
   RESTART
========================= */

function restartGame(){
    score=0;
    arrows=[];
    ants=[];
    antCount=1;
    gameOver=false;
    document.getElementById("gameOver").style.display="none";
}
