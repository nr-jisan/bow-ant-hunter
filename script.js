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

let score = 0;
let ants = [];
let arrows = [];
let gameOver = false;
let angle = 0;

/* =======================
   GYROSCOPE AIMING
======================= */

window.addEventListener("deviceorientation", (event) => {
    if(event.gamma !== null){
        angle = event.gamma;
    }
});

/* =======================
   SHOOT ON TOUCH
======================= */

document.addEventListener("touchstart", () => {
    if(gameOver) return;

    arrows.push({
        x: canvas.width/2,
        y: canvas.height - 120,
        angle: angle
    });
});

/* =======================
   SPAWN ANTS
======================= */

function spawnAnt(){
    ants.push({
        x: Math.random() * (canvas.width - 40),
        y: -40,
        speed: 2 + score * 0.1
    });
}

setInterval(spawnAnt, 1500);

/* =======================
   UPDATE GAME
======================= */

function update(){

    if(gameOver) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Draw bow
    ctx.save();
    ctx.translate(canvas.width/2, canvas.height - 100);
    ctx.rotate(angle * Math.PI/180);
    ctx.drawImage(bowImg, -40, -80, 80, 160);
    ctx.restore();

    // Draw arrows
    arrows.forEach((arrow, index) => {
        let rad = arrow.angle * Math.PI/180;

        arrow.x += Math.sin(rad) * 8;
        arrow.y -= Math.cos(rad) * 8;

        ctx.save();
        ctx.translate(arrow.x, arrow.y);
        ctx.rotate(rad);
        ctx.drawImage(arrowImg, -10, -40, 20, 80);
        ctx.restore();

        if(arrow.y < 0){
            arrows.splice(index,1);
        }
    });

    // Draw ants
    ants.forEach((ant, aIndex) => {

        ant.y += ant.speed;

        ctx.drawImage(antImg, ant.x, ant.y, 40, 40);

        // Game Over condition
        if(ant.y > canvas.height - 40){
            gameOver = true;
            document.getElementById("gameOver").style.display = "block";
        }

        // Collision check
        arrows.forEach((arrow, rIndex) => {
            if(
                arrow.x > ant.x &&
                arrow.x < ant.x + 40 &&
                arrow.y > ant.y &&
                arrow.y < ant.y + 40
            ){
                ants.splice(aIndex,1);
                arrows.splice(rIndex,1);
                score++;
            }
        });

    });

    // Score
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 20, 30);

    requestAnimationFrame(update);
}

update();

/* =======================
   RESTART
======================= */

function restartGame(){
    score = 0;
    ants = [];
    arrows = [];
    gameOver = false;
    document.getElementById("gameOver").style.display = "none";
}
