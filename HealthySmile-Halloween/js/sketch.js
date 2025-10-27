import { FaceLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

let faceLandmarker;
let lastVideoTime = -1;
let detections = [];
let mouthOpen = false;

// Arrays per efectes
let sparks = [];
let smokeParticles = [];
let magicEnergy = 0; // 🔮 energia acumulada (0 a 1)

new p5((p) => {
  let video;
  let isModelReady = false;
  let isVideoReady = false;

  async function setupFaceLandmarker() {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      },
      runningMode: "VIDEO",
      numFaces: 1,
    });

    isModelReady = true;
    console.log("✅ MediaPipe Face Landmarker carregat");
  }

  p.setup = async function () {
    const canvas = p.createCanvas(960, 540);
    canvas.parent("canvas-container");

    video = p.createCapture(p.VIDEO, () => {
      console.log("📷 Càmera activada");
      isVideoReady = true;
    });
    video.size(p.width, p.height);
    video.hide();

    await setupFaceLandmarker();
  };

  p.draw = function () {
    // 🔮 Canvi suau segons energia màgica
    const bgIntensity = p.map(magicEnergy, 0, 1, 10, 80);
    const bgColor = mouthOpen
      ? p.color(bgIntensity * 0.8, 0, bgIntensity)
      : p.color(10, 10, 30);
    p.background(bgColor);

    if (!isVideoReady || !isModelReady) {
      p.fill(255);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(20);
      p.text(
        isVideoReady ? "Carregant model MediaPipe... ⏳" : "Esperant càmera... 📷",
        p.width / 2,
        p.height / 2
      );
      return;
    }

    // Mostrar vídeo mirall
    p.push();
    p.translate(p.width, 0);
    p.scale(-1, 1);
    p.image(video, 0, 0, p.width, p.height);
    p.pop();

    const nowInMs = performance.now();
    if (video.elt.readyState >= 2 && faceLandmarker) {
      if (lastVideoTime !== video.elt.currentTime) {
        lastVideoTime = video.elt.currentTime;
        const results = faceLandmarker.detectForVideo(video.elt, nowInMs);
        detections = results.faceLandmarks;
      }
    }

    if (detections && detections.length > 0) {
      const keypoints = detections[0];
      drawFaceLandmarks(keypoints);
      detectMouthOpen(keypoints);
      updateMagicEnergy(); // ⚡ actualitza energia segons boca oberta
      if (mouthOpen) {
        createMagicEffects(keypoints);
      }
    }

    drawEffects();
    drawHUD();
  };

  // --- Detecció facial ---
  function drawFaceLandmarks(keypoints) {
    p.noFill();
    p.stroke(255, 80);
    p.strokeWeight(1);
    for (let i = 0; i < keypoints.length; i++) {
      const { x, y } = keypoints[i];
      const px = p.width - x * p.width;
      const py = y * p.height;
      p.point(px, py);
    }
  }

  function detectMouthOpen(keypoints) {
    const upperLip = keypoints[13];
    const lowerLip = keypoints[14];
    const leftEye = keypoints[33];
    const rightEye = keypoints[263];
    if (!upperLip || !lowerLip || !leftEye || !rightEye) return;

    const mouthDist = p.dist(
      upperLip.x * p.width,
      upperLip.y * p.height,
      lowerLip.x * p.width,
      lowerLip.y * p.height
    );
    const eyeDist = p.dist(
      leftEye.x * p.width,
      leftEye.y * p.height,
      rightEye.x * p.width,
      rightEye.y * p.height
    );

    const ratio = mouthDist / eyeDist;
    mouthOpen = ratio > 0.28;
  }

  // --- Intensitat màgica ---
  function updateMagicEnergy() {
    const target = mouthOpen ? 1 : 0;
    // puja ràpid quan està oberta, baixa lentament
    const speed = mouthOpen ? 0.02 : 0.01;
    magicEnergy = p.lerp(magicEnergy, target, speed);
  }

  // --- Efectes visuals ---
  function createMagicEffects(keypoints) {
    const mouth = keypoints[14];
    const px = p.width - mouth.x * p.width;
    const py = mouth.y * p.height;

    // nombre d'espurnes i fum segons energia
    const sparkCount = p.int(p.map(magicEnergy, 0, 1, 2, 8));
    const smokeChance = p.map(magicEnergy, 0, 1, 0.1, 0.8);

    for (let i = 0; i < sparkCount; i++) {
      sparks.push({
        x: px,
        y: py,
        vx: p.random(-1.5, 1.5),
        vy: p.random(-3 - magicEnergy * 2, -1),
        life: 255,
        size: p.random(3, 6 + magicEnergy * 4),
      });
    }

    if (p.random() < smokeChance) {
      smokeParticles.push({
        x: px,
        y: py,
        vy: p.random(-0.5, -1.5),
        alpha: 150 + magicEnergy * 100,
        size: p.random(15, 25 + magicEnergy * 10),
      });
    }
  }

  function drawEffects() {
    // Espurnes
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      p.noStroke();
      p.fill(255, 180 + magicEnergy * 75, 50, s.life);
      p.circle(s.x, s.y, s.size);
      s.x += s.vx;
      s.y += s.vy;
      s.life -= 5 + magicEnergy * 3;
      if (s.life <= 0) sparks.splice(i, 1);
    }

    // Fum
    for (let i = smokeParticles.length - 1; i >= 0; i--) {
      const f = smokeParticles[i];
      p.noStroke();
      p.fill(200, 200, 255, f.alpha);
      p.circle(f.x, f.y, f.size);
      f.y += f.vy;
      f.alpha -= 2;
      if (f.alpha <= 0) smokeParticles.splice(i, 1);
    }
  }

  function drawHUD() {
    p.noStroke();
    p.fill(255);
    p.textSize(18);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`Boca oberta: ${mouthOpen ? "🟢 Sí" : "🔴 No"}`, 20, 20);

    // Indicador d'energia màgica
    p.fill(100, 0, 200);
    p.rect(20, 50, 200, 10, 5);
    p.fill(180, 100, 255);
    p.rect(20, 50, 200 * magicEnergy, 10, 5);
    p.noStroke();
    p.textSize(14);
    p.text(`Intensitat màgica: ${(magicEnergy * 100).toFixed(0)}%`, 20, 65);
  }
});
