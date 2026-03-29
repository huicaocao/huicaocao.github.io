let particles = [];
let textParticles = [];
let textLines = [];
let noiseOffset = 0;
let clickRipple = null;
let clickTime = 0;
let mouseDrag = {
  active: false,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  strength: 0
};

let sentences = [
  "——最深的梦就是死亡之梦。",
  "死亡是智者的沉静接受，焦虑的死亡则是一种惩罚。",
  "过往递交与教导给迪尔格雷的内容，是要他明晰交换血与口舌的念诵所得，",
  "要他为追索登峰造极的力量并行有权柄谋略，再最终站立到白洁厅堂之中为地位换代：",
  "这当然是一条简洁道路。",
  "付出更少，得到更多。",
  "向深渊而不是现实追求，安排每一步的棋子，付出恶德的代价。",
  "翻动书页的声音将蛇行的轨迹压下，一切紧密又静谧得像个梦境。",
  "一个轻柔的脉搏跳动，在蛇蟒盘行的间隙，",
  "俯卧在獠牙同冷意之中的热源。",
  "最终，",
  "是质地上乘的丝织品悬落到蛇鳞周遭，",
  "在收紧时轻抚过感知。",
  "犹如落在喉间，绳结在另一人的手中抽紧。",
  "交替。",
  "河水。",
  "黑色衬里的衣袍，白绵贴合的绒羽。",
  "吞压魂灵。"
];

let bgMusic;
let musicStarted = false;
let sentenceLayouts = [];

function setup() {
  let canvasWidth = windowWidth * 0.8;
  let canvasHeight = windowHeight * 0.9;
  createCanvas(canvasWidth, canvasHeight);
  bgMusic = createAudio('https://bear-images.sfo2.cdn.digitaloceanspaces.com/huiye/-50.mp3');
  bgMusic.volume(0.2); 
  bgMusic.autoplay(false);
  bgMusic.loop(true); 
  noCursor();
  
  let yOffset = height * 0.13;
  let sentenceSpacing = 30;
  
  for (let i = 0; i < sentences.length; i++) {
    let sentence = sentences[i];
    let words = sentence.split('');
    let baseX = width * 0.1;
    let baseY = yOffset + i * sentenceSpacing;
    
    sentenceLayouts[i] = {
      baseX: baseX,
      baseY: baseY,
      charPositions: []
    };
    
    let sentenceParticles = [];
    for (let j = 0; j < words.length; j++) {
      let homeX = baseX + j * 18;
      let homeY = baseY;
      
      sentenceLayouts[i].charPositions[j] = {
        x: homeX,
        y: homeY
      };
      
      sentenceParticles.push({
        char: words[j],
        x: homeX,
        y: homeY,
        homeX: homeX,
        homeY: homeY,
        size: 13,
        velocity: createVector(0, 0),
        damping: 0.9,
        sentenceIndex: i,
        charIndex: j,
        originalCharIndex: j,
        color: color(30, 30, 30, 240),
        isReturning: false,
        floatOffset: random(TWO_PI),
        targetX: homeX,
        targetY: homeY,
        originalOrder: j,
        floatStrength: 0
      });
    }
    textParticles = textParticles.concat(sentenceParticles);
  }
  
  initTextLines();
}

function initTextLines() {
  textLines = [];
  
  let linePositions = [];
  let sentenceGroups = {};
  
  for (let particle of textParticles) {
    if (!sentenceGroups[particle.sentenceIndex]) {
      sentenceGroups[particle.sentenceIndex] = [];
    }
    sentenceGroups[particle.sentenceIndex].push(particle);
  }
  
  for (let sentenceIndex in sentenceGroups) {
    let particles = sentenceGroups[sentenceIndex];
    if (particles.length > 0) {
      let minX = Infinity, maxX = -Infinity, sumY = 0;
      for (let particle of particles) {
        minX = min(minX, particle.homeX);
        maxX = max(maxX, particle.homeX + 1);
        sumY += particle.homeY;
      }
      let centerY = sumY / particles.length;
      linePositions.push({
        sentenceIndex: parseInt(sentenceIndex),
        minX: minX,
        maxX: maxX,
        centerY: centerY,
        particles: particles,
        originalOrder: parseInt(sentenceIndex)
      });
    }
  }
  
  linePositions.sort((a, b) => a.originalOrder - b.originalOrder);
  
  for (let i = 0; i < linePositions.length - 1; i++) {
    let line1 = linePositions[i];
    let line2 = linePositions[i + 1];
    
    let lineY = (line1.centerY + line2.centerY) / 2;
    
    let lineMinX = min(line1.minX, line2.minX);
    let lineMaxX = max(line1.maxX, line2.maxX);
    
    textLines.push({
      y: lineY,
      homeY: lineY,
      minX: lineMinX,
      maxX: lineMaxX,
      points: [],
      basePoints: [],
      velocity: 10,
      damping: 0.9,
      isReturning: false,
      lineIndex: i,
      color: color(0, 60, 30, 180),
      thickness: 0.2,
      noiseOffset: random(400),
      phase: random(TWO_PI),
      originalLineIndex: i,
      waveAmplitude: 1
    });
  }
  
  for (let line of textLines) {
    initLinePoints(line);
  }
}

function initLinePoints(line) {
  line.points = [];
  line.basePoints = [];
  let segmentCount = 100;
  
  for (let i = 0; i <= segmentCount; i++) {
    let t = i / segmentCount;
    let x = lerp(line.minX, line.maxX, t);
    let y = line.y;
    
    line.points.push({
      x: x,
      y: y,
      baseX: x,
      baseY: y,
      velocity: createVector(0, 0),
      damping: 1
    });
    
    line.basePoints.push({
      x: x,
      y: y
    });
  }
}

function draw() {
  background(255);
  
  if (clickRipple) {
    updateClickRipple();
    applyRippleToLines();
  }
  
  if (mouseDrag.active) {
    updateMouseDrag();
  }
  
  updateTextLines();
  
  drawTextLines();
  
  updateTextParticles();
  
  drawText();
  
  if (clickRipple) {
    drawRipple();
  }
  
  if (mouseDrag.active && mouseDrag.strength > 0.9) {
    drawMouseDrag();
  }
  
  drawCustomCursor();
}

function updateTextLines() {
  noiseOffset += 0.5;
  
  for (let line of textLines) {
    if (line.isReturning) {
      let dy = line.homeY - line.y;
      if (abs(dy) > 0.5) {
        line.velocity += dy * 0.3;
        line.y += line.velocity;
        line.velocity *= line.damping;
      } else {
        line.isReturning = false;
        line.velocity = 0;
      }
    }
    
    for (let i = 0; i < line.points.length; i++) {
      let point = line.points[i];
      let basePoint = line.basePoints[i];
      
      let waveY = sin(noiseOffset * 2 + i * 0.2 + line.phase) * line.waveAmplitude;
      
      point.baseY = line.y;
      
      let targetY = line.y + waveY;
      
      let dy = targetY - point.y;
      point.velocity.y += dy * 0.2;
      
      point.velocity.mult(point.damping);
      
      point.y += point.velocity.y;
      point.x = basePoint.x;
      
      point.velocity.limit(0.5);
    }
  }
}

function drawTextLines() {
  for (let line of textLines) {
    noFill();
    stroke(line.color);
    strokeWeight(line.thickness);
    
    beginShape();
    for (let i = 0; i < line.points.length; i++) {
      let point = line.points[i];
      curveVertex(point.x, point.y);
    }
    endShape();
    
    stroke(0, 80, 40, 100);
    strokeWeight(line.thickness * 2);
    
    beginShape();
    for (let i = 0; i < line.points.length; i++) {
      let point = line.points[i];
      curveVertex(point.x, point.y);
    }
    endShape();
  }
}

function applyRippleToLines() {
  if (!clickRipple) return;
  
  for (let line of textLines) {
    let lineCenterY = line.y;
    let lineCenterX = (line.minX + line.maxX) / 2;
    let d = dist(clickRipple.x, clickRipple.y, lineCenterX, lineCenterY);
    
    if (d < clickRipple.radius + 100) {
      let rippleStrength = clickRipple.strength * map(d, 0, clickRipple.radius + 100, 1, 0);
      
      let angle = atan2(lineCenterY - clickRipple.y, lineCenterX - clickRipple.x);
      let force = rippleStrength * 0.3;
      
      line.velocity += sin(angle) * force;
      line.isReturning = true;
      
      for (let point of line.points) {
        let pointD = dist(clickRipple.x, clickRipple.y, point.x, point.y);
        if (pointD < clickRipple.radius + 80) {
          let pointStrength = clickRipple.strength * map(abs(pointD - clickRipple.radius), 0, 80, 1, 0);
          let pointAngle = atan2(point.y - clickRipple.y, point.x - clickRipple.x);
          let pointForce = pointStrength * 0.2;
          
          point.velocity.y += sin(pointAngle) * pointForce;
        }
      }
    }
  }
}

function mousePressed() {
    if (!musicStarted) {
    bgMusic.play();
    musicStarted = true;
  }
  clickRipple = {
    x: mouseX,
    y: mouseY,
    radius: 0,
    maxRadius: min(width, height) * 0.3,
    strength: 1.0,
    time: 0,
    duration: 1.5,
    color1: color(0, 100, 50, 100),
    color2: color(20, 120, 70, 70),
    color3: color(40, 140, 90, 40),
    rings: [],
    fadeStartTime: 0.3
  };
  
  clickRipple.rings.push({
    radius: 0,
    alpha: 100,
    width: 1.2,
    speed: 1.0,
    creationTime: 0
  });
  
  clickTime = millis();
  
  let affectedSentences = new Set();
  
  for (let particle of textParticles) {
    let d = dist(mouseX, mouseY, particle.x, particle.y);
    if (d < 200) {
      affectedSentences.add(particle.sentenceIndex);
    }
  }
  
  for (let sentenceIndex of affectedSentences) {
    let sentenceParticles = textParticles.filter(p => p.sentenceIndex === sentenceIndex);
    
    if (sentenceParticles.length > 0) {
      let centerX = sentenceParticles.reduce((sum, p) => sum + p.x, 0) / sentenceParticles.length;
      let centerY = sentenceParticles.reduce((sum, p) => sum + p.y, 0) / sentenceParticles.length;
      
      let d = dist(mouseX, mouseY, centerX, centerY);
      if (d < 200) {
        for (let j = 0; j < sentenceParticles.length; j++) {
          let particle = sentenceParticles[j];
          
          let charAngle = atan2(particle.y - mouseY, particle.x - mouseX);
          let charForce = map(dist(mouseX, mouseY, particle.x, particle.y), 0, 200, 1.5, 0);
          
          particle.velocity.x += cos(charAngle) * charForce;
          particle.velocity.y += sin(charAngle) * charForce;
          particle.isReturning = false;
        }
      }
    }
  }
  
  for (let line of textLines) {
    let lineCenterY = line.y;
    let lineCenterX = (line.minX + line.maxX) / 2;
    let d = dist(mouseX, mouseY, lineCenterX, lineCenterY);
    
    if (d < 150) {
      let force = map(d, 0, 150, 1.0, 0);
      let angle = atan2(lineCenterY - mouseY, lineCenterX - mouseX);
      
      line.velocity += sin(angle) * force;
      line.isReturning = true;
    }
  }
}

function mouseDragged() {
  if (!mouseDrag.active) {
    mouseDrag.active = true;
    mouseDrag.startX = mouseX;
    mouseDrag.startY = mouseY;
    mouseDrag.strength = 0;
  }
  
  mouseDrag.currentX = mouseX;
  mouseDrag.currentY = mouseY;
  
  let dragDist = dist(mouseDrag.startX, mouseDrag.startY, mouseX, mouseY);
  mouseDrag.strength = min(dragDist / 80, 1.0);
}

function mouseReleased() {
  if (mouseDrag.active) {
    mouseDrag.active = false;
    
    if (mouseDrag.strength > 0.6) {
      gatherTextParticles();
      gatherTextLines();
    }
    
    mouseDrag.strength = 0;
  }
}

function updateMouseDrag() {
  if (!mouseIsPressed) {
    mouseDrag.strength *= 0.9;
    if (mouseDrag.strength < 0.05) {
      mouseDrag.active = false;
    }
  }
}

function gatherTextParticles() {
  let sentenceGroups = {};
  
  for (let particle of textParticles) {
    if (!sentenceGroups[particle.sentenceIndex]) {
      sentenceGroups[particle.sentenceIndex] = [];
    }
    sentenceGroups[particle.sentenceIndex].push(particle);
  }
  
  let sentenceIndices = Object.keys(sentenceGroups).map(Number).sort((a, b) => a - b);
  
  for (let sentenceIndex of sentenceIndices) {
    let particles = sentenceGroups[sentenceIndex];
    
    particles.sort((a, b) => a.x - b.x);
    
    let layout = sentenceLayouts[sentenceIndex];
    
    for (let i = 0; i < particles.length; i++) {
      let particle = particles[i];
      
      let targetIndex = min(i, layout.charPositions.length - 1);
      
      particle.targetX = layout.charPositions[targetIndex].x;
      particle.targetY = layout.charPositions[targetIndex].y;
      particle.isReturning = true;
    }
  }
}

function gatherTextLines() {
  for (let line of textLines) {
    line.isReturning = true;
  }
}

function updateClickRipple() {
  clickRipple.time += 0.015;
  
  clickRipple.radius = easeOutQuart(min(clickRipple.time, 0.8)) * clickRipple.maxRadius;
  
  if (clickRipple.time < clickRipple.fadeStartTime) {
    clickRipple.strength = 1.0;
  } else {
    let fadeProgress = (clickRipple.time - clickRipple.fadeStartTime) / 
                      (clickRipple.duration - clickRipple.fadeStartTime);
    clickRipple.strength = 1.0 - easeInQuad(min(fadeProgress, 1.0));
  }
  
  for (let i = clickRipple.rings.length - 1; i >= 0; i--) {
    let ring = clickRipple.rings[i];
    
    ring.radius += ring.speed * 1.5;
    
    ring.alpha = clickRipple.strength * 80;
    
    if (ring.alpha < 3 || ring.radius > clickRipple.maxRadius * 1.2) {
      clickRipple.rings.splice(i, 1);
    }
  }
  
  if (clickRipple.time < clickRipple.duration * 0.6 && frameCount % 20 === 0) {
    clickRipple.rings.push({
      radius: clickRipple.radius * random(0.8, 1.2),
      alpha: clickRipple.strength * 70,
      width: random(0.8, 1.2),
      speed: random(0.6, 0.9),
      creationTime: clickRipple.time
    });
  }
  
  if (clickRipple.time > clickRipple.duration) {
    clickRipple = null;
  }
}

function updateTextParticles() {
  let sentenceGroups = {};
  
  for (let particle of textParticles) {
    if (!sentenceGroups[particle.sentenceIndex]) {
      sentenceGroups[particle.sentenceIndex] = [];
    }
    sentenceGroups[particle.sentenceIndex].push(particle);
  }
  
  let sentenceIndices = Object.keys(sentenceGroups).map(Number).sort((a, b) => a - b);
  
  for (let sentenceIndex of sentenceIndices) {
    let particles = sentenceGroups[sentenceIndex];
    
    let avgDx = 0, avgDy = 0;
    for (let particle of particles) {
      avgDx += particle.homeX - particle.x;
      avgDy += particle.homeY - particle.y;
    }
    avgDx /= particles.length;
    avgDy /= particles.length;
    
    for (let j = 0; j < particles.length; j++) {
      let particle = particles[j];
      
      let floatOffset = sin(frameCount * 0.01 + particle.floatOffset) * particle.floatStrength;
      particle.x += particle.velocity.x + floatOffset;
      particle.y += particle.velocity.y + floatOffset * 0.3;
      
      particle.velocity.mult(particle.damping);
      
      if (particle.isReturning) {
        let dx = particle.targetX - particle.x;
        let dy = particle.targetY - particle.y;
        let distToTarget = sqrt(dx * dx + dy * dy);
        
        if (distToTarget > 0.5) {
          let force = 0.2 + min(distToTarget / 80, 1);
          particle.velocity.x += (dx / distToTarget) * force;
          particle.velocity.y += (dy / distToTarget) * force;
          
          if (distToTarget < 3) {
            particle.homeX = particle.targetX;
            particle.homeY = particle.targetY;
          }
        } else {
          particle.isReturning = false;
          particle.x = particle.targetX;
          particle.y = particle.targetY;
          particle.homeX = particle.targetX;
          particle.homeY = particle.targetY;
        }
      } else {
        particle.velocity.x += avgDx * 0.02;
        particle.velocity.y += avgDy * 0.02;
      }
      
      if (clickRipple) {
        let d = dist(clickRipple.x, clickRipple.y, particle.x, particle.y);
        if (d < clickRipple.radius + 80 && d > clickRipple.radius - 80) {
          let rippleStrength = clickRipple.strength * map(abs(d - clickRipple.radius), 0, 80, 1, 0);
          let angle = atan2(particle.y - clickRipple.y, particle.x - clickRipple.x);
          let force = rippleStrength * 0.2;
          
          particle.velocity.x += cos(angle) * force;
          particle.velocity.y += sin(angle) * force;
        }
      }
      
      particle.velocity.limit(1.0);
    }
  }
}

function drawText() {
  textSize(15);
  textAlign(LEFT, CENTER);
  
  let fontNames = [
    'SimSun', '宋体', 'NSimSun', 'FangSong', 'STFangsong',
    'Microsoft YaHei', 'serif'
  ];
  
  for (let fontName of fontNames) {
    try {
      textFont(fontName);
      break;
    } catch(e) {
      continue;
    }
  }
  
  let sentenceGroups = {};
  for (let particle of textParticles) {
    if (!sentenceGroups[particle.sentenceIndex]) {
      sentenceGroups[particle.sentenceIndex] = [];
    }
    sentenceGroups[particle.sentenceIndex].push(particle);
  }
  
  let sentenceIndices = Object.keys(sentenceGroups).map(Number).sort((a, b) => a - b);
  
  for (let sentenceIndex of sentenceIndices) {
    let particles = sentenceGroups[sentenceIndex];
    
    particles.sort((a, b) => a.charIndex - b.charIndex);
    
    for (let particle of particles) {
      let alpha = 240;
      if (clickRipple) {
        let d = dist(clickRipple.x, clickRipple.y, particle.x, particle.y);
        if (d < clickRipple.radius + 80 && d > clickRipple.radius - 80) {
          alpha = map(abs(d - clickRipple.radius), 0, 80, 150, 240);
        }
      }
      
      if (particle.isReturning) {
        fill(40, 40, 40, alpha);
        drawingContext.shadowBlur = 3;
        drawingContext.shadowColor = 'rgba(0, 100, 50, 0.2)';
      } else {
        fill(30, 30, 30, alpha);
        drawingContext.shadowBlur = 0;
      }
      
      noStroke();
      text(particle.char, particle.x, particle.y);
      
      drawingContext.shadowBlur = 0;
    }
  }
}

function drawRipple() {
  noFill();
  
  let overallAlpha = clickRipple.strength;
  
  stroke(
    clickRipple.color1.levels[0],
    clickRipple.color1.levels[1],
    clickRipple.color1.levels[2],
    clickRipple.color1.levels[3] * overallAlpha
  );
  strokeWeight(1.2);
  ellipse(clickRipple.x, clickRipple.y, clickRipple.radius * 2);
  
  for (let ring of clickRipple.rings) {
    let ringAlpha = ring.alpha * overallAlpha;
    
    stroke(0, 100, 50, ringAlpha * 0.6);
    strokeWeight(ring.width * 0.6);
    ellipse(clickRipple.x, clickRipple.y, ring.radius * 2);
    
    stroke(20, 120, 70, ringAlpha * 0.2);
    strokeWeight(ring.width * 0.3);
    ellipse(clickRipple.x, clickRipple.y, ring.radius * 2.1);
  }
  
  stroke(
    clickRipple.color2.levels[0],
    clickRipple.color2.levels[1],
    clickRipple.color2.levels[2],
    clickRipple.color2.levels[3] * overallAlpha
  );
  strokeWeight(0.6);
  ellipse(clickRipple.x, clickRipple.y, clickRipple.radius * 1.6);
  
  stroke(
    clickRipple.color3.levels[0],
    clickRipple.color3.levels[1],
    clickRipple.color3.levels[2],
    clickRipple.color3.levels[3] * overallAlpha * 0.5
  );
  strokeWeight(0.4);
  ellipse(clickRipple.x, clickRipple.y, clickRipple.radius * 2.1);
  
  if (clickRipple.strength > 0.3) {
    fill(0, 100, 50, overallAlpha * 60);
    noStroke();
    ellipse(clickRipple.x, clickRipple.y, 6);
  }
}

function drawMouseDrag() {
  noFill();
  stroke(0, 100, 50, mouseDrag.strength * 60);
  strokeWeight(0.8);
  
  line(mouseDrag.startX, mouseDrag.startY, mouseDrag.currentX, mouseDrag.currentY);
  
  fill(0, 100, 50, mouseDrag.strength * 40);
  noStroke();
  ellipse(mouseDrag.startX, mouseDrag.startY, 6);
  
  fill(20, 120, 70, mouseDrag.strength * 60);
  ellipse(mouseDrag.currentX, mouseDrag.currentY, 8);
  
  if (mouseDrag.strength > 0.6) {
    fill(0, 100, 50, mouseDrag.strength * 80);
    textAlign(CENTER, CENTER);
    textSize(12);
    text("命运，使得我们再会。", mouseDrag.currentX, mouseDrag.currentY - 15);
  }
}

function drawCustomCursor() {
  push();
  
  translate(mouseX, mouseY);
  
  let starSize = 10;
  let starColor;
  
  if (mouseIsPressed) {
    starSize = 12;
    starColor = color(255, 200, 50, 200);
  } else if (mouseDrag.active) {
    starSize = 11;
    starColor = color(100, 200, 255, 180);
  } else {
    starColor = color(100, 180, 255, 150);
  }
  
  rotate(frameCount * 0.15);
  
  noStroke();
  fill(starColor);
  
  beginShape();
  for (let i = 0; i < 8; i++) {
    let angle = (TWO_PI / 8) * i;
    let radius = (i % 2 === 0) ? starSize : starSize * 0.5;
    let x = cos(angle) * radius;
    let y = sin(angle) * radius;
    vertex(x, y);
  }
  endShape(CLOSE);
  
  fill(255, 255, 200, 80);
  ellipse(0, 0, starSize * 0.5);
  
  if (mouseIsPressed) {
    fill(255, 200, 50, 20);
    ellipse(0, 0, starSize * 2.0);
  }
  
  pop();
}

function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

function easeInQuad(t) {
  return t * t;
}

function windowResized() {
  let canvasWidth = windowWidth * 0.8;
  let canvasHeight = windowHeight * 1.2;
  resizeCanvas(canvasWidth, canvasHeight);
  initTextLines();
}