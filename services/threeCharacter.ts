import * as THREE from 'three';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { VRMAnimationLoaderPlugin, VRMAnimation } from '@pixiv/three-vrm-animation';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Emotion } from '../types';

// VRM Loading Options Interface
interface VRMLoadOptions {
  castShadow?: boolean;
  receiveShadow?: boolean;
  frustumCulled?: boolean;
  renderOrder?: number;
}

// VRM BlendShape Controller for Expression Management
class VRMBlendShapeController {
  private vrm: VRM;
  private animationFrame: number | null = null;

  constructor(vrm: VRM) {
    this.vrm = vrm;
  }

  setExpression(expressionName: string, weight: number): void {
    if (!this.vrm.expressionManager) {
      console.warn('VRM expressionManager not available');
      return;
    }

    try {
      const clampedWeight = Math.max(0, Math.min(1, weight));
      this.vrm.expressionManager.setValue(expressionName, clampedWeight);
      console.log(`Set expression "${expressionName}" to weight ${clampedWeight}`);
    } catch (error) {
      console.warn(`Error setting expression "${expressionName}":`, error);
    }
  }

  setExpressions(expressions: Record<string, number>): void {
    Object.entries(expressions).forEach(([name, weight]) => {
      this.setExpression(name, weight);
    });
  }

  resetToNeutral(): void {
    if (!this.vrm.expressionManager) return;

    // Reset all expressions to 0
    const expressions = ['happy', 'sad', 'angry', 'surprised', 'relaxed'];
    expressions.forEach(expr => {
      this.setExpression(expr, 0);
    });

    // Set neutral to 1
    this.setExpression('neutral', 1.0);
  }

  dispose(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}

export class EmotionalCharacter {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private vrm: VRM | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private idleClip: THREE.AnimationClip | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private animationFrameId: number | null = null;
  private clock: THREE.Clock;
  private blendShapeController: VRMBlendShapeController | null = null;

  constructor(private mountPoint: HTMLDivElement) {
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    
    // Adjust camera for VRM character display - even closer and lower
    this.camera = new THREE.PerspectiveCamera(60, mountPoint.clientWidth / mountPoint.clientHeight, 0.1, 20);
    this.camera.position.set(0, 0.3, 1.0); // Even closer and lower angle

    this.initRenderer(mountPoint);
    this.initLights();
    this.loadVRMModel();
    
    this.animate();
  }

  private initRenderer(mountPoint: HTMLDivElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(mountPoint.clientWidth, mountPoint.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountPoint.appendChild(this.renderer.domElement);

    this.resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (this.renderer && this.camera) {
          this.renderer.setSize(width, height);
          this.camera.aspect = width / height;
          this.camera.updateProjectionMatrix();
        }
      }
    });
    this.resizeObserver.observe(mountPoint);
  }

  private initLights() {
    // Ambient light for overall illumination - 1.5x brighter
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.05);
    this.scene.add(ambientLight);
    
    // Main directional light - 1.5x brighter
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(1, 1, 0.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 10;
    directionalLight.shadow.camera.left = -2;
    directionalLight.shadow.camera.right = 2;
    directionalLight.shadow.camera.top = 2;
    directionalLight.shadow.camera.bottom = -2;
    this.scene.add(directionalLight);

    // Fill light to reduce harsh shadows - 1.5x brighter
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-1, 0, -1);
    this.scene.add(fillLight);
  }

  // Working VRM Loading Implementation from engineer-cafe-navigator
  private async loadVRMModel() {
    try {
      const options: VRMLoadOptions = {
        castShadow: true,
        receiveShadow: true,
        frustumCulled: false,
        renderOrder: 0
      };

      // Use the working VRM loading approach
      this.vrm = await this.loadVRM('/assets/vrm/sakura.vrm', options);
      
      if (this.vrm) {
        console.log('VRM loaded successfully using working method');
        
        // Add to scene first, THEN apply any additional positioning
        this.scene.add(this.vrm.scene);
        
        // Apply minimal positioning AFTER scene addition (aituber-kit approach)
        this.vrm.scene.scale.setScalar(1.0);
        this.vrm.scene.position.set(0, -0.8, 0);
        
        // Initialize BlendShape controller
        this.blendShapeController = new VRMBlendShapeController(this.vrm);
        this.blendShapeController.resetToNeutral();
        
        // Initialize animation mixer (aituber-kit approach)
        this.mixer = new THREE.AnimationMixer(this.vrm.scene);
        
        // Try to load external VRM animation first (aituber-kit style)
        await this.loadVRMAnimation();
        
        console.log('VRM model fully initialized');
      } else {
        console.error('Failed to load VRM model');
        this.createFallbackCharacter();
      }
    } catch (error) {
      console.error('Error loading VRM model:', error);
      this.createFallbackCharacter();
    }
  }

  // Working VRM Loading Method adapted from aituber-kit
  private async loadVRM(url: string, options: VRMLoadOptions = {}): Promise<VRM> {
    try {
      const loader = new GLTFLoader();
      loader.register((parser) => new VRMLoaderPlugin(parser));

      const gltf = await loader.loadAsync(url);
      const vrm = gltf.userData.vrm as VRM;

      if (!vrm) {
        throw new Error('Failed to load VRM from GLTF');
      }

      // Apply options using working utility methods
      if (options.castShadow !== undefined) {
        this.setShadowCasting(vrm, options.castShadow);
      }

      if (options.receiveShadow !== undefined) {
        this.setShadowReceiving(vrm, options.receiveShadow);
      }

      if (options.frustumCulled !== undefined) {
        this.setFrustumCulled(vrm, options.frustumCulled);
      }

      if (options.renderOrder !== undefined) {
        this.setRenderOrder(vrm, options.renderOrder);
      }

      // Add explicit scene naming (aituber-kit approach)
      vrm.scene.name = 'VRMRoot';
      
      // Apply VRMUtils rotation (aituber-kit approach - simple and effective)
      console.log('Applying VRMUtils.rotateVRM0...');
      VRMUtils.rotateVRM0(vrm);
      
      console.log('VRM initialization completed with aituber-kit approach');
      return vrm;
    } catch (error) {
      throw new Error(`Failed to load VRM: ${error}`);
    }
  }

  // Working utility methods from engineer-cafe-navigator
  private setShadowCasting(vrm: VRM, castShadow: boolean): void {
    vrm.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = castShadow;
      }
    });
  }

  private setShadowReceiving(vrm: VRM, receiveShadow: boolean): void {
    vrm.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.receiveShadow = receiveShadow;
      }
    });
  }

  private setFrustumCulled(vrm: VRM, frustumCulled: boolean): void {
    vrm.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.frustumCulled = frustumCulled;
      }
    });
  }

  private setRenderOrder(vrm: VRM, renderOrder: number): void {
    vrm.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.renderOrder = renderOrder;
      }
    });
  }

  // Load VRM Animation (aituber-kit approach)
  private async loadVRMAnimation() {
    if (!this.vrm || !this.mixer) return;
    
    try {
      console.log('Attempting to load VRM animation file...');
      
      // Try to load external VRM animation file
      const loader = new GLTFLoader();
      loader.register((parser) => new VRMAnimationLoaderPlugin(parser));
      
      const vrmAnimationUrl = '/assets/vrm/idle_loop.vrma';
      const gltf = await loader.loadAsync(vrmAnimationUrl);
      const vrmAnimations = gltf.userData.vrmAnimations as VRMAnimation[];
      
      if (vrmAnimations && vrmAnimations.length > 0) {
        // Create animation clip from VRM animation
        const clip = THREE.AnimationClip.findByName(gltf.animations, 'idle') || gltf.animations[0];
        
        if (clip) {
          const action = this.mixer.clipAction(clip);
          action.setLoop(THREE.LoopRepeat, Infinity);
          action.play();
          
          console.log('VRM animation loaded and playing successfully');
          return;
        }
      }
    } catch (error) {
      console.log('External VRM animation not found, using fallback:', error);
    }
    
    // Fallback to procedural animation
    this.createFallbackAnimation();
  }



  private createFallbackAnimation() {
    if (!this.vrm || !this.mixer) return;
    
    console.log('Creating enhanced fallback idle animation');
    
    const humanoid = this.vrm.humanoid;
    if (!humanoid) {
      console.warn('No humanoid found, cannot create bone animations');
      return;
    }
    
    const duration = 6;
    const tracks = [];
    
    // Debug which bones are actually available
    const availableBones = ['chest', 'head', 'leftUpperArm', 'rightUpperArm', 'spine'];
    console.log('Checking available bones for animation:');
    
    availableBones.forEach(boneName => {
      const bone = humanoid.getRawBoneNode(boneName as any);
      if (bone) {
        console.log(`✓ Found bone: ${boneName} -> ${bone.name}`);
      } else {
        console.log(`✗ Missing bone: ${boneName}`);
      }
    });
    
    // Breathing animation for chest
    const chestBone = humanoid.getRawBoneNode('chest' as any);
    if (chestBone) {
      const times = [0, 1.5, 3, 4.5, 6];
      const rotationValues = [
        0, 0, 0, 1,        // 0s - neutral
        0.02, 0, 0, 0.9998, // 1.5s - slight expansion
        0, 0, 0, 1,        // 3s - back to neutral
        0.02, 0, 0, 0.9998, // 4.5s - slight expansion
        0, 0, 0, 1         // 6s - back to neutral
      ];
      
      tracks.push(new THREE.QuaternionKeyframeTrack(
        chestBone.name + '.quaternion',
        times,
        rotationValues
      ));
      console.log(`Added chest breathing animation for: ${chestBone.name}`);
    }
    
    // Gentle head movement
    const headBone = humanoid.getRawBoneNode('head' as any);
    if (headBone) {
      const times = [0, 2, 4, 6];
      const rotationValues = [
        0, 0, 0, 1,           // 0s - neutral
        0.03, 0, 0, 0.9995,   // 2s - slight nod
        -0.02, 0, 0, 0.9998,  // 4s - slight back
        0, 0, 0, 1            // 6s - back to neutral
      ];
      
      tracks.push(new THREE.QuaternionKeyframeTrack(
        headBone.name + '.quaternion',
        times,
        rotationValues
      ));
      console.log(`Added head movement animation for: ${headBone.name}`);
    }
    
    // Subtle arm sway
    const leftArmBone = humanoid.getRawBoneNode('leftUpperArm' as any);
    if (leftArmBone) {
      const times = [0, 3, 6];
      const rotationValues = [
        0, 0, 0.05, 0.9988,   // 0s - slight away from body
        0, 0, 0.08, 0.9968,   // 3s - slightly more
        0, 0, 0.05, 0.9988    // 6s - back
      ];
      
      tracks.push(new THREE.QuaternionKeyframeTrack(
        leftArmBone.name + '.quaternion',
        times,
        rotationValues
      ));
      console.log(`Added left arm animation for: ${leftArmBone.name}`);
    }
    
    const rightArmBone = humanoid.getRawBoneNode('rightUpperArm' as any);
    if (rightArmBone) {
      const times = [0, 3, 6];
      const rotationValues = [
        0, 0, -0.05, 0.9988,  // 0s - slight away from body
        0, 0, -0.08, 0.9968,  // 3s - slightly more
        0, 0, -0.05, 0.9988   // 6s - back
      ];
      
      tracks.push(new THREE.QuaternionKeyframeTrack(
        rightArmBone.name + '.quaternion',
        times,
        rotationValues
      ));
      console.log(`Added right arm animation for: ${rightArmBone.name}`);
    }
    
    if (tracks.length > 0) {
      this.idleClip = new THREE.AnimationClip('enhanced_idle', duration, tracks);
      
      const action = this.mixer.clipAction(this.idleClip);
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.play();
      
      console.log(`Enhanced fallback animation created with ${tracks.length} tracks and playing`);
    } else {
      console.warn('No bones found for fallback animation');
    }
  }


  private createFallbackCharacter() {
    console.log('Creating fallback sphere character');
    
    const geometry = new THREE.SphereGeometry(0.8, 32, 32);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x808080,
      metalness: 0.3,
      roughness: 0.6,
    });
    const fallbackMesh = new THREE.Mesh(geometry, material);
    fallbackMesh.position.y = 1.5; // Position at head level
    this.scene.add(fallbackMesh);
  }

  public updateCurrentEmotion(emotion: Emotion) {
    
    if (!this.blendShapeController) {
      return; // Skip if BlendShape controller not available
    }

    // Use the working BlendShape controller for expression management
    const expressions: Record<string, number> = {};
    
    switch (emotion) {
      case Emotion.HAPPY:
        expressions.happy = 1.0;
        break;
      case Emotion.SAD:
        expressions.sad = 1.0;
        break;
      case Emotion.ANGRY:
        expressions.angry = 1.0;
        break;
      case Emotion.SURPRISED:
        expressions.surprised = 1.0;
        break;
      case Emotion.THINKING:
        expressions.relaxed = 0.7;
        break;
      case Emotion.NEUTRAL:
      default:
        expressions.neutral = 1.0;
        break;
    }
    
    this.blendShapeController.setExpressions(expressions);
  }

  private animate = (_time?: number) => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    
    const deltaTime = this.clock.getDelta();
    
    // Update animation mixer
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
    
    // Update VRM
    if (this.vrm) {
      this.vrm.update(deltaTime);
    }
    
    // Render the scene
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  public dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    if (this.resizeObserver && this.mountPoint) {
      this.resizeObserver.unobserve(this.mountPoint);
    }
    
    if (this.mixer) {
      this.mixer.stopAllAction();
    }
    
    if (this.blendShapeController) {
      this.blendShapeController.dispose();
    }
    
    // VRM disposal is handled by Three.js scene cleanup
    
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.mountPoint && this.mountPoint.contains(this.renderer.domElement)) {
        this.mountPoint.removeChild(this.renderer.domElement);
      }
    }
    
    this.scene.clear();
  }
}