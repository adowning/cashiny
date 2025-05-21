export interface AnimationFrameData {
  filename: string; // Original filename, might not be directly used if x,y,w,h are absolute
  frame: { x: number; y: number; w: number; h: number }; // Position and size in the spritesheet
  rotated: boolean; // If the frame is rotated in the spritesheet
  trimmed: boolean; // If whitespace was trimmed
  spriteSourceSize: { x: number; y: number; w: number; h: number }; // Actual size and offset of the sprite content
  sourceSize: { w: number; h: number }; // Original size of the sprite before trimming
}

export interface SpriteData {
  frames: AnimationFrameData[];
  meta?: {
    app?: string;
    version?: string;
    image?: string; // Filename of the spritesheet image
    format?: string;
    size?: { w: number; h: number }; // Total size of the spritesheet image
    scale?: string;
    // TexturePacker or other tools might add more meta data
  };
}

export interface AnimationConfig {
  name: string;
  spritesheetUrl: string;
  spriteDataUrl: string; // URL to the JSON file containing SpriteData
  fps?: number;
  loop?: boolean;
  width?: number; // Optional: default display width if not from spriteData
  height?: number; // Optional: default display height
  onComplete?: () => void; // Callback when a non-looping animation finishes
}

// Type for messages coming from WebSocket to control animations
export interface AnimationControlPayload {
  name: string; // Name of the animation to control
  action: 'play' | 'stop';
  options?: {
    // Optional parameters for 'play' action
    loop?: boolean;
    fps?: number;
    onComplete?: () => void; // Server can't send functions, but name of a predefined callback?
  };
}
export declare const ANIMATION_TYPE: {
  readonly NONE: 'none';
  readonly SUCCESS: 'success';
  readonly ERROR: 'error';
  readonly WARNING: 'warning';
  readonly INFO: 'info';
};

export type AnimationType = (typeof ANIMATION_TYPE)[keyof typeof ANIMATION_TYPE];

export interface AnimationData {
  name: string; // A unique identifier or descriptive name for the animation
  path: string; // The path to the Lottie JSON animation file (e.g., '/anim/success.json')
  type: AnimationType; // Categorization of the animation (e.g., success, error)
  description?: string; // Optional description of what the animation represents
  loop?: boolean; // Whether the animation should loop (default usually false)
  autoplay?: boolean; // Whether the animation should play automatically on load (default usually false)
  renderer?: 'svg' | 'canvas' | 'html'; // Preferred Lottie renderer (player usually defaults)
  player?: 'lottie' | 'rive'; // Specifies the animation player technology (e.g., 'lottie')
}

/**
 * This interface is likely intended for a Vue component that would
 * consume and display an animation based on AnimationData.
 */
export interface AnimationComponentProps extends AnimationData {
  show: boolean; // To control the visibility/rendering of the animation component
  onCompleted?: () => void; // Callback when the animation completes (if not looping)
  onLoaded?: () => void; // Callback when the animation data has loaded
}
