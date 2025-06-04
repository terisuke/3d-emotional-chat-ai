import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Emotion } from '../types';

export class EmotionalCharacter {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private vrm: VRM | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private clock: THREE.Clock;
  private resizeObserver: ResizeObserver | null = null;
  private animationFrameId: number | null = null;
  private proceduralUpdate: ((deltaTime: number) => void) | null = null;

  constructor(private mountPoint: HTMLDivElement) {
    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();
    
    // Camera setup - positioned to show upper body from closer
    this.camera = new THREE.PerspectiveCamera(
      35,
      mountPoint.clientWidth / mountPoint.clientHeight,
      0.1,
      20
    );
    this.camera.position.set(0, 0.8, 1.5); // Much lower, slightly further back
    this.camera.lookAt(0, 0.3, 0); // Look at torso level

    this.initRenderer();
    this.initLights();
    this.loadVRMModel();
    this.animate();
  }

  private initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    this.renderer.setSize(this.mountPoint.clientWidth, this.mountPoint.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.mountPoint.appendChild(this.renderer.domElement);

    // Handle resizing
    this.resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
      }
    });
    this.resizeObserver.observe(this.mountPoint);
  }

  private initLights() {
    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1.0, 1.0, 1.0).normalize();
    this.scene.add(directionalLight);

    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
  }

  private async loadVRMModel() {
    try {
      const loader = new GLTFLoader();
      loader.register((parser) => new VRMLoaderPlugin(parser));

      const gltf = await loader.loadAsync('/assets/vrm/クラウディア.vrm');
      const vrm = gltf.userData.vrm as VRM;

      if (!vrm) {
        throw new Error('VRM not found in loaded file');
      }

      // Remove unnecessary joints for better performance
      VRMUtils.removeUnnecessaryJoints(gltf.scene);

      // Add to scene
      this.scene.add(vrm.scene);

      // Rotate if necessary (VRM 0.x models face +Z)
      VRMUtils.rotateVRM0(vrm);

      this.vrm = vrm;

      // Debug humanoid bone structure
      if (vrm.humanoid) {
        console.log('Available VRM bones:');
        const boneNames = [
          'hips', 'spine', 'chest', 'upperChest', 'neck', 'head',
          'leftShoulder', 'leftUpperArm', 'leftLowerArm', 'leftHand',
          'rightShoulder', 'rightUpperArm', 'rightLowerArm', 'rightHand'
        ];
        
        boneNames.forEach(boneName => {
          const bone = vrm.humanoid!.getNormalizedBoneNode(boneName as any);
          if (bone) {
            console.log(`✓ ${boneName}: ${bone.name}`);
          } else {
            console.log(`✗ ${boneName}: not found`);
          }
        });
      }

      // Initialize pose to avoid T-pose - BEFORE animation setup
      this.initializeCharacterPose(vrm);

      // Force update to ensure pose is applied
      vrm.update(0);

      // Setup animations AFTER pose initialization
      this.setupIdleAnimation(vrm);

      console.log('VRM model loaded successfully');
    } catch (error) {
      console.error('Error loading VRM model:', error);
      // Create fallback cube
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.y = 1;
      this.scene.add(cube);
    }
  }

  private initializeCharacterPose(vrm: VRM) {
    const humanoid = vrm.humanoid;
    if (!humanoid) return;

    console.log('Initializing character pose to avoid T-pose');

    // Get bones
    const leftUpperArm = humanoid.getNormalizedBoneNode('leftUpperArm');
    const rightUpperArm = humanoid.getNormalizedBoneNode('rightUpperArm');
    const leftLowerArm = humanoid.getNormalizedBoneNode('leftLowerArm');
    const rightLowerArm = humanoid.getNormalizedBoneNode('rightLowerArm');
    const leftShoulder = humanoid.getNormalizedBoneNode('leftShoulder');
    const rightShoulder = humanoid.getNormalizedBoneNode('rightShoulder');
    const head = humanoid.getNormalizedBoneNode('head');

    // Debug bone existence
    console.log('Bone check:', {
      leftUpperArm: !!leftUpperArm,
      rightUpperArm: !!rightUpperArm,
      leftLowerArm: !!leftLowerArm,
      rightLowerArm: !!rightLowerArm
    });

    // Lower the arms significantly more (relaxed pose)
    if (leftUpperArm) {
      // Rotate forward and down much more
      leftUpperArm.rotation.x = 0.4;   // More forward
      leftUpperArm.rotation.z = 1.2;   // Much more down (almost 70 degrees)
      console.log('Left upper arm rotated');
    }
    if (rightUpperArm) {
      // Rotate forward and down much more
      rightUpperArm.rotation.x = 0.4;   // More forward
      rightUpperArm.rotation.z = -1.2;  // Much more down (negative for right side)
      console.log('Right upper arm rotated');
    }

    // Bend elbows more naturally
    if (leftLowerArm) {
      leftLowerArm.rotation.y = 0.7;   // Even more bend
      leftLowerArm.rotation.z = 0.2;   // Slight inward rotation
      console.log('Left lower arm bent');
    }
    if (rightLowerArm) {
      rightLowerArm.rotation.y = -0.7;  // Even more bend (negative for right side)
      rightLowerArm.rotation.z = -0.2;  // Slight inward rotation
      console.log('Right lower arm bent');
    }

    // Relaxed shoulders
    if (leftShoulder) {
      leftShoulder.rotation.z = 0.2;
    }
    if (rightShoulder) {
      rightShoulder.rotation.z = -0.2;
    }

    // Slight head tilt
    if (head) {
      head.rotation.x = 0.05;
    }

    // Update the VRM to apply the pose
    vrm.update(0);
    console.log('Initial pose applied');
  }

  private setupIdleAnimation(vrm: VRM) {
    // Create animation mixer
    this.mixer = new THREE.AnimationMixer(vrm.scene);

    const humanoid = vrm.humanoid;
    if (!humanoid) return;

    const tracks: THREE.KeyframeTrack[] = [];

    // Subtle breathing animation (chest movement)
    const chest = humanoid.getNormalizedBoneNode('chest');
    if (chest) {
      const breathingTrack = new THREE.VectorKeyframeTrack(
        chest.name + '.scale',
        [0, 2, 4],
        [
          1.0, 1.0, 1.0,    // Normal
          1.02, 1.02, 1.02, // Inhale
          1.0, 1.0, 1.0     // Exhale
        ]
      );
      tracks.push(breathingTrack);
    }

    // Add arm idle animation to maintain relaxed pose
    const leftUpperArm = humanoid.getNormalizedBoneNode('leftUpperArm');
    if (leftUpperArm) {
      const leftArmTrack = new THREE.QuaternionKeyframeTrack(
        leftUpperArm.name + '.quaternion',
        [0, 2, 4, 6, 8],
        [
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.4, 0, 1.2)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.45, 0, 1.25)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.4, 0, 1.2)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.35, 0, 1.15)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.4, 0, 1.2)).toArray()
        ]
      );
      tracks.push(leftArmTrack);
    }

    const rightUpperArm = humanoid.getNormalizedBoneNode('rightUpperArm');
    if (rightUpperArm) {
      const rightArmTrack = new THREE.QuaternionKeyframeTrack(
        rightUpperArm.name + '.quaternion',
        [0, 2, 4, 6, 8],
        [
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.4, 0, -1.2)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.45, 0, -1.25)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.4, 0, -1.2)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.35, 0, -1.15)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.4, 0, -1.2)).toArray()
        ]
      );
      tracks.push(rightArmTrack);
    }

    // Subtle head movement
    const head = humanoid.getNormalizedBoneNode('head');
    if (head) {
      const headTrack = new THREE.QuaternionKeyframeTrack(
        head.name + '.quaternion',
        [0, 2, 4, 6, 8],
        [
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.05, 0, 0)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.05, 0.05, 0)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.03, 0, 0)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.05, -0.05, 0)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.05, 0, 0)).toArray()
        ]
      );
      tracks.push(headTrack);
    }

    // Subtle weight shift (hip movement)
    const hips = humanoid.getNormalizedBoneNode('hips');
    if (hips) {
      const hipTrack = new THREE.VectorKeyframeTrack(
        hips.name + '.position',
        [0, 3, 6],
        [
          0, 0, 0,
          0.02, 0, 0,
          0, 0, 0
        ]
      );
      tracks.push(hipTrack);
    }

    if (tracks.length > 0) {
      // Create animation clip
      const clip = new THREE.AnimationClip('idle', 8.0, tracks);
      
      // Play the animation
      const action = this.mixer.clipAction(clip);
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.play();
    }

    // Setup procedural animation
    this.proceduralUpdate = this.createProceduralAnimation(vrm);
  }

  private createProceduralAnimation(vrm: VRM) {
    let elapsedTime = 0;
    let nextBlinkTime = Math.random() * 3 + 2; // Random blink every 2-5 seconds

    return (deltaTime: number) => {
      elapsedTime += deltaTime;

      const humanoid = vrm.humanoid;
      if (!humanoid) return;

      // Procedural breathing
      const spine = humanoid.getNormalizedBoneNode('spine');
      if (spine) {
        const breathingIntensity = Math.sin(elapsedTime * 0.5) * 0.01;
        spine.rotation.x = breathingIntensity;
      }

      // Procedural subtle sway
      const upperChest = humanoid.getNormalizedBoneNode('upperChest');
      if (upperChest) {
        const swayAngle = Math.sin(elapsedTime * 0.3) * 0.01;
        upperChest.rotation.z = swayAngle;
      }

      // Blinking
      if (elapsedTime > nextBlinkTime) {
        this.animateBlink(vrm);
        nextBlinkTime = elapsedTime + Math.random() * 3 + 2;
      }
    };
  }

  private animateBlink(vrm: VRM) {
    const startTime = performance.now();
    const blinkDuration = 150; // milliseconds

    const updateBlink = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / blinkDuration, 1.0);

      let blinkValue = 0;
      if (progress < 0.5) {
        blinkValue = progress * 2; // Close eyes
      } else {
        blinkValue = 2 - progress * 2; // Open eyes
      }

      if (vrm.expressionManager) {
        vrm.expressionManager.setValue('blink', blinkValue);
      }

      if (progress < 1.0) {
        requestAnimationFrame(updateBlink);
      }
    };

    updateBlink();
  }

  public updateCurrentEmotion(emotion: Emotion) {
    if (!this.vrm || !this.vrm.expressionManager) return;

    // Reset all expressions
    const expressions = ['happy', 'angry', 'sad', 'relaxed', 'surprised'];
    expressions.forEach(expr => {
      this.vrm!.expressionManager!.setValue(expr, 0);
    });

    // Set emotion
    switch (emotion) {
      case Emotion.HAPPY:
        this.vrm.expressionManager.setValue('happy', 1.0);
        break;
      case Emotion.SAD:
        this.vrm.expressionManager.setValue('sad', 1.0);
        break;
      case Emotion.ANGRY:
        this.vrm.expressionManager.setValue('angry', 1.0);
        break;
      case Emotion.SURPRISED:
        this.vrm.expressionManager.setValue('surprised', 1.0);
        break;
      case Emotion.THINKING:
        this.vrm.expressionManager.setValue('relaxed', 0.7);
        break;
      case Emotion.NEUTRAL:
      default:
        // Keep all at 0 for neutral
        break;
    }
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const deltaTime = this.clock.getDelta();

    // Update animations
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }

    // Update procedural animation
    if (this.proceduralUpdate) {
      this.proceduralUpdate(deltaTime);
    }

    // Update VRM
    if (this.vrm) {
      this.vrm.update(deltaTime);
    }

    // Render
    this.renderer.render(this.scene, this.camera);
  };

  public dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.mixer) {
      this.mixer.stopAllAction();
    }

    this.scene.clear();
    this.renderer.dispose();
    
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}