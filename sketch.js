let bgImage;
let treeImage, tree2Image;
let house1, house2, house3;
let housebroke, housebroke2, housebroke3;
let peopleImage, people2Image, people3Image;
let clouds = [];
let time = 0;

// 사운드 변수
let scene1Sound;
let scene3Sound;
let scene3_1Sound;
let scene4Sound;
let soundsLoaded = false;
let scene3SoundsLoaded = false;
let scene4SoundLoaded = false;

// 모바일 및 터치 관련 변수
let isMobile = false;
let touchX = 0;
let touchY = 0;

// 나무 호버 관련 변수
let treeHovered = false;
let treeX, treeY, treeWidth, treeHeight;

// 사람들 호버 관련 변수
let peopleHovered = false;
let peopleX, peopleY, peopleWidth, peopleHeight;

// 집들 호버 관련 변수
let house1Hovered = false;
let house2Hovered = false;
let house3Hovered = false;

// 돌풍 효과 관련 변수
let windParticles = [];
let prevMouseX = 0;
let prevMouseY = 0;

// 장면 전환 관련 변수
let currentScene = 1; // 1: 첫 번째 장면, 2: 두 번째 장면, 3: 세 번째 장면, 4: 네 번째 장면
let totalScenes = 4;

// Scene 3 태풍 효과 관련 변수들
let typhoonStartTime = 0;
let typhoonDuration = 8000; // 8초 동안 진행
let flyingElements = [];

// Scene 4 폭발 효과 관련 변수들
let explosionStartTime = 0;
let explosionDuration = 6000; // 6초 동안 진행

// 쉐이더 관련 변수
let theShader;
let WebGL;
let Canvas;
let sceneImage;

// 세 번째 장면 효과 변수
let inc = 40;
let distance = 100;
let f = 0.5;
let displacers = [];
let rotation = 0.5;

function preload() {
  bgImage = loadImage('bg.svg');
  treeImage = loadImage('tree.svg');
  tree2Image = loadImage('tree2.svg');
  house1 = loadImage('house1.svg');
  house2 = loadImage('house2.svg');
  house3 = loadImage('house3.svg');
  housebroke = loadImage('housebroke.svg');
  housebroke2 = loadImage('housebroke2.svg');
  housebroke3 = loadImage('housebroke3.svg');
  peopleImage = loadImage('people.svg');
  people2Image = loadImage('people2.svg');
  people3Image = loadImage('people3.svg');
  
  // 사운드 로딩 (에러 처리 포함)
  scene1Sound = loadSound('scene1.mp3', 
    function() {
      console.log('scene1.mp3 로딩 완료');
      soundsLoaded = true;
    },
    function() {
      console.log('scene1.mp3 로딩 실패 - 파일이 있는지 확인하세요');
    }
  );
  
  // Scene 3 사운드들 로딩
  let scene3LoadCount = 0;
  
  scene3Sound = loadSound('scene3.mp3', 
    function() {
      console.log('scene3.mp3 로딩 완료');
      scene3LoadCount++;
      if (scene3LoadCount === 2) scene3SoundsLoaded = true;
    },
    function() {
      console.log('scene3.mp3 로딩 실패 - 파일이 있는지 확인하세요');
    }
  );
  
  scene3_1Sound = loadSound('scene3.1.mp3', 
    function() {
      console.log('scene3.1.mp3 로딩 완료');
      scene3LoadCount++;
      if (scene3LoadCount === 2) scene3SoundsLoaded = true;
    },
    function() {
      console.log('scene3.1.mp3 로딩 실패 - 파일이 있는지 확인하세요');
    }
  );
  
  // Scene 4 사운드 로딩
  scene4Sound = loadSound('scene4.mp3', 
    function() {
      console.log('scene4.mp3 로딩 완료');
      scene4SoundLoaded = true;
    },
    function() {
      console.log('scene4.mp3 로딩 실패 - 파일이 있는지 확인하세요');
    }
  );
}

function setup() {
  // 모바일 디바이스 감지
  isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // 캔버스 크기 설정 (모바일에서는 픽셀 밀도 고려)
  createCanvas(windowWidth, windowHeight);
  
  // 모바일에서는 픽셀 밀도를 낮춰 성능 향상
  if (isMobile) {
    pixelDensity(1);
  } else {
    pixelDensity(1);
  }
  
  // 쉐이더 초기화
  WebGL = createGraphics(width, height, WEBGL);
  Canvas = createGraphics(width, height);
  theShader = new p5.Shader(WebGL._renderer, vert, frag);
  
  // 세 번째 장면을 위한 displacers 초기화
  for (let i = 0; i < 4; i++) {
    displacers[i] = createVector(0, 0);
  }
  
  // 반응형 레이아웃 초기화
  setupResponsiveLayout();
  
  // 나무 위치와 크기 설정 (반응형)
  updateTreeLayout();
  
  // 사람들 위치와 크기 설정 (반응형)
  updatePeopleLayout();
  peopleY = height * 0.6;
  peopleWidth = 1600;
  peopleHeight = 1100;
  
  // 구름 생성
  for (let i = 0; i < 5; i++) {
    clouds.push({
      x: random(width),
      y: random(height * 0.3), // 화면 위쪽 30% 영역에만
      size: random(80, 150),
      speed: random(0.3, 0.8),
      opacity: random(150, 255)
    });
  }
  
  // 첫 번째 장면 사운드 자동 재생 (사용자 인터랙션 후에 재생됨)
  // 브라우저 정책상 사용자 클릭 후에 재생 가능
}

// 첫 클릭 시 사운드 활성화
function mouseClicked() {
  // 오디오 컨텍스트 활성화
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
  
  if (currentScene === 1 && scene1Sound && soundsLoaded && !scene1Sound.isPlaying()) {
    console.log('mouseClicked에서 사운드 재생 시도');
    scene1Sound.setVolume(0.5);
    scene1Sound.loop();
  }
}

function draw() {
  time += 0.01;
  
  // 현재 장면에 따라 다른 그리기 함수 호출
  if (currentScene === 1) {
    drawScene1();
    
    // 돌풍 효과는 첫 번째 장면에서만
    updateWindEffect();
    drawWindEffect();
  } else if (currentScene === 2) {
    drawScene2();
  } else if (currentScene === 3) {
    drawScene3();
  } else if (currentScene === 4) {
    drawScene4();
  }
}

function drawScene1() {
  // 마우스 호버 감지
  checkTreeHover();
  checkPeopleHover();
  checkHousesHover();
  
  // 하늘색 배경 그리기
  drawSky();
  
  // 구름 그리기
  drawClouds();
  
  // 원본 배경 이미지 그리기
  if (bgImage) {
    image(bgImage, 0, 0, width, height);
  }
  
  // 나무 그리기 (호버 상태에 따라)
  drawTree();
  
  // 집들 그리기
  drawHouses();
  
  // 사람들 그리기
  drawPeople();
  
  // 모닥불 그리기
  drawCampfire();
}

function drawScene2() {
  // 먼저 장면을 Canvas에 그리기
  Canvas.clear();
  Canvas.imageMode(CENTER);
  
  // 반응형 스케일 팩터
  const houseScaleFactor = window.houseScaleFactor || window.globalScaleFactor || 1;
  
  // 하늘색 배경 그리기 (똑같은 하늘)
  Canvas.push();
  for (let y = 0; y < height * 0.5; y++) {
    let alpha = map(y, 0, height * 0.5, 255, 0);
    let skyBlue = lerpColor(color(135, 206, 250), color(255, 255, 255, 0), y / (height * 0.5));
    Canvas.stroke(red(skyBlue), green(skyBlue), blue(skyBlue), alpha);
    Canvas.line(0, y, width, y);
  }
  Canvas.pop();
  
  // 원본 배경 이미지 그리기 (똑같은 bg)
  if (bgImage) {
    Canvas.image(bgImage, width/2, height/2, width, height);
  }
  
  // 나무 그리기 (똑같은 위치와 크기, 호버 없음)
  if (treeImage) {
    Canvas.image(treeImage, treeX, treeY, treeWidth, treeHeight);
  }
  
  // 집들 그리기 (반응형 크기 적용)
  if (house1) {
    Canvas.image(house1, width * 0.11, height * 0.7, 1800 * houseScaleFactor, 1200 * houseScaleFactor);
  }
  
  if (house2) {
    Canvas.image(house2, width * 0.289, height * 0.45, 1800 * houseScaleFactor, 1200 * houseScaleFactor);
  }
  
  if (house3) {
    Canvas.image(house3, width * 0.89, height * 0.7, 1800 * houseScaleFactor, 1000 * houseScaleFactor);
  }
  
  // 사람들 그리기 (똑같은 위치와 크기, 호버 없음)
  if (peopleImage) {
    Canvas.image(peopleImage, peopleX, peopleY, peopleWidth, peopleHeight);
  }
  
  // 쉐이더 적용
  if (theShader && WebGL && Canvas) {
    WebGL.shader(theShader);
    
    theShader.setUniform('iResolution', [width, height]);
    theShader.setUniform('iPixelDensity', pixelDensity());
    theShader.setUniform('iCanvas', Canvas);
    theShader.setUniform('iImage', Canvas);
    theShader.setUniform('iImageResolution', [Canvas.width, Canvas.height]);
    theShader.setUniform('iMouse', [mouseX, mouseY]);
    theShader.setUniform('iTime', frameCount);

    WebGL.rect(0, 0, width, height);
    
    image(WebGL, 0, 0);
  } else {
    // 쉐이더가 준비되지 않았으면 일반 이미지로 그리기
    image(Canvas, 0, 0);
  }
}

function drawScene3() {
  // 하늘색 배경 그리기
  drawSky();
  
  // 원본 배경 이미지 그리기 (항상 남아있음)
  if (bgImage) {
    image(bgImage, 0, 0, width, height);
  }
  
  // 태풍 효과 진행 계산
  let currentTime = millis();
  let typhoonProgress = (currentTime - typhoonStartTime) / typhoonDuration;
  typhoonProgress = constrain(typhoonProgress, 0, 1);
  
  // 태풍 바람 파티클 효과
  drawTyphoonWind(typhoonProgress);
  
  // 나무 날아가는 효과
  if (treeImage && typhoonProgress < 1) {
    push();
    imageMode(CENTER);
    
    // 태풍으로 인한 이동과 회전
    let treeOffsetX = typhoonProgress * typhoonProgress * 1500 + sin(currentTime * 0.02) * typhoonProgress * 200;
    let treeOffsetY = -typhoonProgress * typhoonProgress * 800 + cos(currentTime * 0.03) * typhoonProgress * 150;
    let treeRotation = typhoonProgress * 720 + sin(currentTime * 0.05) * typhoonProgress * 180;
    
    // 투명도 변화
    let treeAlpha = 255 * (1 - typhoonProgress * 0.8);
    tint(255, treeAlpha);
    
    translate(treeX + treeOffsetX, treeY + treeOffsetY);
    rotate(radians(treeRotation));
    
    image(treeImage, 0, 0, treeWidth, treeHeight);
    noTint();
    pop();
  }
  
  // 집들 날아가는 효과 (반응형)
  const houseScaleFactor = window.houseScaleFactor || window.globalScaleFactor || 1;
  
  push();
  imageMode(CENTER);
  
  if (house1 && typhoonProgress < 1) {
    push();
    let house1OffsetX = typhoonProgress * typhoonProgress * 1200 + sin(currentTime * 0.025 + 1) * typhoonProgress * 180;
    let house1OffsetY = -typhoonProgress * typhoonProgress * 600 + cos(currentTime * 0.035 + 1) * typhoonProgress * 120;
    let house1Rotation = typhoonProgress * 540 + sin(currentTime * 0.04 + 1) * typhoonProgress * 150;
    
    let house1Alpha = 255 * (1 - typhoonProgress * 0.7);
    tint(255, house1Alpha);
    
    translate(width * 0.11 + house1OffsetX, height * 0.7 + house1OffsetY);
    rotate(radians(house1Rotation));
    
    image(house1, 0, 0, 1800 * houseScaleFactor, 1200 * houseScaleFactor);
    noTint();
    pop();
  }
  
  if (house2 && typhoonProgress < 1) {
    push();
    let house2OffsetX = typhoonProgress * typhoonProgress * 1400 + sin(currentTime * 0.03 + 2) * typhoonProgress * 220;
    let house2OffsetY = -typhoonProgress * typhoonProgress * 700 + cos(currentTime * 0.04 + 2) * typhoonProgress * 140;
    let house2Rotation = typhoonProgress * 600 + sin(currentTime * 0.045 + 2) * typhoonProgress * 160;
    
    let house2Alpha = 255 * (1 - typhoonProgress * 0.75);
    tint(255, house2Alpha);
    
    translate(width * 0.289 + house2OffsetX, height * 0.45 + house2OffsetY);
    rotate(radians(house2Rotation));
    
    image(house2, 0, 0, 1800 * houseScaleFactor, 1200 * houseScaleFactor);
    noTint();
    pop();
  }
  
  if (house3 && typhoonProgress < 1) {
    push();
    let house3OffsetX = typhoonProgress * typhoonProgress * 1600 + sin(currentTime * 0.028 + 3) * typhoonProgress * 200;
    let house3OffsetY = -typhoonProgress * typhoonProgress * 750 + cos(currentTime * 0.038 + 3) * typhoonProgress * 130;
    let house3Rotation = typhoonProgress * 660 + sin(currentTime * 0.042 + 3) * typhoonProgress * 170;
    
    let house3Alpha = 255 * (1 - typhoonProgress * 0.8);
    tint(255, house3Alpha);
    
    translate(width * 0.89 + house3OffsetX, height * 0.7 + house3OffsetY);
    rotate(radians(house3Rotation));
    
    image(house3, 0, 0, 1800 * houseScaleFactor, 1000 * houseScaleFactor);
    noTint();
    pop();
  }
  
  pop();
  
  // 사람들 날아가는 효과
  if (peopleImage && typhoonProgress < 1) {
    push();
    imageMode(CENTER);
    
    let peopleOffsetX = typhoonProgress * typhoonProgress * 1300 + sin(currentTime * 0.035 + 4) * typhoonProgress * 190;
    let peopleOffsetY = -typhoonProgress * typhoonProgress * 650 + cos(currentTime * 0.045 + 4) * typhoonProgress * 160;
    let peopleRotation = typhoonProgress * 480 + sin(currentTime * 0.055 + 4) * typhoonProgress * 140;
    
    let peopleAlpha = 255 * (1 - typhoonProgress * 0.85);
    tint(255, peopleAlpha);
    
    translate(peopleX + peopleOffsetX, peopleY + peopleOffsetY);
    rotate(radians(peopleRotation));
    
    image(peopleImage, 0, 0, peopleWidth, peopleHeight);
    noTint();
    pop();
  }
}

function drawTyphoonWind(progress) {
  // 태풍 바람 시각 효과
  stroke(255, 255, 255, 100 * progress);
  strokeWeight(2);
  
  for (let i = 0; i < 200 * progress; i++) {
    let x = random(width);
    let y = random(height);
    
    let windSpeed = progress * 15;
    let windAngle = atan2(height * 0.3 - y, width * 0.8 - x) + sin(millis() * 0.01 + i) * 0.5;
    
    let endX = x + cos(windAngle) * windSpeed;
    let endY = y + sin(windAngle) * windSpeed;
    
    line(x, y, endX, endY);
  }
  
  // 회오리바람 중심
  push();
  translate(width * 0.8, height * 0.3);
  rotate(millis() * 0.02 * progress);
  
  stroke(200, 200, 255, 150 * progress);
  strokeWeight(3);
  noFill();
  
  for (let r = 10; r < 300 * progress; r += 20) {
    let spiralPoints = int(r * 0.1);
    beginShape();
    for (let i = 0; i < spiralPoints; i++) {
      let angle = (i / spiralPoints) * TWO_PI * 3;
      let spiralR = r * (1 - i / spiralPoints * 0.3);
      let x = cos(angle) * spiralR;
      let y = sin(angle) * spiralR;
      vertex(x, y);
    }
    endShape();
  }
  
  pop();
}

function drawScene4() {
  // 검은색 배경
  background(0);
  
  // 반응형 스케일 팩터
  const scaleFactor = window.globalScaleFactor || 1;
  const houseScaleFactor = window.houseScaleFactor || scaleFactor;
  
  // 폭발 효과 진행 계산
  let currentTime = millis();
  let explosionProgress = (currentTime - explosionStartTime) / explosionDuration;
  explosionProgress = constrain(explosionProgress, 0, 1);
  
  // 중앙점
  let centerX = width / 2;
  let centerY = height / 2;
  
  // 폭발 파티클 효과
  drawExplosionParticles(explosionProgress, centerX, centerY);
  
  // 나무 중앙에서 폭발하여 나오기
  if (treeImage) {
    push();
    imageMode(CENTER);
    
    // 폭발 방향 (왼쪽 위쪽으로)
    let treeTargetX = treeX;
    let treeTargetY = treeY;
    let treeExplosionX = lerp(centerX, treeTargetX, explosionProgress);
    let treeExplosionY = lerp(centerY, treeTargetY, explosionProgress);
    
    // 회전 효과
    let treeRotation = explosionProgress * 360 * 2;
    
    // 크기 변화 (작게 시작해서 원래 크기로)
    let treeScale = 0.2 + explosionProgress * 0.8;
    
    // 투명도 효과
    let treeAlpha = 100 + explosionProgress * 155;
    tint(255, treeAlpha);
    
    translate(treeExplosionX, treeExplosionY);
    rotate(radians(treeRotation));
    scale(treeScale);
    
    image(treeImage, 0, 0, treeWidth, treeHeight);
    noTint();
    pop();
  }
  
  // 집1 중앙에서 폭발하여 나오기
  if (house1) {
    push();
    imageMode(CENTER);
    
    let house1TargetX = width * 0.11;
    let house1TargetY = height * 0.7;
    let house1ExplosionX = lerp(centerX, house1TargetX, explosionProgress);
    let house1ExplosionY = lerp(centerY, house1TargetY, explosionProgress);
    
    let house1Rotation = explosionProgress * 270;
    let house1Scale = 0.1 + explosionProgress * 0.9;
    let house1Alpha = 80 + explosionProgress * 175;
    
    tint(255, house1Alpha);
    translate(house1ExplosionX, house1ExplosionY);
    rotate(radians(house1Rotation));
    scale(house1Scale);
    
    image(house1, 0, 0, 1800 * houseScaleFactor, 1200 * houseScaleFactor);
    noTint();
    pop();
  }
  
  // 집2 중앙에서 폭발하여 나오기
  if (house2) {
    push();
    imageMode(CENTER);
    
    let house2TargetX = width * 0.289;
    let house2TargetY = height * 0.45;
    let house2ExplosionX = lerp(centerX, house2TargetX, explosionProgress);
    let house2ExplosionY = lerp(centerY, house2TargetY, explosionProgress);
    
    let house2Rotation = explosionProgress * 450;
    let house2Scale = 0.15 + explosionProgress * 0.85;
    let house2Alpha = 90 + explosionProgress * 165;
    
    tint(255, house2Alpha);
    translate(house2ExplosionX, house2ExplosionY);
    rotate(radians(house2Rotation));
    scale(house2Scale);
    
    image(house2, 0, 0, 1800 * houseScaleFactor, 1200 * houseScaleFactor);
    noTint();
    pop();
  }
  
  // 집3 중앙에서 폭발하여 나오기
  if (house3) {
    push();
    imageMode(CENTER);
    
    let house3TargetX = width * 0.89;
    let house3TargetY = height * 0.7;
    let house3ExplosionX = lerp(centerX, house3TargetX, explosionProgress);
    let house3ExplosionY = lerp(centerY, house3TargetY, explosionProgress);
    
    let house3Rotation = explosionProgress * 320;
    let house3Scale = 0.12 + explosionProgress * 0.88;
    let house3Alpha = 85 + explosionProgress * 170;
    
    tint(255, house3Alpha);
    translate(house3ExplosionX, house3ExplosionY);
    rotate(radians(house3Rotation));
    scale(house3Scale);
    
    image(house3, 0, 0, 1800 * houseScaleFactor, 1000 * houseScaleFactor);
    noTint();
    pop();
  }
  
  // 사람들 중앙에서 폭발하여 나오기
  if (peopleImage) {
    push();
    imageMode(CENTER);
    
    let peopleExplosionX = lerp(centerX, peopleX, explosionProgress);
    let peopleExplosionY = lerp(centerY, peopleY, explosionProgress);
    
    let peopleRotation = explosionProgress * 540;
    let peopleScale = 0.2 + explosionProgress * 0.8;
    let peopleAlpha = 95 + explosionProgress * 160;
    
    tint(255, peopleAlpha);
    translate(peopleExplosionX, peopleExplosionY);
    rotate(radians(peopleRotation));
    scale(peopleScale);
    
    image(peopleImage, 0, 0, peopleWidth, peopleHeight);
    noTint();
    pop();
  }
}

function drawExplosionParticles(progress, centerX, centerY) {
  // 중앙에서 폭발하는 파티클 효과
  stroke(255, 200, 100, 200 * (1 - progress * 0.5));
  strokeWeight(2);
  
  for (let i = 0; i < 100; i++) {
    let angle = (i / 100) * TWO_PI;
    let distance = progress * 400 + sin(millis() * 0.02 + i) * 50;
    
    let x = centerX + cos(angle) * distance;
    let y = centerY + sin(angle) * distance;
    
    let endX = x + cos(angle) * 20;
    let endY = y + sin(angle) * 20;
    
    line(x, y, endX, endY);
  }
  
  // 중심 폭발 플래시
  if (progress < 0.3) {
    let flashIntensity = (0.3 - progress) / 0.3;
    fill(255, 255, 255, flashIntensity * 150);
    noStroke();
    ellipse(centerX, centerY, flashIntensity * 200, flashIntensity * 200);
  }
  
  // 방사형 충격파
  stroke(255, 150, 50, 100 * (1 - progress));
  strokeWeight(3);
  noFill();
  
  for (let i = 0; i < 5; i++) {
    let waveRadius = progress * (300 + i * 100);
    ellipse(centerX, centerY, waveRadius, waveRadius);
  }
}

function drawSky() {
  // 하늘색 그라데이션 배경
  for (let y = 0; y < height * 0.5; y++) {
    let alpha = map(y, 0, height * 0.5, 255, 0);
    let skyBlue = lerpColor(color(135, 206, 250), color(255, 255, 255, 0), y / (height * 0.5));
    stroke(red(skyBlue), green(skyBlue), blue(skyBlue), alpha);
    line(0, y, width, y);
  }
}

function drawClouds() {
  noStroke();
  
  for (let cloud of clouds) {
    // 구름 이동
    cloud.x += cloud.speed;
    if (cloud.x > width + cloud.size) {
      cloud.x = -cloud.size;
    }
    
    // 구름 그리기 (여러 개의 원으로)
    fill(255, 255, 255, cloud.opacity * 0.8);
    
    // 메인 구름 몸체
    ellipse(cloud.x, cloud.y, cloud.size, cloud.size * 0.6);
    ellipse(cloud.x - cloud.size * 0.3, cloud.y, cloud.size * 0.8, cloud.size * 0.5);
    ellipse(cloud.x + cloud.size * 0.3, cloud.y, cloud.size * 0.8, cloud.size * 0.5);
    ellipse(cloud.x - cloud.size * 0.15, cloud.y - cloud.size * 0.2, cloud.size * 0.6, cloud.size * 0.4);
    ellipse(cloud.x + cloud.size * 0.15, cloud.y - cloud.size * 0.2, cloud.size * 0.6, cloud.size * 0.4);
  }
}

function drawHouses() {
  const houseScaleFactor = window.houseScaleFactor || window.globalScaleFactor || 1;
  
  push();
  imageMode(CENTER);
  
  // 반응형 집 크기 (모바일에서 더 작게)
  const house1Width = 1800 * houseScaleFactor;
  const house1Height = 1200 * houseScaleFactor;
  const house2Width = 1800 * houseScaleFactor;
  const house2Height = 1200 * houseScaleFactor;
  const house3Width = 1800 * houseScaleFactor;
  const house3Height = 1000 * houseScaleFactor;
  
  // House1 - 왼쪽 (컴포지션 유지)
  const house1X = width * 0.11;
  const house1Y = height * 0.7;
  if (house1Hovered && housebroke) {
    image(housebroke, house1X, house1Y, house1Width, house1Height);
  } else if (house1) {
    image(house1, house1X, house1Y, house1Width, house1Height);
  }
  
  // House2 - 중앙 (컴포지션 유지)
  const house2X = width * 0.289;
  const house2Y = height * 0.45;
  if (house2Hovered && housebroke2) {
    image(housebroke2, house2X, house2Y, house2Width, house2Height);
  } else if (house2) {
    image(house2, house2X, house2Y, house2Width, house2Height);
  }
  
  // House3 - 오른쪽 (컴포지션 유지)
  const house3X = width * 0.89;
  const house3Y = height * 0.7;
  if (house3Hovered && housebroke3) {
    image(housebroke3, house3X, house3Y, house3Width, house3Height);
  } else if (house3) {
    image(house3, house3X, house3Y, house3Width, house3Height);
  }
  
  pop();
}

function drawPeople() {
  let currentPeopleImage;
  
  // 호버 상태일 때는 people3 사용
  if (peopleHovered) {
    currentPeopleImage = people3Image;
  } else {
    // 호버가 아닐 때는 18초마다 people과 people2 사이에서 변환
    let switchInterval = 18.0;
    currentPeopleImage = (Math.floor(time / (switchInterval * 0.01)) % 2 === 0) ? peopleImage : people2Image;
  }
  
  if (currentPeopleImage) {
    push();
    imageMode(CENTER);
    
    // 정적 위치에 사람들 그리기
    image(currentPeopleImage, peopleX, peopleY, peopleWidth, peopleHeight);
    
    pop();
  }
}

function drawCampfire() {
  push();
  translate(width/1.95, height * 0.89); // 화면 중앙 하단
  
  // 캠프파이어 스케일 팩터 적용
  const campfireScaleFactor = window.campfireScaleFactor || window.globalScaleFactor || 1;
  scale(campfireScaleFactor);
  
  // 장작더미 그리기
  drawLogs();
  
  // 불꽃 그리기
  drawFlames();
  
  // 불똥 (스파크) 그리기
  drawSparks();
  
  pop();
}

function drawLogs() {
  // 현실적인 장작더미 구조 (이미지처럼)
  push();
  
  // 바닥 장작들 (가로로 깔린 기본 베이스)
  fill(101, 67, 33);
  stroke(80, 50, 25);
  strokeWeight(1);
  
  // 바닥 장작 1
  push();
  translate(-25, 15);
  rotate(-0.1);
  rect(-30, -8, 60, 16, 8);
  // 장작 끝부분 (잘린 단면)
  fill(139, 115, 85);
  ellipse(-30, 0, 16, 16);
  ellipse(30, 0, 16, 16);
  pop();
  
  // 바닥 장작 2
  push();
  translate(20, 18);
  rotate(0.15);
  rect(-25, -6, 50, 12, 6);
  fill(139, 115, 85);
  ellipse(-25, 0, 12, 12);
  ellipse(25, 0, 12, 12);
  pop();
  
  // 기울어진 장작들 (텐트 구조)
  fill(101, 67, 33);
  
  // 왼쪽 기울어진 장작
  push();
  translate(-15, 0);
  rotate(-0.6);
  rect(-35, -7, 70, 14, 7);
  fill(139, 115, 85);
  ellipse(-35, 0, 14, 14);
  ellipse(35, 0, 14, 14);
  pop();
  
  // 오른쪽 기울어진 장작
  push();
  translate(15, 0);
  rotate(0.6);
  rect(-35, -7, 70, 14, 7);
  fill(139, 115, 85);
  ellipse(-35, 0, 14, 14);
  ellipse(35, 0, 14, 14);
  pop();
  
  // 뒤쪽 장작
  push();
  translate(0, -5);
  rotate(-0.8);
  rect(-30, -6, 60, 12, 6);
  fill(139, 115, 85);
  ellipse(-30, 0, 12, 12);
  ellipse(30, 0, 12, 12);
  pop();
  
  // 앞쪽 장작
  push();
  translate(5, 8);
  rotate(0.7);
  rect(-25, -5, 50, 10, 5);
  fill(139, 115, 85);
  ellipse(-25, 0, 10, 10);
  ellipse(25, 0, 10, 10);
  pop();
  
  pop();
}

function drawFlames() {
  noStroke();
  
  // 메인 큰 불꽃들 (이미지처럼 높고 강렬한)
  for (let i = 0; i < 8; i++) {
    let angle = (i / 8) * TWO_PI;
    let x = cos(angle) * (15 + sin(time * 3 + i) * 8);
    let baseHeight = 60 + i * 8 + sin(time * 4 + i) * 25;
    
    // 불꽃의 자연스러운 흔들림
    let wobble = sin(time * 5 + i * 2) * 15;
    let topWobble = sin(time * 6 + i) * 25;
    
    push();
    translate(x, 0);
    
    // 외곽 진한 빨강/주황
    fill(255, 69, 0, 200);
    beginShape();
    vertex(0, 0);
    vertex(-15 + wobble * 0.3, -baseHeight * 0.3);
    vertex(-12 + wobble * 0.5, -baseHeight * 0.6);
    vertex(-8 + topWobble * 0.3, -baseHeight * 0.8);
    vertex(-4 + topWobble, -baseHeight);
    vertex(0 + topWobble * 1.2, -baseHeight * 1.1);
    vertex(4 + topWobble, -baseHeight);
    vertex(8 + topWobble * 0.3, -baseHeight * 0.8);
    vertex(12 + wobble * 0.5, -baseHeight * 0.6);
    vertex(15 + wobble * 0.3, -baseHeight * 0.3);
    endShape(CLOSE);
    
    // 중간 주황색
    fill(255, 140, 0, 220);
    beginShape();
    vertex(0, 0);
    vertex(-10 + wobble * 0.4, -baseHeight * 0.4);
    vertex(-8 + wobble * 0.6, -baseHeight * 0.7);
    vertex(-3 + topWobble * 0.5, -baseHeight * 0.9);
    vertex(0 + topWobble, -baseHeight * 1.0);
    vertex(3 + topWobble * 0.5, -baseHeight * 0.9);
    vertex(8 + wobble * 0.6, -baseHeight * 0.7);
    vertex(10 + wobble * 0.4, -baseHeight * 0.4);
    endShape(CLOSE);
    
    // 내부 밝은 노랑
    fill(255, 200, 50, 180);
    beginShape();
    vertex(0, 0);
    vertex(-6 + wobble * 0.5, -baseHeight * 0.5);
    vertex(-4 + topWobble * 0.3, -baseHeight * 0.8);
    vertex(0 + topWobble * 0.8, -baseHeight * 0.9);
    vertex(4 + topWobble * 0.3, -baseHeight * 0.8);
    vertex(6 + wobble * 0.5, -baseHeight * 0.5);
    endShape(CLOSE);
    
    pop();
  }
  
  // 중앙 핵심 불꽃 (가장 뜨거운 부분)
  let coreHeight = 45 + sin(time * 8) * 20;
  let coreWobble = sin(time * 10) * 8;
  
  fill(255, 255, 150, 200);
  beginShape();
  vertex(0, 5);
  vertex(-8 + coreWobble * 0.3, -coreHeight * 0.6);
  vertex(-4 + coreWobble, -coreHeight * 0.9);
  vertex(0 + coreWobble * 1.2, -coreHeight);
  vertex(4 + coreWobble, -coreHeight * 0.9);
  vertex(8 + coreWobble * 0.3, -coreHeight * 0.6);
  endShape(CLOSE);
  
  // 불의 밑부분 밝은 코어
  fill(255, 255, 200, 150);
  ellipse(0, 0, 25 + sin(time * 6) * 5, 15);
}

function drawSparks() {
  // 현실적인 불똥들
  for (let i = 0; i < 20; i++) {
    let angle = (i / 20) * TWO_PI + time * 0.5;
    let distance = 20 + sin(time * 3 + i) * 25;
    let height = -40 - cos(time * 2 + i) * 30 - i * 2;
    
    let sparkX = cos(angle) * distance + sin(time * 5 + i) * 8;
    let sparkY = height + sin(time * 4 + i) * 5;
    let sparkSize = 0.8 + sin(time * 7 + i) * 0.5;
    
    // 불똥 생명력 (위로 올라갈수록 어두워짐)
    let life = map(sparkY, -100, -20, 0, 255);
    life = constrain(life, 0, 255);
    
    fill(255, 150 + life * 0.4, life * 0.2, life);
    noStroke();
    ellipse(sparkX, sparkY, sparkSize * 2, sparkSize);
  }
  
  // 연기 효과
  drawSmoke();
}

function drawSmoke() {
  // 연기 파티클들
  for (let i = 0; i < 8; i++) {
    let smokeX = sin(time * 0.5 + i) * (20 + i * 5);
    let smokeY = -60 - i * 15 - cos(time * 0.3 + i) * 10;
    let smokeSize = 15 + i * 3 + sin(time * 2 + i) * 5;
    
    let alpha = map(i, 0, 8, 60, 5);
    fill(100, 100, 100, alpha);
    noStroke();
    ellipse(smokeX, smokeY, smokeSize, smokeSize * 0.8);
  }
}

function checkTreeHover() {
  // 나무 영역에 마우스가 있는지 확인 (호버 영역 더 축소)
  let actualTreeWidth = treeWidth * 0.25; // 40%에서 25%로 축소
  let actualTreeHeight = treeHeight * 0.4; // 60%에서 40%로 축소
  
  let treeLeft = treeX - actualTreeWidth/2;
  let treeRight = treeX + actualTreeWidth/2;
  let treeTop = treeY - actualTreeHeight/2;
  let treeBottom = treeY + actualTreeHeight/2;
  
  if (mouseX >= treeLeft && mouseX <= treeRight && 
      mouseY >= treeTop && mouseY <= treeBottom) {
    treeHovered = true;
  } else {
    treeHovered = false;
  }
}

function drawTree() {
  let currentTreeImage = treeHovered ? tree2Image : treeImage;
  
  if (currentTreeImage) {
    push();
    imageMode(CENTER);
    
    if (treeHovered) {
      // tree2일 때만 다른 위치
      image(currentTreeImage, treeX + 22.5, treeY + 4.6, treeWidth, treeHeight);
    } else {
      // tree일 때는 원래 위치
      image(currentTreeImage, treeX, treeY, treeWidth, treeHeight);
    }
    
    pop();
  }
}

function checkPeopleHover() {
  // 사람들 영역에 마우스가 있는지 확인 (위쪽 영역 대폭 축소)
  let actualPeopleWidth = peopleWidth * 0.3; // 30%
  let actualPeopleHeight = peopleHeight * 0.4; // 40%
  
  // 위쪽 영역을 대폭 줄이고 아래쪽 중심으로 호버 영역 설정
  let peopleLeft = peopleX - actualPeopleWidth/2;
  let peopleRight = peopleX + actualPeopleWidth/2;
  let peopleTop = peopleY - actualPeopleHeight * 0.2; // 위쪽 20%만 사용 (80% 축소)
  let peopleBottom = peopleY + actualPeopleHeight * 0.8; // 아래쪽 80% 사용
  
  if (mouseX >= peopleLeft && mouseX <= peopleRight && 
      mouseY >= peopleTop && mouseY <= peopleBottom) {
    peopleHovered = true;
  } else {
    peopleHovered = false;
  }
}

function checkHousesHover() {
  // House1 호버 체크 (왼쪽)
  let house1X = width * 0.11;
  let house1Y = height * 0.7;
  let house1Width = 1800 * 0.3; // 호버 영역을 30%로 축소
  let house1Height = 1200 * 0.4; // 호버 영역을 40%로 축소
  
  let house1Left = house1X - house1Width/2;
  let house1Right = house1X + house1Width/2;
  let house1Top = house1Y - house1Height/2;
  let house1Bottom = house1Y + house1Height/2;
  
  if (mouseX >= house1Left && mouseX <= house1Right && 
      mouseY >= house1Top && mouseY <= house1Bottom) {
    house1Hovered = true;
  } else {
    house1Hovered = false;
  }
  
  // House2 호버 체크 (오른쪽)
  let house2X = width * 0.289;
  let house2Y = height * 0.45;
  let house2Width = 1800 * 0.3; // 호버 영역을 30%로 축소
  let house2Height = 1200 * 0.4; // 호버 영역을 40%로 축소
  
  let house2Left = house2X - house2Width/2;
  let house2Right = house2X + house2Width/2;
  let house2Top = house2Y - house2Height/2;
  let house2Bottom = house2Y + house2Height/2;
  
  if (mouseX >= house2Left && mouseX <= house2Right && 
      mouseY >= house2Top && mouseY <= house2Bottom) {
    house2Hovered = true;
  } else {
    house2Hovered = false;
  }
  
  // House3 호버 체크 (중앙 뒤쪽)
  let house3X = width * 0.89;
  let house3Y = height * 0.7;
  let house3Width = 1800 * 0.3; // 호버 영역을 30%로 축소
  let house3Height = 1000 * 0.4; // 호버 영역을 40%로 축소
  
  let house3Left = house3X - house3Width/2;
  let house3Right = house3X + house3Width/2;
  let house3Top = house3Y - house3Height/2;
  let house3Bottom = house3Y + house3Height/2;
  
  if (mouseX >= house3Left && mouseX <= house3Right && 
      mouseY >= house3Top && mouseY <= house3Bottom) {
    house3Hovered = true;
  } else {
    house3Hovered = false;
  }
}

function updateWindEffect() {
  // 마우스가 움직일 때만 새로운 파티클 생성
  let mouseSpeed = dist(mouseX, mouseY, prevMouseX, prevMouseY);
  
  if (mouseSpeed > 2) { // 마우스가 충분히 빨리 움직일 때만
    // 마우스 움직임 방향에 따라 파티클 생성
    let angle = atan2(mouseY - prevMouseY, mouseX - prevMouseX);
    
    // 여러 개의 파티클을 생성하여 돌풍 효과 만들기
    for (let i = 0; i < 3; i++) {
      windParticles.push({
        x: mouseX + random(-20, 20),
        y: mouseY + random(-20, 20),
        vx: cos(angle + random(-0.5, 0.5)) * random(2, 8),
        vy: sin(angle + random(-0.5, 0.5)) * random(2, 8),
        life: 255,
        size: random(3, 12),
        rotation: random(0, TWO_PI),
        rotationSpeed: random(-0.3, 0.3)
      });
    }
  }
  
  // 기존 파티클들 업데이트
  for (let i = windParticles.length - 1; i >= 0; i--) {
    let particle = windParticles[i];
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vx *= 0.98; // 저항
    particle.vy *= 0.98;
    particle.life -= 4;
    particle.rotation += particle.rotationSpeed;
    
    // 수명이 다한 파티클 제거
    if (particle.life <= 0) {
      windParticles.splice(i, 1);
    }
  }
  
  // 이전 마우스 위치 저장
  prevMouseX = mouseX;
  prevMouseY = mouseY;
}

function drawWindEffect() {
  push();
  
  for (let particle of windParticles) {
    push();
    translate(particle.x, particle.y);
    rotate(particle.rotation);
    
    // 돌풍 라인 그리기
    stroke(255, 255, 255, particle.life * 0.8);
    strokeWeight(particle.size * 0.3);
    
    // 여러 개의 선으로 돌풍 효과 표현
    for (let j = 0; j < 3; j++) {
      let offset = j * particle.size * 0.3;
      line(-particle.size - offset, 0, particle.size - offset, 0);
    }
    
    // 추가적인 작은 선들로 더 복잡한 돌풍 효과
    stroke(200, 220, 255, particle.life * 0.4);
    strokeWeight(1);
    for (let k = 0; k < 5; k++) {
      let x1 = random(-particle.size, particle.size);
      let y1 = random(-particle.size * 0.3, particle.size * 0.3);
      let x2 = x1 + random(-5, 5);
      let y2 = y1 + random(-3, 3);
      line(x1, y1, x2, y2);
    }
    
    pop();
  }
  
  pop();
}

function mousePressed() {
  // 사용자 제스처로 오디오 컨텍스트 활성화
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
  
  // 모든 사운드 정지
  if (scene1Sound && scene1Sound.isPlaying()) {
    scene1Sound.stop();
  }
  if (scene3Sound && scene3Sound.isPlaying()) {
    scene3Sound.stop();
  }
  if (scene3_1Sound && scene3_1Sound.isPlaying()) {
    scene3_1Sound.stop();
  }
  if (scene4Sound && scene4Sound.isPlaying()) {
    scene4Sound.stop();
  }
  
  // 클릭하면 다음 장면으로 전환
  currentScene++;
  if (currentScene > totalScenes) {
    currentScene = 1; // 마지막 장면 후 첫 번째 장면으로 돌아감
  }
  
  // 장면 전환 시 기존 돌풍 파티클들 모두 제거
  windParticles = [];
  
  // Scene 1로 전환할 때 사운드 재생
  if (currentScene === 1) {
    if (scene1Sound && soundsLoaded) {
      console.log('scene1 사운드 재생 시도');
      scene1Sound.setVolume(0.5);
      scene1Sound.loop();
    } else {
      console.log('scene1 사운드가 로딩되지 않았습니다');
    }
  }
  
  // Scene 3으로 전환할 때 태풍 효과 시작 및 사운드 재생
  if (currentScene === 3) {
    typhoonStartTime = millis();
    
    if (scene3Sound && scene3_1Sound && scene3SoundsLoaded) {
      console.log('scene3 사운드들 재생 시도');
      
      // scene3.mp3를 배경음으로 먼저 재생 (반복)
      scene3Sound.setVolume(0.4);
      scene3Sound.loop();
      
      // scene3.1.mp3를 태풍 시작과 함께 재생 (한 번만)
      scene3_1Sound.setVolume(0.6);
      scene3_1Sound.play();
    } else {
      console.log('scene3 사운드들이 로딩되지 않았습니다');
    }
  }
  
  // Scene 4로 전환할 때 폭발 효과 시작 및 사운드 재생
  if (currentScene === 4) {
    explosionStartTime = millis();
    
    if (scene4Sound && scene4SoundLoaded) {
      console.log('scene4 사운드 재생 시도');
      scene4Sound.setVolume(0.7);
      scene4Sound.play(); // 한 번만 재생 (폭발 효과와 함께)
    } else {
      console.log('scene4 사운드가 로딩되지 않았습니다');
    }
  }
}

// 터치 이벤트 처리 (모바일용)
function touchStarted() {
  // 터치 위치 업데이트
  if (touches.length > 0) {
    touchX = touches[0].x;
    touchY = touches[0].y;
    
    // 모바일에서는 터치 위치를 마우스 위치로 설정
    mouseX = touchX;
    mouseY = touchY;
  }
  
  // 터치 시작 시 마우스 클릭과 동일하게 처리
  mousePressed();
  
  // 기본 터치 동작 방지 (스크롤, 줌 등)
  return false;
}

function touchMoved() {
  // 터치 움직임 위치 업데이트
  if (touches.length > 0) {
    touchX = touches[0].x;
    touchY = touches[0].y;
    
    // 모바일에서는 터치 위치를 마우스 위치로 설정 (호버 효과를 위해)
    mouseX = touchX;
    mouseY = touchY;
  }
  
  // 기본 터치 동작 방지
  return false;
}

function touchEnded() {
  // 터치 종료 시 호버 상태 해제 (모바일에서는 호버가 지속되지 않음)
  if (isMobile) {
    treeHovered = false;
    peopleHovered = false;
    house1Hovered = false;
    house2Hovered = false;
    house3Hovered = false;
  }
  
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // WebGL 그래픽 버퍼 크기도 조정
  if (WebGL) {
    WebGL.resizeCanvas(width, height);
  }
  if (Canvas) {
    Canvas.resizeCanvas(width, height);
  }
  
  // Scene 3, 4용 버퍼 재생성
  sceneBuffer = null;
  
  // 반응형 레이아웃 업데이트
  setupResponsiveLayout();
  updateTreeLayout();
  updatePeopleLayout();
}

// 반응형 레이아웃 설정
function setupResponsiveLayout() {
  // 기준 해상도 설정 (데스크톱 기준)
  const baseWidth = 1920;
  const baseHeight = 1080;
  
  // 현재 화면 비율과 기준 비율 비교
  const screenRatio = width / height;
  const baseRatio = baseWidth / baseHeight;
  
  // 스케일 팩터 계산 (컴포지션 유지)
  let scaleFactor;
  
  if (screenRatio > baseRatio) {
    // 화면이 더 넓은 경우 (와이드 스크린) - 높이 기준으로 스케일
    scaleFactor = height / baseHeight;
  } else {
    // 화면이 더 높은 경우 (세로형, 모바일) - 너비 기준으로 스케일
    scaleFactor = width / baseWidth;
  }
  
  // 모바일에서는 최소 크기 보장
  if (isMobile) {
    scaleFactor = max(scaleFactor, 0.4);
    scaleFactor = min(scaleFactor, 1.2); // 너무 크지 않게
  } else {
    scaleFactor = max(scaleFactor, 0.5);
  }
  
  // 전역 스케일 팩터 저장
  window.globalScaleFactor = scaleFactor;
  
  // 집 전용 스케일 팩터 (모바일에서 대폭 줄임)
  let houseScaleFactor = scaleFactor;
  if (isMobile) {
    houseScaleFactor = scaleFactor * 0.35; // 모바일에서 집 크기를 65% 줄임
  }
  window.houseScaleFactor = houseScaleFactor;
  
  // 사람 전용 스케일 팩터 (모바일에서 대폭 줄임)
  let peopleScaleFactor = scaleFactor;
  if (isMobile) {
    peopleScaleFactor = scaleFactor * 0.4; // 모바일에서 사람 크기를 60% 줄임
  }
  window.peopleScaleFactor = peopleScaleFactor;
  
  // 캠프파이어 전용 스케일 팩터 (모바일에서 작게)
  let campfireScaleFactor = scaleFactor;
  if (isMobile) {
    campfireScaleFactor = scaleFactor * 0.5; // 모바일에서 캠프파이어 크기를 50% 줄임
  }
  window.campfireScaleFactor = campfireScaleFactor;
}

// 나무 레이아웃 업데이트
function updateTreeLayout() {
  const scaleFactor = window.globalScaleFactor || 1;
  
  // 컴포지션 유지 - 원래 비율 그대로 유지
  treeX = width * 0.5; // 화면 중앙
  treeY = height * 0.33; // 화면 상단 1/3 지점
  
  // 원본 크기에 스케일 팩터 적용
  treeWidth = 1700 * scaleFactor;
  treeHeight = 1200 * scaleFactor;
}

// 사람들 레이아웃 업데이트
function updatePeopleLayout() {
  const scaleFactor = window.globalScaleFactor || 1;
  const peopleScaleFactor = window.peopleScaleFactor || scaleFactor;
  
  // 컴포지션 유지 - 원래 비율 그대로 유지
  peopleX = width * 0.52; // 화면 중앙 약간 오른쪽
  peopleY = height * 0.6; // 화면 하단 60% 지점
  
  // 원본 크기에 사람 전용 스케일 팩터 적용
  peopleWidth = 1600 * peopleScaleFactor;
  peopleHeight = 1100 * peopleScaleFactor;
}

// 쉐이더 코드
const displace = `
	// MIT License
	// Copyright © 2023 Zaron
	vec2 displace(vec2 uv, vec2 duv, float off, float wei) {
		duv -= off;
		return uv-duv*wei;
	}

	vec4 displace(vec2 uv, sampler2D img, vec2 duv, float off, float wei) {
		duv -= off;
		return texture2D(img, uv-duv*wei);
	}
`;

const frag = `
	#ifdef GL_ES
	precision mediump float;
	#endif

	uniform vec2 iResolution;
	uniform float iPixelDensity;
	uniform sampler2D iCanvas;
	uniform sampler2D iImage;
	uniform vec2 iImageResolution;
	uniform vec2 iMouse;
	uniform float iTime;
	
	${displace}
	
	float random(vec2 uv) {
		return fract(sin(dot(uv, vec2(500.1234, -500.5678)))*9999.);
	}

	varying vec2 vTexCoord;
	void main() {
		vec2 uv = vTexCoord;
		vec2 mouse = iMouse.xy/iResolution.xy;
		uv.y = 1.-uv.y;

		vec2 iuv = floor(uv*10.);
		vec4 dimg = vec4(random(iuv));
		
		float wei = mouse.x;
		vec2 duv = displace(uv, dimg.rg, 0.5, wei);

		gl_FragColor = texture2D(iImage, duv);
	}
`;

const vert = `
	#ifdef GL_ES
	precision mediump float;
	#endif

	attribute vec3 aPosition;
	attribute vec2 aTexCoord;

	varying vec2 vTexCoord;

	void main() {
		vTexCoord = aTexCoord;
		vec4 positionVec4 = vec4(aPosition, 1.0);
		positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
		gl_Position = positionVec4;
	}
`;

function drawDisplacementGrid() {
  push();
  
  // 노이즈 기반 displacement 효과
  let noiseScale = 0.005;
  let displacementAmount = map(mouseX, 0, width, 10, 100);
  let turbulence = map(mouseY, 0, height, 1, 8);
  
  // 다중 레이어 노이즈 효과
  for (let layer = 0; layer < 3; layer++) {
    let layerOpacity = 80 - layer * 20;
    let layerScale = noiseScale * (layer + 1);
    let layerAmount = displacementAmount / (layer + 1);
    
    // 격자 그리기 (극도로 왜곡됨)
    stroke(100 + layer * 50, 150 + layer * 30, 255 - layer * 50, layerOpacity);
    strokeWeight(2 - layer * 0.5);
    
    // 세로 선들 (노이즈로 극도로 왜곡)
    for (let x = 0; x <= width; x += 20) {
      beginShape();
      noFill();
      for (let y = 0; y <= height; y += 3) {
        // 다중 노이즈 레이어 적용
        let noiseX1 = noise(x * layerScale, y * layerScale, time + layer);
        let noiseY1 = noise(x * layerScale + 1000, y * layerScale + 1000, time + layer);
        let noiseX2 = noise(x * layerScale * 2, y * layerScale * 2, time * 2 + layer);
        let noiseY2 = noise(x * layerScale * 2 + 2000, y * layerScale * 2 + 2000, time * 2 + layer);
        
        // 복합 displacement 계산
        let displaceX = (noiseX1 - 0.5) * layerAmount + (noiseX2 - 0.5) * layerAmount * 0.5;
        let displaceY = (noiseY1 - 0.5) * layerAmount + (noiseY2 - 0.5) * layerAmount * 0.5;
        
        // 마우스 근처에서 추가 왜곡
        let mouseDistance = dist(x, y, mouseX, mouseY);
        if (mouseDistance < 300) {
          let mouseInfluence = map(mouseDistance, 0, 300, 1, 0);
          mouseInfluence = pow(mouseInfluence, 0.5);
          
          // 소용돌이 효과 추가
          let angle = atan2(y - mouseY, x - mouseX);
          let spiralX = cos(angle + mouseInfluence * turbulence + time * 3) * mouseInfluence * 50;
          let spiralY = sin(angle + mouseInfluence * turbulence + time * 3) * mouseInfluence * 50;
          
          displaceX += spiralX;
          displaceY += spiralY;
        }
        
        vertex(x + displaceX, y + displaceY);
      }
      endShape();
    }
    
    // 가로 선들 (노이즈로 극도로 왜곡)
    for (let y = 0; y <= height; y += 20) {
      beginShape();
      noFill();
      for (let x = 0; x <= width; x += 3) {
        // 다중 노이즈 레이어 적용
        let noiseX1 = noise(x * layerScale, y * layerScale, time + layer + 100);
        let noiseY1 = noise(x * layerScale + 1000, y * layerScale + 1000, time + layer + 100);
        let noiseX2 = noise(x * layerScale * 3, y * layerScale * 3, time * 1.5 + layer);
        let noiseY2 = noise(x * layerScale * 3 + 3000, y * layerScale * 3 + 3000, time * 1.5 + layer);
        
        // 복합 displacement 계산
        let displaceX = (noiseX1 - 0.5) * layerAmount + (noiseX2 - 0.5) * layerAmount * 0.7;
        let displaceY = (noiseY1 - 0.5) * layerAmount + (noiseY2 - 0.5) * layerAmount * 0.7;
        
        // 마우스 근처에서 추가 왜곡
        let mouseDistance = dist(x, y, mouseX, mouseY);
        if (mouseDistance < 300) {
          let mouseInfluence = map(mouseDistance, 0, 300, 1, 0);
          mouseInfluence = pow(mouseInfluence, 0.5);
          
          // 소용돌이 효과 추가
          let angle = atan2(y - mouseY, x - mouseX);
          let spiralX = cos(angle - mouseInfluence * turbulence + time * 2) * mouseInfluence * 50;
          let spiralY = sin(angle - mouseInfluence * turbulence + time * 2) * mouseInfluence * 50;
          
          displaceX += spiralX;
          displaceY += spiralY;
        }
        
        vertex(x + displaceX, y + displaceY);
      }
      endShape();
    }
  }
  
  // 노이즈 파티클들 (추가적인 시각 효과)
  for (let i = 0; i < 200; i++) {
    let x = random(width);
    let y = random(height);
    
    // 노이즈 기반 위치 왜곡
    let noiseVal1 = noise(x * 0.01, y * 0.01, time + i * 0.1);
    let noiseVal2 = noise(x * 0.02, y * 0.02, time * 2 + i * 0.05);
    
    let distortX = x + (noiseVal1 - 0.5) * displacementAmount * 2;
    let distortY = y + (noiseVal2 - 0.5) * displacementAmount * 2;
    
    // 마우스 근처에서 추가 효과
    let mouseDistance = dist(distortX, distortY, mouseX, mouseY);
    if (mouseDistance < 200) {
      let influence = map(mouseDistance, 0, 200, 1, 0);
      
      fill(255, 100 + influence * 155, 50, influence * 150);
      noStroke();
      
      let size = influence * 8 + noiseVal1 * 5;
      ellipse(distortX, distortY, size, size);
    }
  }
  
  // 중심에 강렬한 왜곡 표시
  push();
  translate(mouseX, mouseY);
  rotate(time * 2);
  
  for (let i = 0; i < 8; i++) {
    let angle = (i / 8) * TWO_PI;
    let radius = 30 + sin(time * 4 + i) * 20;
    
    let x = cos(angle) * radius;
    let y = sin(angle) * radius;
    
    // 노이즈로 각 점 왜곡
    let noiseX = noise(x * 0.1, y * 0.1, time) * 20 - 10;
    let noiseY = noise(x * 0.1 + 100, y * 0.1 + 100, time) * 20 - 10;
    
    stroke(255, 200, 0, 200);
    strokeWeight(3);
    point(x + noiseX, y + noiseY);
  }
  
  pop();
  
  pop();
}
