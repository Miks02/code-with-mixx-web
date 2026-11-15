declare module 'vanta/dist/vanta.fog.min' {
  type VantaEffect = {
    destroy(): void;
    resize(): void;
    setOptions(options: Record<string, unknown>): void;
  };

  type VantaFogOptions = {
    el: HTMLElement;
    THREE: unknown;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    highlightColor?: number;
    midtoneColor?: number;
    lowlightColor?: number;
    baseColor?: number;
    blurFactor?: number;
    speed?: number;
    zoom?: number;
  };

  const FOG: (options: VantaFogOptions) => VantaEffect;
  export default FOG;
}
