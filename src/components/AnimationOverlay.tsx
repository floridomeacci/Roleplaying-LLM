import React, { useEffect, useRef, useState } from 'react';
import { parseGIF, decompressFrames } from 'gifuct-js';

interface GifFrame {
  imageData: ImageData;
  delay: number;
}

interface AnimationOverlayProps {
  selectedAnimation: string | null;
  leftHandUrl: string | null;
  rightHandUrl: string | null;
  isGenerating?: boolean;
}

export function AnimationOverlay({ selectedAnimation, leftHandUrl, rightHandUrl, isGenerating }: AnimationOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const gifFrames = useRef<GifFrame[]>([]);
  const currentUrl = useRef<string | null>(null);
  const currentFrameIndex = useRef(0);
  const lastFrameTime = useRef(0);
  const isLoadingRef = useRef(false);
  
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const rightHandImageRef = useRef<HTMLImageElement | null>(null);
  const leftHandImageRef = useRef<HTMLImageElement | null>(null);
  
  const frameDelayOverride = 50;

  // Load item images
  useEffect(() => {
    if (rightHandUrl) {
      const img = new Image();
      img.onerror = () => {
        rightHandImageRef.current = null;
      };
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        rightHandImageRef.current = img;
      };
      img.src = rightHandUrl;
    } else {
      rightHandImageRef.current = null;
    }
  }, [rightHandUrl]);

  useEffect(() => {
    if (leftHandUrl) {
      const img = new Image();
      img.onerror = () => {
        leftHandImageRef.current = null;
      };
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        leftHandImageRef.current = img;
      };
      img.src = leftHandUrl;
    } else {
      leftHandImageRef.current = null;
    }
  }, [leftHandUrl]);

  // Load initial animation
  useEffect(() => {
    if (selectedAnimation && !currentUrl.current && !isLoadingRef.current) {
      loadGif(selectedAnimation);
    }
  }, [selectedAnimation]);

  const loadGif = async (url: string) => {
    if (url === currentUrl.current) return;
    if (isLoadingRef.current) return;
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);
      setLoadingProgress(0);
      
      currentUrl.current = url;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      // Handle non-GIF responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('image/gif')) {
        throw new Error('Invalid image format');
      }
      
      const buffer = await response.arrayBuffer();
      setLoadingProgress(30);
      
      const gif = parseGIF(buffer);
      setLoadingProgress(50);
      
      const frames = decompressFrames(gif, true);
      setLoadingProgress(70);

      if (frames.length === 0) {
        throw new Error('No frames found in GIF');
      }

      // Reset frame index when loading new GIF
      currentFrameIndex.current = 0;
      lastFrameTime.current = 0;
      
      const width = frames[0].dims.width;
      const height = frames[0].dims.height;
      setDimensions({ width, height });

      // Create canvas for frame composition
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = width;
      canvas.height = height;

      // Process frames
      const processedFrames: GifFrame[] = [];
      let lastImageData: ImageData | null = null;

      for (const frame of frames) {
        // Create new ImageData for the frame patch
        const imageData = ctx.createImageData(
          frame.dims.width,
          frame.dims.height
        );
        imageData.data.set(frame.patch);

        // Clear canvas if needed
        if (frame.disposalType === 2) {
          ctx.clearRect(0, 0, width, height);
        } else if (lastImageData) {
          ctx.putImageData(lastImageData, 0, 0);
        }

        // Draw the new frame patch
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = frame.dims.width;
        tempCanvas.height = frame.dims.height;
        tempCanvas.getContext('2d')!.putImageData(imageData, 0, 0);
        ctx.drawImage(
          tempCanvas, 
          frame.dims.left,
          frame.dims.top,
          frame.dims.width,
          frame.dims.height
        );

        // Store the composed frame data
        const composedFrame = ctx.getImageData(0, 0, width, height);
        lastImageData = composedFrame;

        processedFrames.push({
          imageData: composedFrame,
          delay: frame.delay
        });
      }

      gifFrames.current = processedFrames;
      setLoadingProgress(100);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError('Failed to load animation');
      console.error('Animation loading error:', error);
    } finally {
      isLoadingRef.current = false;
    }
  };

  // Handle animation changes
  useEffect(() => {
    if (selectedAnimation && selectedAnimation !== currentUrl.current && !isLoadingRef.current) {
      loadGif(selectedAnimation);
    }
  }, [selectedAnimation]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (!canvas || !container || !dimensions || gifFrames.current.length === 0 || loading) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match container
    const containerSize = Math.min(container.clientWidth, container.clientHeight);
    canvas.width = containerSize;
    canvas.height = containerSize;

    // Calculate scale to fit container while maintaining aspect ratio
    const scale = Math.min(
      containerSize / dimensions.width,
      containerSize / dimensions.height
    );

    // Calculate centered position
    const offsetX = (containerSize - dimensions.width * scale) / 2;
    const offsetY = (containerSize - dimensions.height * scale) / 2;

    const findColoredDot = (imageData: ImageData, color: 'red' | 'yellow'): { x: number; y: number } | null => {
      const { data, width } = imageData;
      let totalX = 0;
      let totalY = 0;
      let count = 0;
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      const isTargetColor = (r: number, g: number, b: number, a: number) => {
        if (color === 'red') {
          return r > 150 && g < 100 && b < 100 && a > 200;
        } else {
          return r > 150 && g > 150 && b < 100 && a > 200;
        }
      };

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (isTargetColor(r, g, b, a)) {
          const x = (i / 4) % width;
          const y = Math.floor((i / 4) / width);
          totalX += x;
          totalY += y;
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
          count++;
        }
      }

      if (count > 0) {
        // Use center of bounding box for more stable tracking
        return {
          x: Math.round((minX + maxX) / 2),
          y: Math.round((minY + maxY) / 2)
        };
      }

      return null;
    };

    const animate = () => {
      const currentTime = performance.now();
      const elapsed = currentTime - lastFrameTime.current;
      
      // Safety check for frames
      if (!gifFrames.current || gifFrames.current.length === 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw scaled and centered frame
      // Get and draw current frame
      const frame = gifFrames.current[currentFrameIndex.current];
      if (!frame || !frame.imageData) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Create temporary canvas for scaling
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = dimensions.width;
      tempCanvas.height = dimensions.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      // Draw frame on temporary canvas
      tempCtx.putImageData(frame.imageData, 0, 0);

      // Draw scaled image on main canvas
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);
      ctx.drawImage(tempCanvas, 0, 0);
      ctx.restore();

      // Use fixed frame delay for smoother animation
      const frameDelay = frameDelayOverride;

      // Get image data to analyze
      const imageData = frame.imageData;
      const rightHand = findColoredDot(frame.imageData, 'red');
      const leftHand = findColoredDot(frame.imageData, 'yellow');

      const itemSize = Math.min(canvas.width, canvas.height) * 0.2; // Slightly larger items

      // Draw right hand item
      if (rightHand && rightHandImageRef.current) {
        ctx.save();
        ctx.translate(rightHand.x * scale + offsetX, rightHand.y * scale + offsetY);
        ctx.drawImage(
          rightHandImageRef.current,
          -itemSize / 2, 
          -itemSize / 2,
          itemSize,
          itemSize
        );
        ctx.restore();
      }

      // Draw left hand item
      if (leftHand && leftHandImageRef.current) {
        ctx.save();
        ctx.translate(leftHand.x * scale + offsetX, leftHand.y * scale + offsetY);
        ctx.drawImage(
          leftHandImageRef.current,
          -itemSize / 2,
          -itemSize / 2,
          itemSize,
          itemSize
        );
        ctx.restore();
      }
      
      // Only advance to next frame if enough time has passed
      if (elapsed >= frameDelay) {
        currentFrameIndex.current = (currentFrameIndex.current + 1) % gifFrames.current.length;
        lastFrameTime.current = currentTime;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions, loading]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="w-32 h-32 rounded-sm border-2 border-[#33ff33] overflow-hidden flex-shrink-0 flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#33ff33]" />
          <div className="w-20 h-1 bg-[#33ff33]/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#33ff33] transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-32 h-32 rounded-sm border-2 border-[#33ff33] overflow-hidden flex-shrink-0 flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[#33ff33]/40 text-2xl">!</span>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              loadGif(selectedAnimation!);
            }}
            className="text-xs text-[#33ff33]/60 hover:text-[#33ff33]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`w-32 h-32 rounded-sm border-2 border-[#33ff33] overflow-hidden flex-shrink-0 relative bg-black flex items-center justify-center ${loading ? 'animate-pulse' : ''}`}
    >
      {selectedAnimation ? (
        <canvas
          ref={canvasRef}
          style={{
            imageRendering: 'pixelated',
            maxWidth: '100%',
            maxHeight: '100%',
            display: loading ? 'none' : 'block'
          }}
        />
      ) : (
        <div className="w-full h-full bg-[#33ff33]/5 flex items-center justify-center">
          <span className="text-[#33ff33]/40 text-2xl">?</span>
        </div>
      )}
      {isGenerating && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#33ff33]">
            <span className="sr-only">Generating items...</span>
          </div>
        </div>
      )}
    </div>
  );
}