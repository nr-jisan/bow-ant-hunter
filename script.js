const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let arrows = [];
let balloons = [];
let score = 0;
let angle = 0;
let gameOver = false;
let charging = false;
let chargePower = 0;

let spawnInterval;
let difficultyInterval;

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
            } else {
                if(charging){
                    shootArrow();
                }
                charging = false;
                chargePower = 0;
            }
        }

        updateCharging();
        battery.addEventListener("chargingchange", updateCharging);
    });
}

/* =========================
   SHOOT
========================= */

function shootArrow(){
    if(gameOver || chargePower < 5) return;

    arrows.push({
        x: canvas.width/2,
        y: canvas.height - 150,
        angle: angle,
        power: chargePower
    });

    chargePower = 0;
}

/* =========================
   SPAWN BALLOONS (VERY FEW)
========================= */

let spawnRate = 3000;
let balloonSpeed = 1;

function spawnBalloon(){
    balloons.push({
        x: Math.random() * (canvas.width - 60) + 30,
        y: -80
    });
}

function startSpawning(){
    spawnInterval = setInterval(spawnBalloon, spawnRate);
}

startSpawning();

/* Increase difficulty gradually */
difficultyInterval = setInterval(()=>{
    balloonSpeed += 0.2;
    if(spawnRate > 1000){
        spawnRate -= 300;
        clearInterval(spawnInterval);
        startSpawning();
    }
}, 8000);

/* =========================
   DRAW BOW (ANIMATED)
========================= */

function drawBow(){
    ctx.save();
    ctx.translate(canvas.width/2, canvas.height - 120);
    ctx.rotate(angle*Math.PI/180);

    ctx.lineWidth = 6;
    ctx.strokeStyle = "#8B4513";
    ctx.beginPath();
    ctx.moveTo(0, -100);
    ctx.quadraticCurveTo(-60, 0, 0, 100);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -100);
    ctx.quadraticCurveTo(60, 0, 0, 100);
    ctx.stroke();

    ctx.restore();
}

/* =========================
   DRAW ARROW
========================= */

function drawArrow(arrow){
    let rad = arrow.angle*Math.PI/180;

    arrow.x += Math.sin(rad) * (5 + arrow.power/10);
    arrow.y -= Math.cos(rad) * (5 + arrow.power/10);

    ctx.save();
    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(rad);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(0, 40);
    ctx.lineTo(0, -40);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-10,-40);
    ctx.lineTo(0,-60);
    ctx.lineTo(10,-40);
    ctx.fillStyle="white";
    ctx.fill();

    ctx.restore();
}

/* =========================
   DRAW BALLOON
========================= */

function drawBalloon(balloon){

    balloon.y += balloonSpeed;

    ctx.beginPath();
    ctx.arc(balloon.x, balloon.y, 30, 0, Math.PI*2);
    ctx.fillStyle = "red";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(balloon.x, balloon.y+30);
    ctx.lineTo(balloon.x, balloon.y+60);
    ctx.strokeStyle="white";
    ctx.stroke();

    if(balloon.y > canvas.height-20){
        endGame();
    }
}

/* =========================
   COLLISION
========================= */

function checkCollision(){

    arrows.forEach((arrow,aIndex)=>{
        balloons.forEach((balloon,bIndex)=>{

            let dx = arrow.x - balloon.x;
            let dy = arrow.y - balloon.y;
            let distance = Math.sqrt(dx*dx + dy*dy);

            if(distance < 30){
                balloons.splice(bIndex,1);
                arrows.splice(aIndex,1);
                score++;
            }

        });
    });
}

/* =========================
   CHARGING INDICATOR
========================= */

function drawCharging(){

    if(charging){
        chargePower += 0.5;
        if(chargePower > 100) chargePower = 100;
    }

    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height-120, 60, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(0,255,0,${chargePower/100})`;
    ctx.lineWidth = 5;
    ctx.stroke();
}

/* =========================
   GAME LOOP
========================= */

function gameLoop(){

    if(gameOver) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    drawBow();
    drawCharging();

    arrows.forEach((arrow,index)=>{
        drawArrow(arrow);
        if(arrow.y < 0){
            arrows.splice(index,1);
        }
    });

    balloons.forEach((balloon)=>{
        drawBalloon(balloon);
    });

    checkCollision();

    ctx.fillStyle="white";
    ctx.font="22px Arial";
    ctx.fillText("Score: "+score,20,30);

    requestAnimationFrame(gameLoop);
}

gameLoop();

/* =========================
   GAME OVER
========================= */

function endGame(){
    gameOver = true;
    clearInterval(spawnInterval);
    clearInterval(difficultyInterval);
    document.getElementById("gameOver").style.display="block";
}

/* =========================
   RESTART (FIXED)
========================= */

function restartGame(){
    score = 0;
    arrows = [];
    balloons = [];
    balloonSpeed = 1;
    spawnRate = 3000;
    chargePower = 0;
    gameOver = false;

    document.getElementById("gameOver").style.display="none";

    clearInterval(spawnInterval);
    clearInterval(difficultyInterval);

    startSpawning();

    difficultyInterval = setInterval(()=>{
        balloonSpeed += 0.2;
        if(spawnRate > 1000){
            spawnRate -= 300;
            clearInterval(spawnInterval);
            startSpawning();
        }
    }, 8000);

    gameLoop();
}
