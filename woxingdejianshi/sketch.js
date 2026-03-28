// 文字粒子类
class TextParticle {
  constructor(x, y, char) {
    this.originalX = x;
    this.originalY = y;
    this.x = x;
    this.y = y;
    this.char = char;
    this.size = 18;
    this.color = 0;
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    this.damping = 0.92;
    this.spring = 0.08;
    this.maxSpeed = 8;
    this.windInfluence = 0.15;
    this.isBlown = false;
    this.blownTime = 0;
    this.maxBlownTime = 60;
    this.charWidth = this.size * 0.8;
    this.hoverAlpha = 255;
    this.hoverRadius = 0;
    this.hoverMaxRadius = 30;
    this.isHovered = false;
  }
  
  // 检查鼠标悬停
  checkHover(mouseX, mouseY) {
    let d = dist(this.x, this.y, mouseX, mouseY);
    this.isHovered = d < 30;
    
    if (this.isHovered) {
      this.hoverRadius = lerp(this.hoverRadius, this.hoverMaxRadius, 0.2);
      this.hoverAlpha = 150;
      
      // 鼠标悬停时产生排斥力
      let angle = atan2(this.y - mouseY, this.x - mouseX);
      let force = map(d, 0, 30, 2, 0);
      this.ax += cos(angle) * force;
      this.ay += sin(angle) * force;
    } else {
      this.hoverRadius = lerp(this.hoverRadius, 0, 0.1);
      this.hoverAlpha = lerp(this.hoverAlpha, 255, 0.05);
    }
  }
  
  // 应用风力
  applyWind(mouseX, mouseY, windStrength) {
    if (windStrength > 0) {
      let dx = this.x - mouseX;
      let dy = this.y - mouseY;
      let distance = sqrt(dx * dx + dy * dy);
      
      if (distance < 150) {
        let force = windStrength * map(distance, 0, 150, 1, 0.2);
        let angle = atan2(dy, dx);
        this.ax += cos(angle) * force * this.windInfluence;
        this.ay += sin(angle) * force * this.windInfluence;
        
        this.isBlown = true;
        this.blownTime = this.maxBlownTime;
      }
    }
    
    // 添加随机噪声
    let noiseX = noise(this.originalX * 0.01 + frameCount * 0.02) * 0.3 - 0.15;
    let noiseY = noise(this.originalY * 0.01 + frameCount * 0.02) * 0.3 - 0.15;
    this.ax += noiseX;
    this.ay += noiseY;
  }
  
  // 更新位置
  update() {
    this.vx += this.ax;
    this.vy += this.ay;
    
    let speed = sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > this.maxSpeed) {
      this.vx = (this.vx / speed) * this.maxSpeed;
      this.vy = (this.vy / speed) * this.maxSpeed;
    }
    
    this.x += this.vx;
    this.y += this.vy;
    
    this.vx *= this.damping;
    this.vy *= this.damping;
    
    let currentSpring = this.isBlown ? this.spring * 0.3 : this.spring;
    let springX = (this.originalX - this.x) * currentSpring;
    let springY = (this.originalY - this.y) * currentSpring;
    this.vx += springX;
    this.vy += springY;
    
    this.ax = 0;
    this.ay = 0;
    
    if (this.isBlown) {
      this.blownTime--;
      if (this.blownTime <= 0) {
        this.isBlown = false;
      }
    }
    
    // 边界检查
    if (this.x < -50) this.x = -50;
    if (this.x > width + 50) this.x = width + 50;
    if (this.y < -50) this.y = -50;
    if (this.y > height + 50) this.y = height + 50;
    
    // 检查是否被箭矢击中
    for (let arrow of arrows) {
      if (!arrow.hitParticles.has(this) && arrow.isActive) {
        let d = dist(this.x, this.y, arrow.x, arrow.y);
        if (d < 20) {
          // 被箭矢击中时产生强烈冲击
          let angle = atan2(this.y - arrow.y, this.x - arrow.x);
          let force = 8;
          this.vx += cos(angle) * force;
          this.vy += sin(angle) * force;
          
          // 标记为已击中
          arrow.hitParticles.add(this);
          
          // 创建击中效果
          createArrowHitEffect(arrow.x, arrow.y);
        }
      }
    }
  }
  
  // 显示文字
  display() {
    // 显示悬停光环
    if (this.hoverRadius > 1) {
      push();
      noFill();
      stroke(255, 200, 50, this.hoverAlpha);
      strokeWeight(1);
      ellipse(this.x, this.y, this.hoverRadius * 2);
      pop();
    }
    
    // 显示文字
    push();
    fill(this.color, this.isBlown ? 180 : this.hoverAlpha);
    noStroke();
    textSize(this.size);
    textAlign(CENTER, CENTER);
    text(this.char, this.x, this.y);
    pop();
  }
}

// 箭矢类
class Arrow {
  constructor(startX, startY, targetX, targetY) {
    this.startX = startX;
    this.startY = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.x = startX;
    this.y = startY;
    
    // 计算箭矢方向
    this.angle = atan2(targetY - startY, targetX - startX);
    this.speed = 15;
    this.vx = cos(this.angle) * this.speed;
    this.vy = sin(this.angle) * this.speed;
    
    this.length = 40;
    this.width = 8;
    this.isActive = true;
    this.lifetime = 60;
    this.hitParticles = new Set();
    
    // 箭矢颜色
    this.color = {
      shaft: [200, 150, 100],
      fletching: [255, 200, 50],
      head: [180, 60, 30]
    };
  }
  
  update() {
    if (this.isActive) {
      this.x += this.vx;
      this.y += this.vy;
      
      // 检查是否到达目标位置或超出边界
      let d = dist(this.x, this.y, this.targetX, this.targetY);
      if (d < 10 || 
          this.x < -100 || this.x > width + 100 || 
          this.y < -100 || this.y > height + 100) {
        this.isActive = false;
      }
      
      this.lifetime--;
      if (this.lifetime <= 0) {
        this.isActive = false;
      }
    }
  }
  
  display() {
    if (this.isActive) {
      push();
      translate(this.x, this.y);
      rotate(this.angle);
      
      // 绘制箭杆
      strokeWeight(3);
      stroke(this.color.shaft[0], this.color.shaft[1], this.color.shaft[2], 200);
      line(0, 0, this.length, 0);
      
      // 绘制箭尾羽毛
      strokeWeight(2);
      stroke(this.color.fletching[0], this.color.fletching[1], this.color.fletching[2], 200);
      
      // 三根羽毛
      for (let i = 0; i < 3; i++) {
        let angleOffset = (i - 1) * 0.3;
        let featherLength = 10;
        let x1 = 0;
        let y1 = 0;
        let x2 = cos(angleOffset) * featherLength;
        let y2 = sin(angleOffset) * featherLength;
        line(x1, y1, x2, y2);
      }
      
      // 绘制箭头
      fill(this.color.head[0], this.color.head[1], this.color.head[2], 200);
      noStroke();
      beginShape();
      vertex(this.length, 0);
      vertex(this.length - 10, -6);
      vertex(this.length - 10, 6);
      endShape(CLOSE);
      
      // 绘制箭矢轨迹
      stroke(255, 200, 50, 100);
      strokeWeight(1);
      noFill();
      for (let i = 0; i < 5; i++) {
        let trailLength = 20 + i * 5;
        let alpha = 50 - i * 10;
        stroke(255, 200, 50, alpha);
        line(-trailLength, 0, 0, 0);
      }
      
      pop();
    }
  }
}

// 箭矢击中效果类
class ArrowHitEffect {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.particles = [];
    this.lifetime = 30;
    
    // 创建击中粒子
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: random(-3, 3),
        vy: random(-3, 3),
        size: random(2, 6),
        color: [255, 200, 50, 200],
        lifetime: random(20, 40)
      });
    }
  }
  
  update() {
    this.lifetime--;
    for (let particle of this.particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.95;
      particle.vy *= 0.95;
      particle.lifetime--;
    }
  }
  
  display() {
    for (let particle of this.particles) {
      if (particle.lifetime > 0) {
        push();
        noStroke();
        fill(particle.color[0], particle.color[1], particle.color[2], 
             map(particle.lifetime, 0, 40, 0, particle.color[3]));
        ellipse(particle.x, particle.y, particle.size);
        pop();
      }
    }
  }
  
  isFinished() {
    return this.lifetime <= 0;
  }
}

// 四角星星类（作为鼠标光标）
class FourPointStar {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.size = 24;
    this.rotation = 0;
    this.rotationSpeed = 0.02;
    this.pulse = 0;
    this.pulseSpeed = 0.08;
    this.pulseDirection = 1;
    this.color = [255, 200, 50];
    this.haloAlpha = 0;
    this.haloSize = 0;
  }
  
  update() {
    this.x = mouseX;
    this.y = mouseY;
    this.rotation += this.rotationSpeed;
    this.pulse += this.pulseSpeed * this.pulseDirection;
    
    if (this.pulse > 1 || this.pulse < 0) {
      this.pulseDirection *= -1;
    }
    
    // 鼠标移动时增加光晕效果
    if (mouseIsPressed) {
      this.haloAlpha = lerp(this.haloAlpha, 100, 0.1);
      this.haloSize = lerp(this.haloSize, 50, 0.1);
    } else {
      this.haloAlpha = lerp(this.haloAlpha, 0, 0.05);
      this.haloSize = lerp(this.haloSize, 0, 0.05);
    }
  }
  
  display() {
    // 显示光晕
    if (this.haloAlpha > 5) {
      push();
      noFill();
      stroke(255, 200, 50, this.haloAlpha);
      strokeWeight(2);
      ellipse(this.x, this.y, this.haloSize);
      pop();
    }
    
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    
    let currentSize = this.size * (1 + this.pulse * 0.2);
    
    // 绘制四角星星
    fill(this.color[0], this.color[1], this.color[2], 220);
    noStroke();
    
    for (let i = 0; i < 4; i++) {
      push();
      rotate(i * HALF_PI);
      
      beginShape();
      vertex(0, 0);
      vertex(currentSize * 0.4, -currentSize * 0.15);
      vertex(currentSize, 0);
      vertex(currentSize * 0.4, currentSize * 0.15);
      endShape(CLOSE);
      
      pop();
    }
    
    // 绘制中心圆点
    fill(255, 230, 100, 200);
    ellipse(0, 0, currentSize * 0.3, currentSize * 0.3);
    
    // 绘制中心亮点
    fill(255, 255, 200);
    ellipse(0, 0, currentSize * 0.15, currentSize * 0.15);
    
    pop();
  }
}

// 交互管理器
class InteractionManager {
  constructor() {
    this.mouseTrail = [];
    this.maxTrailLength = 15;
    this.trailColor = [255, 200, 50, 80];
    this.particles = [];
    this.maxParticles = 30;
    this.particleLifetime = 25;
  }
  
  update() {
    // 更新鼠标轨迹
    this.mouseTrail.push({x: mouseX, y: mouseY});
    if (this.mouseTrail.length > this.maxTrailLength) {
      this.mouseTrail.shift();
    }
    
    // 更新粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].lifetime--;
      if (this.particles[i].lifetime <= 0) {
        this.particles.splice(i, 1);
      } else {
        this.particles[i].x += this.particles[i].vx;
        this.particles[i].y += this.particles[i].vy;
        this.particles[i].vy += 0.08;
      }
    }
  }
  
  display() {
    // 显示鼠标轨迹
    for (let i = 0; i < this.mouseTrail.length; i++) {
      let alpha = map(i, 0, this.mouseTrail.length, 10, 60);
      let size = map(i, 0, this.mouseTrail.length, 1, 6);
      
      push();
      noStroke();
      fill(this.trailColor[0], this.trailColor[1], this.trailColor[2], alpha);
      ellipse(this.mouseTrail[i].x, this.mouseTrail[i].y, size);
      pop();
    }
    
    // 显示粒子
    for (let particle of this.particles) {
      push();
      noStroke();
      fill(particle.color[0], particle.color[1], particle.color[2], 
           map(particle.lifetime, 0, this.particleLifetime, 0, particle.color[3]));
      ellipse(particle.x, particle.y, particle.size);
      pop();
    }
  }
}

// 音乐管理器
class MusicManager {
  constructor() {
    this.musicUrl = "https://bear-images.sfo2.cdn.digitaloceanspaces.com/huiye/-27.mp3";
    this.music = null;
    this.isPlaying = false;
    this.hasStarted = false;
    this.volume = 0.7;
    this.loadAttempts = 0;
    this.maxLoadAttempts = 3;
  }
  
  preload() {
    // 预加载音乐
    console.log("开始加载背景音乐...");
    this.music = loadSound(this.musicUrl, 
      () => {
        console.log("背景音乐加载成功");
        this.setupMusic();
      },
      (err) => {
        console.error("背景音乐加载失败:", err);
        this.loadAttempts++;
        if (this.loadAttempts < this.maxLoadAttempts) {
          console.log(`第${this.loadAttempts}次重试加载...`);
          setTimeout(() => this.preload(), 1000);
        }
      }
    );
  }
  
  setupMusic() {
    if (this.music) {
      this.music.setVolume(this.volume);
      this.music.loop();
      this.isPlaying = true;
      console.log("背景音乐开始循环播放");
    }
  }
  
  play() {
    if (this.music && !this.isPlaying) {
      this.music.loop();
      this.isPlaying = true;
      this.hasStarted = true;
    }
  }
  
  stop() {
    if (this.music && this.isPlaying) {
      this.music.stop();
      this.isPlaying = false;
    }
  }
  
  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
  }
  
  setVolume(vol) {
    this.volume = constrain(vol, 0, 1);
    if (this.music) {
      this.music.setVolume(this.volume);
    }
  }
}

// 全局变量
let textParticles = [];
let interactionManager;
let fourPointStar;
let musicManager;
let windStrength = 0;
let targetWindStrength = 0;
let arrows = [];
let arrowHitEffects = [];
let textContent = "灯火的闪动温度，蚕丝的布料横亘冷的厅堂，茶水与苦酒都冷凝，\n寂夜与蝉鸣的遮盖下，凉意斜行过彩绘花窗的边框。\n可一瞬绷紧的热望后，是永恒盛夏映入了夜紫的帷幕，交弥之间的触碰要茶盏翻倒。\n维伦未能穿戴铠甲，双剑也早就于拜访神秘屋时搁置旁侧，但他毫无防守地顺服于心的溃败，\n因诚挚的力量总是庞大，\n冲撞狂野，碾压过麦田的雷鸣阵雨，\n也叫爱慕在此刻显现有它独特阵痛的特质：\n经过、缠绕、窒息、勒紧\n被扣拢的每一寸皮肤但毫无伤害。\n一枚箭，\n一支羽毛铸成的锋刃，\n颤栗、欣愉地穿透此身。";
let canvasWidth = 1200;
let canvasHeight = 700;

function preload() {
  // 预加载音乐
  musicManager = new MusicManager();
  musicManager.preload();
}

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  
  // 设置文字样式 - 改进的字体设置
  // 尝试多种宋体字体名称，确保至少有一种能工作
  let fontList = [
    'SimSun',           // Windows 宋体
    'NSimSun',          // Windows 新宋体
    'FangSong',         // Windows 仿宋
    'STSong',           // Mac 宋体
    'STFangsong',       // Mac 仿宋
    'SimSun-ExtB',      // Windows 宋体扩展
    'serif'             // 最后的回退
  ];
  
  // 尝试设置字体
  let fontSet = false;
  for (let fontName of fontList) {
    try {
      textFont(fontName);
      console.log(`尝试设置字体: ${fontName}`);
      fontSet = true;
      break;
    } catch (e) {
      console.log(`字体 ${fontName} 不可用`);
    }
  }
  
  if (!fontSet) {
    console.log("所有指定字体都不可用，使用默认字体");
  }
  
  textAlign(CENTER, CENTER);
  
  // 创建交互管理器
  interactionManager = new InteractionManager();
  
  // 创建四角星星光标
  fourPointStar = new FourPointStar();
  
  // 创建文字粒子
  createTextParticles();
  
  // 隐藏系统光标
  noCursor();
  
  // 添加点击开始交互的提示
  console.log("点击画布开始交互和播放音乐");
}

function createTextParticles() {
  textParticles = [];
  
  let lines = textContent.split('\n');
  let lineHeight = 32;
  let startY = height / 2 - (lines.length - 1) * lineHeight / 2;
  
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    let line = lines[lineIndex];
    let lineY = startY + lineIndex * lineHeight;
    
    // 临时创建一个文本元素来测量实际宽度
    let tempSize = 20;
    let charWidth;
    
    // 根据字符类型设置不同宽度
    if (isChineseChar(line.charAt(0))) {
      charWidth = 22; // 中文字符通常更宽
    } else {
      charWidth = 12; // 英文字符和标点
    }
    
    let lineWidth = line.length * charWidth;
    let startX = width / 2 - lineWidth / 2 + charWidth/2;
    
    for (let i = 0; i < line.length; i++) {
      let char = line.charAt(i);
      let x = startX + i * charWidth;
      let particle = new TextParticle(x, lineY, char);
      
      // 根据字符类型调整大小
      if (char === ' ') {
        particle.size = 10;
        particle.color = 100;
        particle.charWidth = 8;
      } else if (char === ',' || char === '，' || char === '。' || char === '：' || char === '、') {
        particle.size = 14;
        particle.color = 50;
        particle.charWidth = 8;
      } else if (isChineseChar(char)) {
        particle.size = 20;
        particle.color = 0;
        particle.charWidth = 22;
      } else {
        particle.size = 16;
        particle.color = 0;
        particle.charWidth = 12;
      }
      
      textParticles.push(particle);
    }
  }
}

function isChineseChar(char) {
  return /[\u4e00-\u9fa5]/.test(char);
}

function createArrowHitEffect(x, y) {
  arrowHitEffects.push(new ArrowHitEffect(x, y));
}

function draw() {
  // 渐变背景
  for (let i = 0; i <= height; i++) {
    let inter = map(i, 0, height, 0, 1);
    let c = lerpColor(color(250, 245, 235), color(240, 235, 225), inter);
    stroke(c);
    line(0, i, width, i);
  }
  
  // 更新风力
  windStrength = lerp(windStrength, targetWindStrength, 0.1);
  
  // 更新交互管理器
  interactionManager.update();
  
  // 更新四角星星
  fourPointStar.update();
  
  // 更新和显示文字粒子
  for (let particle of textParticles) {
    particle.checkHover(mouseX, mouseY);
    particle.applyWind(mouseX, mouseY, windStrength);
    particle.update();
    particle.display();
  }
  
  // 更新和显示箭矢
  for (let i = arrows.length - 1; i >= 0; i--) {
    arrows[i].update();
    arrows[i].display();
    
    if (!arrows[i].isActive) {
      arrows.splice(i, 1);
    }
  }
  
  // 更新和显示击中效果
  for (let i = arrowHitEffects.length - 1; i >= 0; i--) {
    arrowHitEffects[i].update();
    arrowHitEffects[i].display();
    
    if (arrowHitEffects[i].isFinished()) {
      arrowHitEffects.splice(i, 1);
    }
  }
  
  // 显示交互效果
  interactionManager.display();
  
  // 显示四角星星（作为光标）
  fourPointStar.display();
  
  // 绘制连接线
  stroke(180, 160, 140, 40);
  strokeWeight(0.8);
  
  for (let i = 0; i < textParticles.length; i++) {
    let p1 = textParticles[i];
    
    for (let j = i + 1; j < min(i + 25, textParticles.length); j++) {
      let p2 = textParticles[j];
      let d = dist(p1.x, p1.y, p2.x, p2.y);
      
      if (d < 25) {
        let alpha = map(d, 0, 25, 80, 10);
        stroke(180, 160, 140, alpha);
        line(p1.x, p1.y, p2.x, p2.y);
      }
    }
  }
  
  // 显示音乐状态提示（仅在音乐未开始时显示）
  if (musicManager.music && !musicManager.hasStarted) {
    push();
    fill(100, 80, 60, 180);
    noStroke();
    textSize(16);
    textAlign(CENTER);
    text("点击画布开始交互和播放音乐", width/2, height - 40);
    pop();
  }
}

function mouseMoved() {
  targetWindStrength = 2;
  
  // 鼠标移动时开始播放音乐（如果还没开始）
  if (!musicManager.hasStarted && musicManager.music) {
    musicManager.play();
    musicManager.hasStarted = true;
  }
}

function mouseDragged() {
  targetWindStrength = 4;
}

function mouseReleased() {
  targetWindStrength = 0;
}

function mousePressed() {
  // 点击时开始播放音乐（如果还没开始）
  if (!musicManager.hasStarted && musicManager.music) {
    musicManager.play();
    musicManager.hasStarted = true;
  }
  
  // 创建箭矢从随机位置射向鼠标点击位置
  let startX, startY;
  
  let side = floor(random(4));
  switch(side) {
    case 0:
      startX = random(width);
      startY = -50;
      break;
    case 1:
      startX = width + 50;
      startY = random(height);
      break;
    case 2:
      startX = random(width);
      startY = height + 50;
      break;
    case 3:
      startX = -50;
      startY = random(height);
      break;
  }
  
  arrows.push(new Arrow(startX, startY, mouseX, mouseY));
  
  // 鼠标点击时产生轻微冲击波效果
  for (let particle of textParticles) {
    let d = dist(particle.x, particle.y, mouseX, mouseY);
    if (d < 50) {
      let angle = atan2(particle.y - mouseY, particle.x - mouseX);
      let force = map(d, 0, 50, 2, 0);
      particle.vx += cos(angle) * force;
      particle.vy += sin(angle) * force;
    }
  }
  
  // 点击时在星星周围产生粒子效果
  for (let i = 0; i < 8; i++) {
    interactionManager.particles.push({
      x: mouseX + random(-15, 15),
      y: mouseY + random(-15, 15),
      vx: random(-1.5, 1.5),
      vy: random(-2, -0.5),
      size: random(2, 5),
      color: [255, 200, 50, 180],
      lifetime: interactionManager.particleLifetime
    });
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    createTextParticles();
    targetWindStrength = 0;
    arrows = [];
    arrowHitEffects = [];
  }
  
  if (key === ' ') {
    for (let particle of textParticles) {
      particle.x = particle.originalX;
      particle.y = particle.originalY;
      particle.vx = 0;
      particle.vy = 0;
    }
    arrows = [];
    arrowHitEffects = [];
  }
  
  // 按A键测试箭矢效果
  if (key === 'a' || key === 'A') {
    let startX = random(width);
    let startY = random(height);
    let targetX = random(width);
    let targetY = random(height);
    arrows.push(new Arrow(startX, startY, targetX, targetY));
  }
  
  // 按M键切换音乐播放/暂停
  if (key === 'm' || key === 'M') {
    musicManager.toggle();
  }
  
  // 按+键增加音量
  if (key === '+' || key === '=') {
    musicManager.setVolume(musicManager.volume + 0.1);
  }
  
  // 按-键减少音量
  if (key === '-' || key === '_') {
    musicManager.setVolume(musicManager.volume - 0.1);
  }
}