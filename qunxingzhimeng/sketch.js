let stars = [];
let auroraParticles = [];
const PARTICLE_COUNT = 500; 
let bgMusic;

function preload() {
  bgMusic = loadSound('https://bear-images.sfo2.cdn.digitaloceanspaces.com/huiye/-25.mp3');
}

function setup() {
  createCanvas(800, 800);
  for (let i = 0; i < 180; i++) {
    stars.push(new Star());
  }
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    auroraParticles.push(new AuroraParticle());
  }
}

function draw() {
  drawHighContrastBackground();

  push();
  translate(width / 2, height / 2);
  for (let s of stars) {
    s.update();
    s.display();
  }
  pop();

  drawAllCorners();

  drawMagicGate(width / 2, height * 0.68);

  drawGoldenStar(width / 2, height * 0.75, 20);

  drawMouseStar();
}

function mousePressed() {
  if (bgMusic && !bgMusic.isPlaying()) {
    bgMusic.loop();
  }
}

function drawHighContrastBackground() {
  noStroke();
  
  background(0, 20, 80);

  let glowX = width / 2;
  let glowY = height * 0.5;
  
  let gradient = drawingContext.createRadialGradient(
    glowX, glowY, 20, 
    glowX, glowY, 500
  );
  gradient.addColorStop(0, 'rgba(47,132,255,0.85)');   
  gradient.addColorStop(0.3, 'rgba(69,125,255,0.4)');  
  gradient.addColorStop(0.8, 'rgba(141,166,249,0)');      
  
  drawingContext.fillStyle = gradient;
  rect(0, 0, width, height);

  let warmGlow = drawingContext.createRadialGradient(
    width/2, height*0.75, 10, 
    width/2, height*0.75, 150
  );
  warmGlow.addColorStop(0, 'rgba(255,183,0,0.54)');
  warmGlow.addColorStop(1, 'rgba(255,210,67,0)');
  drawingContext.fillStyle = warmGlow;
  rect(0, 0, width, height);
}

function drawMagicGate(x, y) {
  push();
  translate(x, y);
  
  let w = 200;
  let h = 440;
  
  for (let p of auroraParticles) {
    p.update(w, h);
    p.display();
  }

  noFill();
  for (let i = 0; i < 3; i++) {
    let offset = i * 12;
    stroke(220, 240, 255, 200 - i * 60);
    strokeWeight(1.5 - i * 0.4);
    
    let curW = w - offset;
    let archR = curW / 2;
    let straightH = h - archR;

    line(-archR, 0, -archR, -straightH);
    line(archR, 0, archR, -straightH);
    arc(0, -straightH, curW, curW, PI, TWO_PI);
  }

  stroke(255, 180);
  line(-w/2 - 40, 0, w/2 + 40, 0);
  fill(255);
  circle(-w/2 - 45, 0, 4);
  circle(w/2 + 45, 0, 4);

  drawStarBurst(0, -h, 14);
  pop();
}

class AuroraParticle {
  constructor() {
    this.init();
  }

  init() {
    this.x = random(-60, 60);
    this.y = random(0, -50); 
    this.vx = random(-0.5, 0.5);
    this.vy = random(-1, -5); 
    this.size = random(1, 1);
    this.alpha = random(100, 255);
    this.noiseOffset = random(1000);
    this.life = 1.0; 
  }

  update(w, h) {
    let n = noise(this.y * 0.01, this.noiseOffset, frameCount * 0.01);
    this.x += (n - 0.5) * 3 + this.vx;
    this.y += this.vy;
    this.life -= 0.005;

    if (this.y < -h || this.life < 0) {
      this.init();
      this.y = 0;
      this.life = 1.0;
    }
  }

  display() {
    let a = this.alpha * this.life;
    noStroke();
    fill(255, a);
    circle(this.x, this.y, this.size);
    fill(255, 255, 255, a * 0.02);
    circle(this.x, this.y, this.size * 1);
  }
}

class Star {
  constructor() {
    this.angle = random(TWO_PI);
    this.dist = random(5, 400);
    this.speed = random(0.05, 0.0025);
    this.size = random(1, 4);
    this.history = [];
    this.maxHistory = 70;
    
    this.offsetX = 0;
    this.offsetY = 0;
  }

  update() {
    let baseX = cos(this.angle) * this.dist;
    let baseY = sin(this.angle) * this.dist;

    let mx = mouseX - width / 2;
    let my = mouseY - height / 2;
    let d = dist(baseX, baseY, mx, my);

    let interactionRadius = 50; 
    if (d < interactionRadius) {
      let force = map(d, 0, interactionRadius, 1, 30); 
      let angleToMouse = atan2(baseY - my, baseX - mx);
      this.offsetX += cos(angleToMouse) * force;
      this.offsetY += sin(angleToMouse) * force;
    }

    this.offsetX *= 0.8;
    this.offsetY *= 1;

    let finalX = baseX + this.offsetX;
    let finalY = baseY + this.offsetY;

    this.history.push({x: finalX, y: finalY});
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    this.angle += this.speed;
  }

  display() {
    for (let i = 0; i < this.history.length - 1; i++) {
      let alpha = map(i, 0, this.history.length, 0, 30);
      stroke(200, 220, 255, alpha);
      strokeWeight(map(i, 0, this.history.length, 0.5, this.size * 1));
      line(this.history[i].x, this.history[i].y, this.history[i+1].x, this.history[i+1].y);
    }
    
    let head = this.history[this.history.length - 1];
    noStroke();
    fill(255, 255);
    circle(head.x, head.y, this.size);
  }
}

function drawAllCorners() {
  let m = 10;
  drawCornerPattern(m, m, 0); 
  drawCornerPattern(width - m, m, HALF_PI); 
  drawCornerPattern(width - m, height - m, PI); 
  drawCornerPattern(m, height - m, PI + HALF_PI); 
}

function drawCornerPattern(x, y, rot) {
  push();
  translate(x, y);
  rotate(rot);
  stroke(255, 150);
  strokeWeight(1);
  noFill();
  
  beginShape();
  vertex(0, 0);
  vertex(130, 0);
  vertex(130, 8);
  bezierVertex(100, 10, 10, 100, 8, 130);
  vertex(0, 130);
  endShape(CLOSE);
  
  for(let i=0; i<3; i++) {
    let offset = 25 + i * 20;
    line(offset, 0, 0, offset);
    circle(30, 30, offset);
  }
  
  fill(255);
  circle(130, 0, 4);
  circle(0, 130, 4);
  pop();
}

function drawGoldenStar(x, y, size) {
  push();
  translate(x, y);
  let breath = sin(frameCount * 0.05) * 5;
  
  drawingContext.shadowBlur = 25;
  drawingContext.shadowColor = color(255, 180, 0);
  
  fill(255, 230, 100);
  noStroke();
  
  beginShape();
  for(let i=0; i<16; i++) {
    let r = (i % 2 === 0) ? size * 3 + breath : size * 0.7;
    let angle = TWO_PI * i / 16 - HALF_PI;
    vertex(cos(angle) * r, sin(angle) * r);
  }
  endShape(CLOSE);
  
  noFill();
  stroke(255, 215, 0, 150);
  strokeWeight(0.7);
  rotate(frameCount * 0.01);
  circle(0, 0, size * 7);
  rectMode(CENTER);
  rect(0, 0, size * 5.5, size * 5.5);
  pop();
}

function drawStarBurst(x, y, size) {
  push();
  translate(x, y);
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = 'white';
  for (let i = 0; i < 8; i++) {
    stroke(255, 255 - i * 15);
    strokeWeight(i % 2 === 0 ? 2 : 0.8);
    let len = i % 2 === 0 ? size : size * 0.5;
    line(-len, 0, len, 0);
    rotate(PI/4);
  }
  fill(255);
  circle(0, 0, 6);
  pop();
}

function drawMouseStar() {
  push();
  translate(mouseX, mouseY);
  
  drawingContext.shadowBlur = 5;
  drawingContext.shadowColor = 'rgba(255,201,0,0.8)';
  
  let breath = sin(frameCount * 0.1) * 2;
  
  noStroke();
  fill(255);
  circle(0, 0, 6 + breath);
  
  stroke(255, 200);
  strokeWeight(2.5);
  line(-15 - breath, 0, 15 + breath, 0);
  line(0, -15 - breath, 0, 15 + breath);
  
  pop();
}