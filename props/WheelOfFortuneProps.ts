import { WheelSegment } from "./WheelSegment";

export interface WheelOfFortuneProps {
  segments: WheelSegment[];
  spinning: boolean;
  targetSegementId: number | undefined;
  spinDuration?: number;
  resetDuration?: number;
  spinPerSecond?: number;
  spinSound?: string;
  resetSound?: string;
  className?: string;
  fontFamily?: string;
  fontSize?: string;
  styles?: React.CSSProperties;
  stripLight?: boolean;
  numberOfLights?: number;
  lightBlinkInterval?: number;
  lightColor?: string;
  dimmedLightColor?: string;
  lightBorderColor?: string;
  lightBorderSize?: number;
  borderColorGradients?: {
    stop1: string;
    stop2: string;
    stop3: string;
    stop4: string;
    stop5: string;
  };
  innerCircleColorGradients?: {
    stop1: string;
    stop2: string;
    stop3: string;
    stop4: string;
    stop5: string;
    stop6: string;
    stop7: string;
    stop8: string;
  };
  innerCircleBorderColor?: string;
  innerCircleShineColors?: {
    color1: string;
    color2: string;
    color3: string;
  };
  arrowColorGradients?: {
    color1: string;
    color2: string;
  };
  arrowBorderColorGradients?: {
    color1: string;
    color2: string;
    color3: string;
  };
  shouldArrowBlink?: boolean;
  dimmedArrowColor?: string;
  onStop?: () => void;
  onReset?: (state: boolean) => void;
}
