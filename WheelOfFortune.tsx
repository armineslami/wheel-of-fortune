"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "./lib/utils";
import { WheelSegment } from "./props/WheelSegment";
import { WheelOfFortuneProps } from "./props/WheelOfFortuneProps";

const WheelOfFortune: React.FC<WheelOfFortuneProps> = (
  props: WheelOfFortuneProps
) => {
  const {
    segments,
    spinning,
    targetSegementId,
    spinDuration = 10000,
    resetDuration = 2000,
    spinPerSecond = 2,
    onStop,
    onReset,
    spinSound,
    resetSound,
    className,
    fontFamily = "Arial, sans-serif",
    fontSize,
    styles,
    stripLight = false,
    numberOfLights = 18,
    lightBlinkInterval = 150,
    lightColor = "#FF0000",
    dimmedLightColor = "#660000",
    lightBorderColor = "#000000",
    lightBorderSize = 2,
    borderColorGradients = {
      stop1: "#000000",
      stop2: "#FFD700",
      stop3: "#FFC400",
      stop4: "#FFB800",
      stop5: "#FF9E00",
    },
    innerCircleColorGradients = {
      stop1: "#FFFFFF",
      stop2: "#FFF9C4",
      stop3: "#FFF176",
      stop4: "#FFD700",
      stop5: "#FFC107",
      stop6: "#FF8F00",
      stop7: "#FF6F00",
      stop8: "#B8860B",
    },
    innerCircleBorderColor = "#D4AF37",
    innerCircleShineColors = {
      color1: "rgba(255, 255, 255, 0.8)",
      color2: "rgba(255, 255, 255, 0.6)",
      color3: "rgba(255, 255, 255, 0.9)",
    },
    arrowColorGradients = {
      color1: "#C41E3A",
      color2: "#e35050",
    },
    arrowBorderColorGradients = {
      color1: "#FFD700",
      color2: "#FFA500",
      color3: "#FFFF00",
    },
    shouldArrowBlink = true,
    dimmedArrowColor = "#660000",
  } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [lightsOn, setLightsOn] = useState(true);
  const [hasSpun, setHasSpun] = useState(false);
  const [initialPosition, setInitialPosition] = useState(0);
  const hasInitialized = useRef(false);
  const spindAudioRef = useRef<HTMLAudioElement | null>(null);
  const resetAudioRef = useRef<HTMLAudioElement | null>(null);

  // Spins the wheel the states are changed
  useEffect(() => {
    if (spinning && targetSegementId) {
      spinWheel();
    }
  }, [spinning, targetSegementId]);

  // Play sound while spinning
  useEffect(() => {
    if (spinning && spinSound) {
      spindAudioRef.current = new Audio(spinSound);
      spindAudioRef.current.loop = true;
      spindAudioRef.current.play();
    }
  }, [spinning]);

  // Toggles lights between on/off
  useEffect(() => {
    if (!spinning) return;

    const blinkInterval = setInterval(() => {
      setLightsOn((prev) => !prev);
    }, lightBlinkInterval);

    return () => clearInterval(blinkInterval);
  }, [spinning]);

  // Draws the wheel
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    /**
     * ------ Wheel Body ------
     */

    // Set canvas dimensions
    // Use parent element's width for responsive design
    const parent = canvas.parentElement;

    // Set canvas width/height based on device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = parent?.clientWidth || 300;
    canvas.width = displayWidth * dpr;
    canvas.height = displayWidth * dpr;

    // Style it back down using CSS pixels
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayWidth}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    /**
     * ------ Border ------
     */

    // Create gold border gradient - WIDER BORDER
    const borderWidth = radius * 0.1; // 10% of radius;
    const borderGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      radius - borderWidth,
      centerX,
      centerY,
      radius
    );

    borderGradient.addColorStop(0, borderColorGradients.stop1); // Black on the inner edge
    borderGradient.addColorStop(0.05, borderColorGradients.stop2); // Bright gold near the inner edge
    borderGradient.addColorStop(0.3, borderColorGradients.stop3); // Lighter gold with a hint of yellow
    borderGradient.addColorStop(0.5, borderColorGradients.stop4); // Slightly darker gold
    borderGradient.addColorStop(1, borderColorGradients.stop5); // Deeper amber gold

    ctx.save();

    // Apply the inner shadow effect
    ctx.shadowBlur = 20; // Set the shadow blur to make it subtle
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)"; // Dark shadow color for the inset shadow
    ctx.shadowOffsetX = 0; // No horizontal offset
    ctx.shadowOffsetY = 0; // No vertical offset

    // Draw gold border
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.arc(centerX, centerY, radius - borderWidth, 0, Math.PI * 2, true);
    ctx.fillStyle = borderGradient;
    ctx.fill();

    // Restore the previous context state to avoid affecting other drawings
    ctx.restore();

    /**
     * ------ Segments ------
     */

    // Draw wheel segments (equal sized)
    const segmentCount = segments.length;
    const segmentAngle = (2 * Math.PI) / segmentCount;
    let startAngle = (rotationAngle * Math.PI) / 180;

    segments.forEach((segment) => {
      const endAngle = startAngle + segmentAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius - borderWidth, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = segment.color;
      ctx.fill();

      // Add text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.fillStyle = segment.textColor;

      // Font
      const textSize = fontSize ?? `${radius * 0.1}px`; // 10% of radius
      ctx.font = `bold ${textSize} ${fontFamily}`;

      ctx.textAlign = "center"; // Align text center
      ctx.textBaseline = "middle"; // Vertically center the text
      ctx.fillText(segment.title, (radius - borderWidth) / 2 + borderWidth, 0);

      ctx.restore();

      startAngle = endAngle;
    });

    /**
     * ------ Lights ------
     */

    const LIGHTS_COLOR = lightColor;
    const DIMMED_LIGHTS_COLOR = dimmedLightColor;
    const LIGHTS_BORDER_COLOR = lightBorderColor;
    const LIGHTS_LINE_WIDTH = lightBorderSize;

    const TOTAL_LIGHTS = numberOfLights; // Total number of lights around the wheel
    const LIGHTS_RADIUS = radius * 0.03; // 2% of radius
    const LIGHTS_DISTANCE = radius - borderWidth / 2;

    if (stripLight) {
      // Draw a glowing circular strip light
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, LIGHTS_DISTANCE, 0, Math.PI * 2);
      ctx.strokeStyle =
        (spinning && lightsOn) || !spinning
          ? LIGHTS_COLOR
          : DIMMED_LIGHTS_COLOR;
      ctx.lineWidth = LIGHTS_RADIUS * LIGHTS_LINE_WIDTH;
      ctx.shadowBlur = 10;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.stroke();
      ctx.restore();
    } else {
      // Draw lights around the entire wheel
      for (let i = 0; i < TOTAL_LIGHTS; i++) {
        const angle = (i * (2 * Math.PI)) / TOTAL_LIGHTS;
        const x = centerX + LIGHTS_DISTANCE * Math.cos(angle);
        const y = centerY + LIGHTS_DISTANCE * Math.sin(angle);

        // Create a radial gradient to simulate glowing light
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, LIGHTS_RADIUS);
        if ((spinning && lightsOn) || !spinning) {
          gradient.addColorStop(0, LIGHTS_COLOR);
          gradient.addColorStop(0.4, LIGHTS_COLOR);
          gradient.addColorStop(1, "rgba(255, 0, 0, 0.1)");
        } else {
          gradient.addColorStop(0, DIMMED_LIGHTS_COLOR);
          gradient.addColorStop(0.4, DIMMED_LIGHTS_COLOR);
          gradient.addColorStop(1, "rgba(102, 0, 0, 0.1)");
        }

        ctx.beginPath();
        ctx.arc(x, y, LIGHTS_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.strokeStyle = LIGHTS_BORDER_COLOR;
        ctx.lineWidth = LIGHTS_LINE_WIDTH;
        ctx.stroke();
      }
    }

    /**
     * ------ Center Circle ------
     */

    // Draw center circle with FANCIER gold gradient and shining effect - BIGGER
    const centerRadius = radius * 0.15;
    const centerGradient = ctx.createRadialGradient(
      centerX - 12,
      centerY - 12,
      0,
      centerX,
      centerY,
      centerRadius
    );

    centerGradient.addColorStop(0, innerCircleColorGradients.stop1);
    centerGradient.addColorStop(0.1, innerCircleColorGradients.stop2);
    centerGradient.addColorStop(0.2, innerCircleColorGradients.stop3);
    centerGradient.addColorStop(0.4, innerCircleColorGradients.stop4);
    centerGradient.addColorStop(0.6, innerCircleColorGradients.stop5);
    centerGradient.addColorStop(0.8, innerCircleColorGradients.stop6);
    centerGradient.addColorStop(0.9, innerCircleColorGradients.stop7);
    centerGradient.addColorStop(1, innerCircleColorGradients.stop8);

    // Save current state
    ctx.save();

    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = centerGradient;
    ctx.fill();

    // Restore state to remove shadow from stroke
    ctx.restore();

    ctx.strokeStyle = innerCircleBorderColor;
    ctx.lineWidth = radius * 0.01;
    ctx.stroke();

    // Add multiple shine effects to center for a more luxurious look
    // Main highlight
    ctx.beginPath();
    ctx.arc(centerX - 12, centerY - 12, 10, 0, 2 * Math.PI);
    ctx.fillStyle = innerCircleShineColors.color1;
    ctx.fill();

    // Secondary smaller highlight
    ctx.beginPath();
    ctx.arc(centerX + 8, centerY + 8, 6, 0, 2 * Math.PI);
    ctx.fillStyle = innerCircleShineColors.color2;
    ctx.fill();

    // Tiny sparkle
    ctx.beginPath();
    ctx.arc(centerX - 15, centerY - 5, 3, 0, 2 * Math.PI);
    ctx.fillStyle = innerCircleShineColors.color3;
    ctx.fill();

    /**
     * ------ Top Arrow ------
     */

    // Define constants for important values
    const CENTER_X = centerX; // Horizontal center of the shape
    const CENTER_Y = centerY; // Vertical center of the shape
    const RADIUS = radius; // Radius of the shape
    const FILL_GRADIENT_BOTTOM = CENTER_Y - RADIUS * 0.8; // Bottom of the shape for the gradient
    const FILL_GRADIENT_TOP = CENTER_Y - RADIUS * 1; // Top of the shape for the gradient

    const BORDER_GRADIENT_LEFT = CENTER_X - 20; // Left edge for the border gradient
    const BORDER_GRADIENT_RIGHT = CENTER_X + 20; // Right edge for the border gradient
    const BORDER_GRADIENT_TOP = CENTER_Y - RADIUS; // Top of the border gradient
    const BORDER_GRADIENT_BOTTOM = CENTER_Y - RADIUS * 0.8; // Bottom of the border gradient

    const TRIANGLE_TIP_Y = CENTER_Y - RADIUS * 0.78; // Y position of the triangle tip
    const TRIANGLE_RIGHT_X = CENTER_X + RADIUS * 0.06; // Right side of triangle
    const TRIANGLE_LEFT_X = CENTER_X - RADIUS * 0.06; // Left side of triangle

    const CURVE_CONTROL_X_RIGHT = CENTER_X + 2; // Right curve control X
    const CURVE_CONTROL_Y_RIGHT = CENTER_Y - RADIUS * 0.9; // Right curve control Y
    const CURVE_CONTROL_X_LEFT = CENTER_X - 2; // Left curve control X
    const CURVE_CONTROL_Y_LEFT = CENTER_Y - RADIUS * 0.9; // Left curve control Y

    const LINE_WIDTH = 6; // Line width for the border

    // Create vertical gradient fill from bottom to top
    const fillGradient = ctx.createLinearGradient(
      CENTER_X,
      FILL_GRADIENT_BOTTOM,
      CENTER_X,
      FILL_GRADIENT_TOP
    );

    if (shouldArrowBlink) {
      if ((spinning && lightsOn) || !spinning) {
        fillGradient.addColorStop(0, arrowColorGradients.color1);
        fillGradient.addColorStop(1, arrowColorGradients.color2);
      } else {
        fillGradient.addColorStop(0, dimmedArrowColor);
      }
    } else {
      fillGradient.addColorStop(0, arrowColorGradients.color1);
      fillGradient.addColorStop(1, arrowColorGradients.color2);
    }

    // Create gold border gradient
    const arrowBorderGradient = ctx.createLinearGradient(
      BORDER_GRADIENT_LEFT,
      BORDER_GRADIENT_TOP,
      BORDER_GRADIENT_RIGHT,
      BORDER_GRADIENT_BOTTOM
    );
    arrowBorderGradient.addColorStop(0, arrowBorderColorGradients.color1);
    arrowBorderGradient.addColorStop(0.5, arrowBorderColorGradients.color2);
    arrowBorderGradient.addColorStop(1, arrowBorderColorGradients.color3);

    // Save current state
    ctx.save();

    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;

    ctx.beginPath();

    // Pointer triangle tip
    ctx.moveTo(CENTER_X, TRIANGLE_TIP_Y);

    // Right side of triangle
    ctx.lineTo(TRIANGLE_RIGHT_X, CENTER_Y - RADIUS * 0.85);

    // Right arc (concave inward)
    ctx.quadraticCurveTo(
      CURVE_CONTROL_X_RIGHT,
      CURVE_CONTROL_Y_RIGHT,
      TRIANGLE_RIGHT_X,
      CENTER_Y - RADIUS * 1
    );

    // Top edge
    ctx.lineTo(TRIANGLE_LEFT_X, CENTER_Y - RADIUS * 1);

    // Left arc (concave inward)
    ctx.quadraticCurveTo(
      CURVE_CONTROL_X_LEFT,
      CURVE_CONTROL_Y_LEFT,
      TRIANGLE_LEFT_X,
      CENTER_Y - RADIUS * 0.85
    );

    // Back to triangle tip
    ctx.lineTo(CENTER_X, TRIANGLE_TIP_Y);

    ctx.closePath();

    // Fill with vertical gradient
    ctx.fillStyle = fillGradient;
    ctx.fill();

    // Stroke with gold gradient
    ctx.strokeStyle = arrowBorderGradient;
    ctx.lineWidth = LINE_WIDTH;
    ctx.stroke();
    ctx.restore();
  }, [segments, rotationAngle, spinning, lightsOn]);

  // Sets initial rotation of the wheel
  useEffect(() => {
    if (hasInitialized.current) return;

    const initialPos = 360 / segments.length / 2;
    setRotationAngle(initialPos);
    setInitialPosition(initialPos);

    hasInitialized.current = true;
  }, [segments.length]);

  // Determines which segment is at the top
  const getTopSegment = (angle: number): WheelSegment => {
    // Normalize the angle to 0-360 range
    const normalizedAngle = ((angle % 360) + 360) % 360;

    // Calculate which segment is at the top (270 degrees)
    const segmentAngle = 360 / segments.length;

    // The wheel rotates clockwise, so we need to find which segment is at the top
    // We need to adjust the calculation to account for the wheel's orientation
    // The top position is at 270 degrees (3π/2)
    const topPosition = 270;

    // Calculate how far the wheel has rotated from the top position
    const angleFromTop = (normalizedAngle - topPosition + 360) % 360;

    // Calculate which segment is at the top
    const segmentIndex = Math.floor(angleFromTop / segmentAngle);

    // Return the segment at the calculated index (in reverse order because of rotation direction)
    return segments[(segments.length - segmentIndex - 1) % segments.length];
  };

  // Resets the wheel to initial position
  const resetWheel = async (): Promise<void> => {
    return new Promise((resolve) => {
      if (!hasSpun) {
        // If wheel hasn't been spun yet, just resolve immediately
        resolve();
        return;
      }

      onReset?.(true);

      if (resetSound) {
        resetAudioRef.current = new Audio(resetSound);
        resetAudioRef.current.loop = true;
        resetAudioRef.current.play();
      }

      // Calculate the target angle (initial position)
      const targetAngle = initialPosition;
      const currentAngle = rotationAngle % 360;

      // Calculate the shortest path to the target angle
      let angleDiff = targetAngle - currentAngle;

      // Adjust for shortest rotation path
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;

      const RESET_DURATION = resetDuration;
      const startTime = Date.now();
      const startAngle = rotationAngle;

      const animateReset = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / RESET_DURATION, 1);

        // Use a smooth ease-in-out curve for the reset
        const easeInOut = (t: number) => {
          return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        };

        // Calculate the new angle
        const newAngle = startAngle + angleDiff * easeInOut(progress);
        setRotationAngle(newAngle);

        if (progress < 1) {
          requestAnimationFrame(animateReset);
        } else {
          setRotationAngle(targetAngle);
          onReset?.(false);
          // Stop playing the reset sound
          if (resetSound) {
            resetAudioRef.current?.pause();
            resetAudioRef.current = null;
          }
          resolve();
        }
      };

      // Start the reset animation
      requestAnimationFrame(animateReset);
    });
  };

  const spinWheel = async () => {
    // Reset the wheel first if it has been spun before
    await resetWheel();

    // Calculate the initial position (segment centered at top)
    const segmentAngle = 360 / segments.length;
    const initialPos = segmentAngle / 2;
    setInitialPosition(initialPos);
    setRotationAngle(initialPos);

    try {
      // Find the target segment
      const targetSegment = segments.find(
        (segment) => segment.id === targetSegementId
      );
      if (!targetSegment) {
        throw new Error("Invalid segment ID");
      }

      // Calculate the angle needed to land on the target segment
      const segmentAngle = 360 / segments.length;
      const targetIndex = segments.findIndex(
        (segment) => segment.id === targetSegementId
      );

      // Calculate the target angle (center of the segment)
      // We add a small random offset within the segment to make it look more natural
      const targetAngleOffset = (Math.random() * 0.6 + 0.2) * segmentAngle; // 20%-80% of segment width

      // Calculate the final position where the wheel should stop
      // We need to calculate this carefully to ensure the correct segment is at the top
      const topPosition = 270; // degrees (3π/2)
      const targetPosition =
        (topPosition - (targetIndex * segmentAngle + targetAngleOffset) + 360) %
        360;

      const startTime = Date.now();
      const startAngle = initialPos;

      // Set the duration of spin
      const SPIN_DURATION = spinDuration;
      // Set the rotation per second
      const SPIN_PER_SECOND = spinPerSecond;

      // Calculate the total rotation needed
      const totalRotations = Math.max(
        5,
        Math.floor((SPIN_DURATION / 1000) * SPIN_PER_SECOND)
      ); // at least 5 rotations
      const totalRotation = totalRotations * 360 + targetPosition - initialPos;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / SPIN_DURATION, 1);

        let easedProgress;

        if (progress < 0.66) {
          // Phase 1: constant speed spin
          easedProgress = progress / 0.66; // map [0, 0.66] to [0, 1]
          const angle = startAngle + totalRotation * 0.8 * easedProgress;
          setRotationAngle(angle);
        } else {
          // Phase 2: deceleration
          const decelProgress = (progress - 0.66) / 0.34; // map [0.66, 1] to [0, 1]
          const easeOut = (t: number) => 1 - Math.pow(1 - t, 2); // ease-out cubic
          const easedDecel = easeOut(decelProgress);
          const angle =
            startAngle +
            totalRotation * 0.8 + // from constant spin
            totalRotation * 0.2 * easedDecel; // final deceleration
          setRotationAngle(angle);
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          const finalAngle = startAngle + totalRotation;
          setRotationAngle(finalAngle);
          onStop?.();
          setHasSpun(true);

          // Stop the audio
          if (spindAudioRef) {
            spindAudioRef.current?.pause();
            spindAudioRef.current = null;
          }
        }
      };

      // Start the animation
      requestAnimationFrame(animate);
    } catch (error) {
      console.error("Error spinning wheel:", error);
      onStop?.();
    }
  };

  return (
    <div
      className={cn("w-full aspect-square mx-auto", className)}
      style={styles}
    >
      <canvas
        ref={canvasRef}
        className={cn(
          "w-full h-full rounded-full",
          spinning && "transition-transform"
        )}
      />
    </div>
  );
};

export default WheelOfFortune;
