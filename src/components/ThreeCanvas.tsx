import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GameArea, GameSettings } from '../types';

interface ThreeCanvasProps {
  currentArea: GameArea;
  settings: GameSettings;
  moveVector: { x: number; y: number }; // x: strafe (-1 to 1), y: forward/back (-1 to 1)
  lookDelta: { x: number; y: number }; // yaw delta, pitch delta
  isRunning: boolean;
  onLookAt: (target: { id: string; prompt: string; label: string } | null) => void;
  triggerScare: boolean;
  activeHorrorEvent: string | null;
  onFootstep: () => void;
}

// Procedural textures generator
function createProceduralTexture(type: 'wood' | 'brick' | 'wallpaper' | 'stone' | 'metal' | 'cloth'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  if (type === 'wood') {
    ctx.fillStyle = '#241a12';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 256; i += 4) {
      ctx.fillStyle = Math.random() > 0.5 ? '#1a120b' : '#2b1f16';
      ctx.fillRect(0, i, 256, 3);
    }
    // Wood grain noise
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for (let i = 0; i < 3000; i++) {
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 1);
    }
  } else if (type === 'wallpaper') {
    ctx.fillStyle = '#1e1b18';
    ctx.fillRect(0, 0, 256, 256);
    // Damask eerie floral pattern
    ctx.strokeStyle = '#2d2822';
    ctx.lineWidth = 2;
    for (let x = 0; x < 256; x += 32) {
      for (let y = 0; y < 256; y += 32) {
        ctx.beginPath();
        ctx.arc(x + 16, y + 16, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + 16, y + 16, 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    // Water/blood stains
    ctx.fillStyle = 'rgba(20, 10, 8, 0.4)';
    ctx.beginPath();
    ctx.ellipse(80, 70, 50, 80, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'brick') {
    ctx.fillStyle = '#18181a';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#0a0a0c';
    ctx.lineWidth = 3;
    for (let y = 0; y < 256; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
      const offset = (y / 20) % 2 === 0 ? 0 : 20;
      for (let x = offset; x < 256; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 20);
        ctx.stroke();
      }
    }
  } else if (type === 'stone') {
    ctx.fillStyle = '#141416';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let i = 0; i < 4000; i++) {
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    for (let i = 0; i < 2000; i++) {
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 4, 3);
    }
  } else if (type === 'metal') {
    ctx.fillStyle = '#222325';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#3a2015'; // Rust
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 256, Math.random() * 256, Math.random() * 25, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = '#1a1917';
    ctx.fillRect(0, 0, 256, 256);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  currentArea,
  settings,
  moveVector,
  lookDelta,
  isRunning,
  onLookAt,
  triggerScare,
  activeHorrorEvent,
  onFootstep,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mutable refs to decouple animation loop from React renders
  const stateRef = useRef({
    camera: null as THREE.PerspectiveCamera | null,
    scene: null as THREE.Scene | null,
    renderer: null as THREE.WebGLRenderer | null,
    flashlight: null as THREE.SpotLight | null,
    interactables: [] as { mesh: THREE.Object3D; id: string; prompt: string; label: string }[],
    pendulum: null as THREE.Object3D | null,
    dustParticles: null as THREE.Points | null,
    creatureEntity: null as THREE.Object3D | null,
    cameraShake: 0,
    headBob: 0,
    lastStepTime: 0,
    pitch: 0,
    yaw: 0,
    playerPos: new THREE.Vector3(0, 1.6, 3),
    raycaster: new THREE.Raycaster(),
  });

  // Keep latest props in refs for animation loop
  const propsRef = useRef({
    moveVector,
    lookDelta,
    isRunning,
    settings,
    triggerScare,
    activeHorrorEvent,
    onLookAt,
    onFootstep,
  });
  propsRef.current = {
    moveVector,
    lookDelta,
    isRunning,
    settings,
    triggerScare,
    activeHorrorEvent,
    onLookAt,
    onFootstep,
  };

  // Build 3D Scene when currentArea changes
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050508, 0.08);

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 100);
    camera.position.set(0, 1.6, 3);

    const renderer = new THREE.WebGLRenderer({
      antialias: settings.graphicsQuality !== 'low',
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, settings.graphicsQuality === 'high' ? 2 : 1.2));
    renderer.shadowMap.enabled = settings.graphicsQuality !== 'low';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Flashlight
    const flashlight = new THREE.SpotLight(0xffecd0, 2.8, 18, Math.PI / 5, 0.45, 1.8);
    flashlight.position.set(0, 0, 0);
    flashlight.target.position.set(0, 0, -1);
    camera.add(flashlight);
    camera.add(flashlight.target);
    scene.add(camera);

    // Dim ambient light
    const ambientLight = new THREE.AmbientLight(0x1a1a24, 0.25 * (settings.brightness / 100));
    scene.add(ambientLight);

    // Dust particles
    const particleCount = settings.graphicsQuality === 'low' ? 80 : 300;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 16;
      positions[i + 1] = Math.random() * 4;
      positions[i + 2] = (Math.random() - 0.5) * 16;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x888899,
      size: 0.035,
      transparent: true,
      opacity: 0.4,
    });
    const dustParticles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(dustParticles);

    const interactables: { mesh: THREE.Object3D; id: string; prompt: string; label: string }[] = [];
    let pendulumObj: THREE.Object3D | null = null;
    let creatureObj: THREE.Object3D | null = null;

    // Shared Materials
    const woodTex = createProceduralTexture('wood');
    const wallTex = createProceduralTexture('wallpaper');
    const brickTex = createProceduralTexture('brick');
    const stoneTex = createProceduralTexture('stone');
    const metalTex = createProceduralTexture('metal');

    woodTex.repeat.set(4, 4);
    wallTex.repeat.set(4, 2);
    brickTex.repeat.set(4, 2);
    stoneTex.repeat.set(4, 4);

    const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.8 });
    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.9 });
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x111012, roughness: 0.95 });

    // Build Room Geometry based on Area
    if (currentArea === 'area_01_entrance') {
      stateRef.current.playerPos.set(0, 1.6, 4);

      // Floor & Ceiling
      const floorGeo = new THREE.PlaneGeometry(12, 14);
      const floor = new THREE.Mesh(floorGeo, woodMat);
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);

      const ceiling = new THREE.Mesh(floorGeo, ceilingMat);
      ceiling.position.y = 4;
      ceiling.rotation.x = Math.PI / 2;
      scene.add(ceiling);

      // Walls
      const backWallGeo = new THREE.PlaneGeometry(12, 4);
      const backWall = new THREE.Mesh(backWallGeo, wallMat);
      backWall.position.set(0, 2, -7);
      scene.add(backWall);

      const frontWall = new THREE.Mesh(backWallGeo, wallMat);
      frontWall.position.set(0, 2, 7);
      frontWall.rotation.y = Math.PI;
      scene.add(frontWall);

      const sideWallGeo = new THREE.PlaneGeometry(14, 4);
      const leftWall = new THREE.Mesh(sideWallGeo, wallMat);
      leftWall.position.set(-6, 2, 0);
      leftWall.rotation.y = Math.PI / 2;
      scene.add(leftWall);

      const rightWall = new THREE.Mesh(sideWallGeo, wallMat);
      rightWall.position.set(6, 2, 0);
      rightWall.rotation.y = -Math.PI / 2;
      scene.add(rightWall);

      // Grandfather Clock
      const clockGroup = new THREE.Group();
      clockGroup.position.set(4.5, 0, -6.3);

      const clockBodyGeo = new THREE.BoxGeometry(0.9, 3.2, 0.6);
      const clockBodyMat = new THREE.MeshStandardMaterial({ color: 0x30180e, roughness: 0.7 });
      const clockBody = new THREE.Mesh(clockBodyGeo, clockBodyMat);
      clockBody.position.y = 1.6;
      clockGroup.add(clockBody);

      // Dial face
      const dialGeo = new THREE.CircleGeometry(0.32, 24);
      const dialMat = new THREE.MeshBasicMaterial({ color: 0xded6be });
      const dial = new THREE.Mesh(dialGeo, dialMat);
      dial.position.set(0, 2.5, 0.31);
      clockGroup.add(dial);

      // Clock hands (Stopped at 3:17)
      const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.01), new THREE.MeshBasicMaterial({ color: 0x111111 }));
      hourHand.position.set(0.07, 2.5, 0.32);
      hourHand.rotation.z = -Math.PI / 2; // Hour hand at 3
      clockGroup.add(hourHand);

      const minuteHand = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.24, 0.01), new THREE.MeshBasicMaterial({ color: 0x111111 }));
      minuteHand.position.set(0.08, 2.45, 0.33);
      minuteHand.rotation.z = -Math.PI / 1.7; // Minute hand at ~17
      clockGroup.add(minuteHand);

      // Pendulum
      const pendulum = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8 }));
      pendulum.position.set(0, 1.4, 0.15);
      clockGroup.add(pendulum);
      pendulumObj = pendulum;

      scene.add(clockGroup);
      interactables.push({ mesh: clockBody, id: 'grandfather_clock', prompt: 'Examine Grandfather Clock', label: 'Grandfather Clock' });

      // Wooden Table with Children Photograph
      const tableGeo = new THREE.BoxGeometry(1.8, 0.9, 1.1);
      const table = new THREE.Mesh(tableGeo, woodMat);
      table.position.set(-3.5, 0.45, -4);
      scene.add(table);

      const photoGeo = new THREE.PlaneGeometry(0.45, 0.35);
      const photoMat = new THREE.MeshStandardMaterial({ color: 0xd4ccbe, roughness: 0.5 });
      const photoMesh = new THREE.Mesh(photoGeo, photoMat);
      photoMesh.position.set(-3.5, 0.92, -4);
      photoMesh.rotation.x = -Math.PI / 2;
      scene.add(photoMesh);
      interactables.push({ mesh: photoMesh, id: 'children_photo', prompt: 'Examine Photograph', label: 'Faded Photograph' });

      // Locked Basement Door
      const doorGeo = new THREE.BoxGeometry(1.4, 2.8, 0.15);
      const doorMat = new THREE.MeshStandardMaterial({ map: metalTex, color: 0x4a3c31 });
      const basementDoor = new THREE.Mesh(doorGeo, doorMat);
      basementDoor.position.set(0, 1.4, -6.9);
      scene.add(basementDoor);
      interactables.push({ mesh: basementDoor, id: 'basement_door', prompt: 'Open Basement Door', label: 'Reinforced Iron Door' });

      // Flickering Chandelier
      const chandelier = new THREE.PointLight(0xffaa55, 0.6, 8);
      chandelier.position.set(0, 3.2, 0);
      scene.add(chandelier);

    } else if (currentArea === 'area_02_basement') {
      stateRef.current.playerPos.set(0, 1.6, 5);

      // Damp stone room
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 14), new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.4 }));
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);

      const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(12, 14), new THREE.MeshStandardMaterial({ map: brickTex }));
      ceiling.position.y = 3.2;
      ceiling.rotation.x = Math.PI / 2;
      scene.add(ceiling);

      const wallMatStone = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.9 });
      const backWall = new THREE.Mesh(new THREE.PlaneGeometry(12, 3.2), wallMatStone);
      backWall.position.set(0, 1.6, -7);
      scene.add(backWall);

      const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.2), wallMatStone);
      leftWall.position.set(-6, 1.6, 0);
      leftWall.rotation.y = Math.PI / 2;
      scene.add(leftWall);

      const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.2), wallMatStone);
      rightWall.position.set(6, 1.6, 0);
      rightWall.rotation.y = -Math.PI / 2;
      scene.add(rightWall);

      // 4 Blackwood Family Portraits on Left Wall
      const portraitPositions = [-3, -1, 1, 3];
      const portraitNames = ['Arthur Blackwood', 'Beatrice Blackwood', 'Charles Blackwood', 'Evelyn Blackwood'];
      portraitPositions.forEach((z, idx) => {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 0.9), new THREE.MeshStandardMaterial({ color: 0x221810 }));
        frame.position.set(-5.9, 1.8, z);
        scene.add(frame);

        const canvasP = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.1), new THREE.MeshBasicMaterial({ color: idx === 3 ? 0x664444 : 0x444455 }));
        canvasP.position.set(-5.84, 1.8, z);
        canvasP.rotation.y = Math.PI / 2;
        scene.add(canvasP);

        interactables.push({ mesh: frame, id: `portrait_${idx}`, prompt: `Examine Portrait of ${portraitNames[idx]}`, label: portraitNames[idx] });
      });

      // Old crates & Newspaper Board
      const crate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), woodMat);
      crate.position.set(4, 0.6, -4);
      scene.add(crate);

      const notePaper = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.4), new THREE.MeshBasicMaterial({ color: 0xeee4c8 }));
      notePaper.position.set(4, 1.22, -4);
      notePaper.rotation.x = -Math.PI / 2;
      scene.add(notePaper);
      interactables.push({ mesh: notePaper, id: 'blackwood_clipping', prompt: 'Read Newspaper Clipping', label: '1924 News Clipping' });

      // Hidden wall passage
      const hiddenPassage = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.5, 0.2), new THREE.MeshStandardMaterial({ color: 0x111115 }));
      hiddenPassage.position.set(0, 1.25, -6.9);
      scene.add(hiddenPassage);
      interactables.push({ mesh: hiddenPassage, id: 'basement_hidden_passage', prompt: 'Investigate Brick Wall Seam', label: 'Concealed Passage' });

      // Low dangling bulb
      const bulb = new THREE.PointLight(0xffdd99, 0.4, 6);
      bulb.position.set(0, 2.6, 0);
      scene.add(bulb);

    } else if (currentArea === 'area_03_childrens_room') {
      stateRef.current.playerPos.set(0, 1.6, 4.5);

      const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 12), woodMat);
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);

      const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(10, 12), ceilingMat);
      ceiling.position.y = 3.5;
      ceiling.rotation.x = Math.PI / 2;
      scene.add(ceiling);

      const backWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.5), wallMat);
      backWall.position.set(0, 1.75, -6);
      scene.add(backWall);

      const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(12, 3.5), wallMat);
      leftWall.position.set(-5, 1.75, 0);
      leftWall.rotation.y = Math.PI / 2;
      scene.add(leftWall);

      const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(12, 3.5), wallMat);
      rightWall.position.set(5, 1.75, 0);
      rightWall.rotation.y = -Math.PI / 2;
      scene.add(rightWall);

      // 4 Children's Beds
      const bedPositions = [
        { x: -3.6, z: -4 },
        { x: -3.6, z: -1.5 },
        { x: 3.6, z: -4 },
        { x: 3.6, z: -1.5 },
      ];
      bedPositions.forEach((pos, idx) => {
        const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 2.2), new THREE.MeshStandardMaterial({ color: 0x1f1f22 }));
        bedFrame.position.set(pos.x, 0.25, pos.z);
        scene.add(bedFrame);

        const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.3, 2.1), new THREE.MeshStandardMaterial({ color: 0x3d3835 }));
        mattress.position.set(pos.x, 0.5, pos.z);
        scene.add(mattress);

        // Bed interactive
        interactables.push({ mesh: bedFrame, id: `children_bed_${idx + 1}`, prompt: `Search Bed ${idx + 1}`, label: `Child's Bed (${idx + 1})` });
      });

      // Victorian Dressing Table & Broken Mirror
      const desk = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 0.9), woodMat);
      desk.position.set(0, 0.4, -5.4);
      scene.add(desk);

      const mirrorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, 0.1), new THREE.MeshStandardMaterial({ color: 0x2b1e15 }));
      mirrorFrame.position.set(0, 1.8, -5.5);
      scene.add(mirrorFrame);

      const mirrorGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.4), new THREE.MeshStandardMaterial({ color: 0x556677, roughness: 0.15, metalness: 0.8 }));
      mirrorGlass.position.set(0, 1.8, -5.44);
      scene.add(mirrorGlass);
      interactables.push({ mesh: mirrorGlass, id: 'children_mirror', prompt: 'Gaze into Cracked Mirror', label: 'Cracked Ornate Mirror' });

      // The Nursery Music Box on Desk
      const musicBox = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.3), new THREE.MeshStandardMaterial({ color: 0x8b5a2b, metalness: 0.4 }));
      musicBox.position.set(0.3, 0.95, -5.3);
      scene.add(musicBox);
      interactables.push({ mesh: musicBox, id: 'nursery_music_box', prompt: 'Wind & Play Music Box', label: 'Nursery Music Box' });

      // Diary
      const diary = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.25), new THREE.MeshStandardMaterial({ color: 0x5a1818 }));
      diary.position.set(-0.35, 0.85, -5.3);
      scene.add(diary);
      interactables.push({ mesh: diary, id: 'evelyn_diary', prompt: 'Read Evelyn\'s Diary', label: 'Little Diary' });

    } else if (currentArea === 'area_04_recording_room') {
      stateRef.current.playerPos.set(0, 1.6, 4);

      const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), woodMat);
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);

      const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), ceilingMat);
      ceiling.position.y = 3.2;
      ceiling.rotation.x = Math.PI / 2;
      scene.add(ceiling);

      const backWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.2), wallMat);
      backWall.position.set(0, 1.6, -5);
      scene.add(backWall);

      const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.2), wallMat);
      leftWall.position.set(-5, 1.6, 0);
      leftWall.rotation.y = Math.PI / 2;
      scene.add(leftWall);

      const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.2), wallMat);
      rightWall.position.set(5, 1.6, 0);
      rightWall.rotation.y = -Math.PI / 2;
      scene.add(rightWall);

      // CRT Television and VHS VCR Cart
      const cart = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 1.0), new THREE.MeshStandardMaterial({ color: 0x222222 }));
      cart.position.set(0, 0.45, -3.8);
      scene.add(cart);

      // CRT TV Monitor
      const tvBody = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.8, 0.7), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
      tvBody.position.set(0, 1.3, -3.8);
      scene.add(tvBody);

      const crtScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.6), new THREE.MeshBasicMaterial({ color: 0x112233 }));
      crtScreen.position.set(0, 1.3, -3.44);
      scene.add(crtScreen);

      // VHS Player Slot
      const vhsPlayer = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.18, 0.4), new THREE.MeshStandardMaterial({ color: 0x0a0a0a }));
      vhsPlayer.position.set(0, 0.82, -3.5);
      scene.add(vhsPlayer);

      interactables.push({ mesh: crtScreen, id: 'crt_tv_player', prompt: 'Insert Tape: "DO NOT WATCH"', label: 'CRT Surveillance Monitor' });

      // Black Candle on Side Desk
      const sideTable = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 0.8), woodMat);
      sideTable.position.set(-3.5, 0.4, -3);
      scene.add(sideTable);

      const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.3), new THREE.MeshStandardMaterial({ color: 0x050505 }));
      candle.position.set(-3.5, 0.95, -3);
      scene.add(candle);
      interactables.push({ mesh: candle, id: 'pickup_black_candle', prompt: 'Take Tallow Black Candle', label: 'Black Candle' });

    } else if (currentArea === 'area_05_hidden_hallway') {
      stateRef.current.playerPos.set(0, 1.6, 8);

      // Long narrow impossible hallway
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(4, 24), woodMat);
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);

      const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(4, 24), ceilingMat);
      ceiling.position.y = 3.2;
      ceiling.rotation.x = Math.PI / 2;
      scene.add(ceiling);

      const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(24, 3.2), wallMat);
      leftWall.position.set(-2, 1.6, 0);
      leftWall.rotation.y = Math.PI / 2;
      scene.add(leftWall);

      const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(24, 3.2), wallMat);
      rightWall.position.set(2, 1.6, 0);
      rightWall.rotation.y = -Math.PI / 2;
      scene.add(rightWall);

      // Shifting doors on sides
      for (let z = -8; z <= 6; z += 4) {
        const door = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.4, 1.2), new THREE.MeshStandardMaterial({ color: 0x1f140e }));
        door.position.set(-1.95, 1.2, z);
        scene.add(door);
      }

      // The Disturbing Photo of the PLAYER from 1924!
      const photoFrame = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.8, 0.6), new THREE.MeshStandardMaterial({ color: 0x332211 }));
      photoFrame.position.set(1.96, 1.8, 1);
      scene.add(photoFrame);

      const photoMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.7), new THREE.MeshBasicMaterial({ color: 0xc4baa9 }));
      photoMesh.position.set(1.92, 1.8, 1);
      photoMesh.rotation.y = -Math.PI / 2;
      scene.add(photoMesh);
      interactables.push({ mesh: photoMesh, id: 'hallway_player_photo', prompt: 'Examine Framed Portrait', label: 'Disturbing 1924 Photograph' });

      // Door at end to Ritual Room
      const cryptDoor = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.6, 0.2), new THREE.MeshStandardMaterial({ map: stoneTex, color: 0x222225 }));
      cryptDoor.position.set(0, 1.3, -11.9);
      scene.add(cryptDoor);
      interactables.push({ mesh: cryptDoor, id: 'crypt_door', prompt: 'Descend to Subterranean Chamber', label: 'Crypt Iron Arch' });

      // Ominous silhouette at end of corridor!
      const shadowGeo = new THREE.CylinderGeometry(0.25, 0.35, 1.8, 12);
      const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.85 });
      const creature = new THREE.Mesh(shadowGeo, shadowMat);
      creature.position.set(0, 0.9, -9);
      scene.add(creature);
      creatureObj = creature;

    } else if (currentArea === 'area_06_ritual_room') {
      stateRef.current.playerPos.set(0, 1.6, 5);

      // Deep stone ritual crypt
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.7 }));
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);

      const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshStandardMaterial({ map: stoneTex }));
      ceiling.position.y = 4.5;
      ceiling.rotation.x = Math.PI / 2;
      scene.add(ceiling);

      const wallMatCrypt = new THREE.MeshStandardMaterial({ map: stoneTex });
      const backWall = new THREE.Mesh(new THREE.PlaneGeometry(16, 4.5), wallMatCrypt);
      backWall.position.set(0, 2.25, -8);
      scene.add(backWall);

      const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(16, 4.5), wallMatCrypt);
      leftWall.position.set(-8, 2.25, 0);
      leftWall.rotation.y = Math.PI / 2;
      scene.add(leftWall);

      const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(16, 4.5), wallMatCrypt);
      rightWall.position.set(8, 2.25, 0);
      rightWall.rotation.y = -Math.PI / 2;
      scene.add(rightWall);

      // 4 Cardinal Stone Altars (North, East, South, West)
      const altars = [
        { id: 'altar_north', name: 'Northern Altar (Black Candle)', pos: [0, 0.5, -4] },
        { id: 'altar_east', name: 'Eastern Altar (Family Pendant)', pos: [4, 0.5, 0] },
        { id: 'altar_south', name: 'Southern Altar (Music Box)', pos: [0, 0.5, 3] },
        { id: 'altar_west', name: 'Western Altar (Blackwood Seal)', pos: [-4, 0.5, 0] },
      ];

      altars.forEach((altar) => {
        const altarMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 1.0, 16), new THREE.MeshStandardMaterial({ map: stoneTex, color: 0x333338 }));
        altarMesh.position.set(altar.pos[0], altar.pos[1], altar.pos[2]);
        scene.add(altarMesh);

        // Candle on altar
        const candleLight = new THREE.PointLight(0xff4411, 0.5, 4);
        candleLight.position.set(altar.pos[0], altar.pos[1] + 0.7, altar.pos[2]);
        scene.add(candleLight);

        interactables.push({ mesh: altarMesh, id: altar.id, prompt: `Interact with ${altar.name}`, label: altar.name });
      });

      // The Gigantic Monolithic Sealed Wall
      const sealWall = new THREE.Mesh(new THREE.BoxGeometry(4, 3.6, 0.4), new THREE.MeshStandardMaterial({ color: 0x181820, metalness: 0.5 }));
      sealWall.position.set(0, 1.8, -7.8);
      scene.add(sealWall);
      interactables.push({ mesh: sealWall, id: 'monolith_seal', prompt: 'Examine Ancient Sigil Wall', label: 'Eldritch Monolith' });

    } else if (currentArea === 'area_07_creatures_lair') {
      stateRef.current.playerPos.set(0, 1.6, 6);

      // Unstable Crimson / Warping Corridor
      scene.fog = new THREE.FogExp2(0x1a0505, 0.12);

      const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 20), new THREE.MeshStandardMaterial({ color: 0x110808, roughness: 0.3 }));
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);

      const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(8, 20), ceilingMat);
      ceiling.position.y = 3.6;
      ceiling.rotation.x = Math.PI / 2;
      scene.add(ceiling);

      const wallMatRed = new THREE.MeshStandardMaterial({ map: wallTex, color: 0x551111 });
      const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 3.6), wallMatRed);
      leftWall.position.set(-4, 1.8, 0);
      leftWall.rotation.y = Math.PI / 2;
      scene.add(leftWall);

      const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 3.6), wallMatRed);
      rightWall.position.set(4, 1.8, 0);
      rightWall.rotation.y = -Math.PI / 2;
      scene.add(rightWall);

      // Pulsing Crimson Emergency Lights
      const redLight = new THREE.PointLight(0xff1100, 1.8, 12);
      redLight.position.set(0, 3, 0);
      scene.add(redLight);

      // The Woman in the Walls pursuing from behind!
      const entityGroup = new THREE.Group();
      entityGroup.position.set(0, 1.2, 10);

      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 1.7, 8), new THREE.MeshBasicMaterial({ color: 0x050505 }));
      entityGroup.add(torso);

      // Glowing eerie eyes
      const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffeebb });
      const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
      eye1.position.set(-0.1, 0.7, -0.2);
      const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
      eye2.position.set(0.1, 0.7, -0.2);
      entityGroup.add(eye1);
      entityGroup.add(eye2);

      scene.add(entityGroup);
      creatureObj = entityGroup;

      // Two Exits at end of corridor:
      // Left: Altar of the Eternal Seal
      const sealGate = new THREE.Mesh(new THREE.BoxGeometry(2, 2.8, 0.2), new THREE.MeshStandardMaterial({ color: 0x334466 }));
      sealGate.position.set(-2, 1.4, -9.8);
      scene.add(sealGate);
      interactables.push({ mesh: sealGate, id: 'action_restore_seal', prompt: 'RESTORE THE ETERNAL SEAL', label: 'Sacrificial Altar of Binding' });

      // Right: Shattered Exit Doors into foggy night
      const exitDoor = new THREE.Mesh(new THREE.BoxGeometry(2, 2.8, 0.2), new THREE.MeshStandardMaterial({ color: 0x442222 }));
      exitDoor.position.set(2, 1.4, -9.8);
      scene.add(exitDoor);
      interactables.push({ mesh: exitDoor, id: 'action_escape_mansion', prompt: 'BREAK THROUGH EXIT DOORS', label: 'Shattered Mansion Exit' });
    }

    stateRef.current.camera = camera;
    stateRef.current.scene = scene;
    stateRef.current.renderer = renderer;
    stateRef.current.flashlight = flashlight;
    stateRef.current.interactables = interactables;
    stateRef.current.pendulum = pendulumObj;
    stateRef.current.dustParticles = dustParticles;
    stateRef.current.creatureEntity = creatureObj;

    // Window Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !stateRef.current.camera || !stateRef.current.renderer) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      stateRef.current.camera.aspect = w / h;
      stateRef.current.camera.updateProjectionMatrix();
      stateRef.current.renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [currentArea, settings.graphicsQuality, settings.brightness]);

  // Main 60fps Animation & Game Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const state = stateRef.current;
      const props = propsRef.current;
      if (!state.camera || !state.scene || !state.renderer) return;

      // Update Look Rotation (Yaw & Pitch)
      if (props.lookDelta.x !== 0 || props.lookDelta.y !== 0) {
        const sens = (props.settings.mouseSensitivity / 100) * 0.035;
        state.yaw -= props.lookDelta.x * sens;
        state.pitch -= props.lookDelta.y * sens;
        state.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, state.pitch));
      }

      // Apply camera orientation
      const euler = new THREE.Euler(0, 0, 0, 'YXZ');
      euler.y = state.yaw;
      euler.x = state.pitch;
      state.camera.quaternion.setFromEuler(euler);

      // Player Movement
      const move = props.moveVector;
      const speed = (props.isRunning ? 4.2 : 2.5) * delta;

      if (move.x !== 0 || move.y !== 0) {
        // Calculate forward and right directions based on yaw
        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), state.yaw);
        const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), state.yaw);

        const moveDir = new THREE.Vector3();
        moveDir.addScaledVector(forward, move.y);
        moveDir.addScaledVector(right, move.x);
        moveDir.normalize();

        const newPos = state.playerPos.clone().addScaledVector(moveDir, speed);

        // Simple Room Boundary Collision
        const boundX = currentArea === 'area_05_hidden_hallway' ? 1.6 : 5.2;
        const boundZMin = currentArea === 'area_05_hidden_hallway' ? -11 : -6.2;
        const boundZMax = currentArea === 'area_05_hidden_hallway' ? 10 : 6.2;

        if (Math.abs(newPos.x) < boundX) state.playerPos.x = newPos.x;
        if (newPos.z > boundZMin && newPos.z < boundZMax) state.playerPos.z = newPos.z;

        // Head Bobbing & Footsteps
        state.headBob += delta * (props.isRunning ? 14 : 9);
        const bobOffset = Math.sin(state.headBob) * 0.04;
        state.camera.position.y = 1.6 + bobOffset;

        // Step sound trigger
        if (time - state.lastStepTime > (props.isRunning ? 320 : 540)) {
          state.lastStepTime = time;
          props.onFootstep();
        }
      } else {
        // Return to resting camera height
        state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 1.6, delta * 8);
      }

      state.camera.position.x = state.playerPos.x;
      state.camera.position.z = state.playerPos.z;

      // Subtle Camera Shake during jump scares / horror events
      if (props.triggerScare || state.cameraShake > 0) {
        const shakeMag = (props.triggerScare ? 0.08 : state.cameraShake) * (props.settings.cameraShake ? 1 : 0.2);
        state.camera.position.x += (Math.random() - 0.5) * shakeMag;
        state.camera.position.y += (Math.random() - 0.5) * shakeMag;
        state.cameraShake = Math.max(0, state.cameraShake - delta * 0.5);
      }

      // Flashlight Flickering
      if (state.flashlight) {
        if (props.activeHorrorEvent === 'lights_flicker' && !props.settings.reducedFlashing) {
          state.flashlight.intensity = Math.random() > 0.4 ? 2.8 : 0.4;
        } else {
          // Subtle realistic electrical fluctuation
          state.flashlight.intensity = 2.7 + Math.sin(time * 0.005) * 0.15;
        }
      }

      // Grandfather Clock Pendulum animation
      if (state.pendulum) {
        state.pendulum.rotation.z = Math.sin(time * 0.003) * 0.3;
      }

      // Dust particles slow drift
      if (state.dustParticles) {
        state.dustParticles.rotation.y += delta * 0.02;
      }

      // Creature chase AI in Area 7
      if (currentArea === 'area_07_creatures_lair' && state.creatureEntity) {
        // Creature creeps forward toward player
        const dist = state.playerPos.distanceTo(state.creatureEntity.position);
        if (dist > 1.2) {
          state.creatureEntity.position.z -= delta * 1.8;
          state.creatureEntity.position.x = Math.sin(time * 0.004) * 1.2;
        }
      }

      // Raycasting for interactive objects centered in crosshair
      state.raycaster.setFromCamera(new THREE.Vector2(0, 0), state.camera);
      let closestHit: { id: string; prompt: string; label: string } | null = null;
      let minDistance = 3.5; // Interaction reach distance

      for (const item of state.interactables) {
        const intersects = state.raycaster.intersectObject(item.mesh, true);
        if (intersects.length > 0 && intersects[0].distance < minDistance) {
          minDistance = intersects[0].distance;
          closestHit = { id: item.id, prompt: item.prompt, label: item.label };
        }
      }

      props.onLookAt(closestHit);

      // Render Scene
      state.renderer.render(state.scene, state.camera);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [currentArea]);

  return (
    <div
      ref={containerRef}
      id="three-horror-canvas"
      className="absolute inset-0 w-full h-full cursor-crosshair overflow-hidden touch-none select-none bg-black"
    />
  );
};
