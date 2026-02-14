const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let arrows = [];
let balloons = [];
let score = 0;
let angle = 0;
let charging = false;
let chargePower = 0;
let gameOver = false;

let spawnInterval;
let difficultyInterval;
let balloonSpeed = 1;

/* ===== Gyroscope ===== */

window.addEventListener("deviceorientation", e=>{
    if(e.gamma !== null){
        angle = e.gamma;
    }
});

/* ===== Charger Detection ===== */

if(navigator.getBattery){
    navigator.getBattery().then(battery=>{
        function update(){
            if(battery.charging){
                charging = true;
            }else{
                if(charging) shootArrow();
                charging = false;
            }
        }
        update();
        battery.addEventListener("chargingchange",update);
    });
}

/* ===== Shooting ===== */

function shootArrow(){
    if(gameOver || chargePower < 10) return;

    arrows.push({
        x: canvas.width/2,
        y: canvas.height-140,
        angle: angle,
        power: chargePower
    });

    chargePower = 0;
}

/* ===== Spawn Balloons (Very Few) ===== */

function spawnBalloon(){
    balloons.push({
        x: Math.random()*canvas.width,
        y: -60
    });
}

function startSpawning(){
    spawnInterval = setInterval(spawnBalloon,3000);
}

startSpawning();

/* Increase difficulty gradually */
difficultyInterval = setInterval(()=>{
    balloonSpeed += 0.2;
},10000);

/* ===== Draw 3D Bow ===== */

function drawBow(){
    ctx.save();
    ctx.translate(canvas.width/2,canvas.height-120);
    ctx.rotate(angle*Math.PI/180);

    ctx.lineWidth=8;
    ctx.strokeStyle="#c67c3f";
    ctx.shadowColor="#ff8800";
    ctx.shadowBlur=20;

    ctx.beginPath();
    ctx.moveTo(0,-100);
    ctx.quadraticCurveTo(-60,0,0,100);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0,-100);
    ctx.quadraticCurveTo(60,0,0,100);
    ctx.stroke();

    ctx.restore();
}

/* ===== Draw 3D Arrow ===== */

function drawArrow(a){
    let rad=a.angle*Math.PI/180;

    a.x+=Math.sin(rad)*(6+a.power/10);
    a.y-=Math.cos(rad)*(6+a.power/10);

    ctx.save();
    ctx.translate(a.x,a.y);
    ctx.rotate(rad);

    ctx.fillStyle="#ddd";
    ctx.fillRect(-3,-40,6,80);

    ctx.beginPath();
    ctx.moveTo(-10,-40);
    ctx.lineTo(0,-60);
    ctx.lineTo(10,-40);
    ctx.fill();

    ctx.restore();
}

/* ===== Draw 3D Balloon ===== */

function drawBalloon(b){
    b.y+=balloonSpeed;

    let gradient=ctx.createRadialGradient(b.x,b.y,10,b.x,b.y,30);
    gradient.addColorStop(0,"#ffcccc");
    gradient.addColorStop(1,"#ff0000");

    ctx.fillStyle=gradient;
    ctx.beginPath();
    ctx.arc(b.x,b.y,30,0,Math.PI*2);
    ctx.fill();

    ctx.strokeStyle="white";
    ctx.beginPath();
    ctx.moveTo(b.x,b.y+30);
    ctx.lineTo(b.x,b.y+60);
    ctx.stroke();

    if(b.y>canvas.height-30){
        endGame();
    }
}

/* ===== Collision ===== */

function checkCollision(){
    arrows.forEach((a,ai)=>{
        balloons.forEach((b,bi)=>{
            let dx=a.x-b.x;
            let dy=a.y-b.y;
            if(Math.sqrt(dx*dx+dy*dy)<30){
                balloons.splice(bi,1);
                arrows.splice(ai,1);
                score++;
                document.getElementById("score").innerText="Score: "+score;
            }
        });
    });
}

/* ===== Charging Ring ===== */

function updateChargingUI(){
    let ring=document.getElementById("chargingRing");
    if(charging){
        chargePower+=0.5;
        if(chargePower>100)chargePower=100;
    }
    ring.style.borderColor=`rgba(0,255,0,${chargePower/100})`;
}

/* ===== Game Loop ===== */

function loop(){
    if(gameOver)return;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    drawBow();
    updateChargingUI();

    arrows.forEach((a,i)=>{
        drawArrow(a);
        if(a.y<0)arrows.splice(i,1);
    });

    balloons.forEach(b=>drawBalloon(b));

    checkCollision();

    requestAnimationFrame(loop);
}

loop();

/* ===== Game Over ===== */

function endGame(){
    gameOver=true;
    clearInterval(spawnInterval);
    clearInterval(difficultyInterval);

    document.getElementById("finalScore").innerText="Your Score: "+score;
    document.getElementById("gameOverScreen").classList.add("active");
}

/* ===== Restart ===== */

function restartGame(){
    score=0;
    arrows=[];
    balloons=[];
    balloonSpeed=1;
    chargePower=0;
    gameOver=false;

    document.getElementById("score").innerText="Score: 0";
    document.getElementById("gameOverScreen").classList.remove("active");

    startSpawning();
    difficultyInterval=setInterval(()=>{balloonSpeed+=0.2;},10000);

    loop();
}
