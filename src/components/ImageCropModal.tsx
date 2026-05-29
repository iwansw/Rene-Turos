import React, { useState, useRef, useEffect, TouchEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ZoomIn, ZoomOut, Move, Crop, RefreshCw, X, Check } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropSave: (croppedBase64: string) => void;
  title?: string;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  onCropSave,
  title = "Crop Avatar Picture",
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [rotate, setRotate] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const isDragging = useRef<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Viewport/Crop area size
  const CROP_SIZE = 220;

  // Reset zoom, rot and offset when a new image comes in
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotate(0);
      setOffset({ x: 0, y: 0 });
      setImageLoaded(false);
    }
  }, [isOpen, imageSrc]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    setImageLoaded(true);
  };

  // Drag start
  const handleStart = (clientX: number, clientY: number) => {
    isDragging.current = true;
    dragStart.current = {
      x: clientX - offset.x,
      y: clientY - offset.y,
    };
  };

  // Drag move
  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging.current) return;
    const nextX = clientX - dragStart.current.x;
    const nextY = clientY - dragStart.current.y;
    setOffset({ x: nextX, y: nextY });
  };

  // Drag end
  const handleEnd = () => {
    isDragging.current = false;
  };

  // Mouse handlers
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const onMouseUpOrLeave = () => {
    handleEnd();
  };

  // Touch handlers for mobile support
  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onTouchEnd = () => {
    handleEnd();
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomStep = 0.08;
    const nextZoom = e.deltaY < 0 ? zoom + zoomStep : zoom - zoomStep;
    setZoom(Math.max(1, Math.min(3.5, nextZoom)));
  };

  // Perform canvas drawing and cropping
  const handleApplyCrop = () => {
    if (!imageRef.current) return;

    const img = imageRef.current;
    
    // Create off-screen canvas at high resolution (e.g., 300x300) for standard clean sharp output
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Clear background to white style
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 300, 300);

    // Save context to apply transformations (rotation and translations)
    ctx.save();

    // Move to the center of the output crop canvas
    ctx.translate(150, 150);

    // Dynamic rotation if user rotates
    if (rotate !== 0) {
      ctx.rotate((rotate * Math.PI) / 180);
    }

    // Determine basic rendered bounds matching the dynamic UI crop viewport
    const containerRatio = CROP_SIZE / CROP_SIZE;
    const imageRatio = imageSize.width / imageSize.height;

    let baseW = CROP_SIZE;
    let baseH = CROP_SIZE;

    if (imageRatio > containerRatio) {
      // Landscape image
      baseW = CROP_SIZE * imageRatio;
    } else {
      // Portrait/Square image
      baseH = CROP_SIZE / imageRatio;
    }

    // Current width and height after zooming
    const currentW = baseW * zoom;
    const currentH = baseH * zoom;

    // Scale up coordinates from the screen CROP_SIZE system to the output 300x300 output canvas
    const scaleFactor = 300 / CROP_SIZE;
    
    // Draw centered on 150,150 + offset coordinates
    const drawX = offset.x * scaleFactor - (currentW * scaleFactor) / 2;
    const drawY = offset.y * scaleFactor - (currentH * scaleFactor) / 2;
    const drawW = currentW * scaleFactor;
    const drawH = currentH * scaleFactor;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();

    // Export to base64
    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onCropSave(croppedDataUrl);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 selection:bg-slate-900 selection:text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden font-sans"
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-850">
                <Crop size={15} className="text-emerald-700" />
                <span className="text-xs font-black uppercase tracking-wider">{title}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Workspace */}
            <div className="p-6 flex flex-col items-center justify-center bg-slate-50/50">
              {/* Interactive Area */}
              <div
                ref={containerRef}
                onWheel={handleWheel}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUpOrLeave}
                onMouseLeave={onMouseUpOrLeave}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                className="relative w-[220px] h-[220px] border border-slate-200 bg-slate-800 rounded-2xl overflow-hidden cursor-move shadow-inner select-none"
                style={{ touchAction: 'none' }}
              >
                {/* Visual grid behind portrait to assist alignment */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0c_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0c_1px,transparent_1px)] bg-[size:14px_14px]" />

                {/* The Uploaded Image itself */}
                <div
                  className="absolute w-full h-full flex items-center justify-center pointer-events-none"
                  style={{
                    transform: `translate(${offset.x}px, ${offset.y}px)`,
                    transition: isDragging.current ? 'none' : 'transform 0.15s ease-out',
                  }}
                >
                  <img
                    ref={imageRef}
                    src={imageSrc}
                    alt="Source upload to crop"
                    onLoad={handleImageLoad}
                    className="max-w-none origin-center"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotate}deg)`,
                      width: imageLoaded ? undefined : '100%',
                      maxWidth: '400%',
                    }}
                  />
                </div>

                {/* Circle Overlay Frame to show the absolute bounds of avatar */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Surrounding shadow border mask */}
                  <div className="absolute inset-0 bg-slate-950/40" />
                  
                  {/* Clean white circle cut out */}
                  <div 
                    className="absolute rounded-full border-2 border-white shadow-[0_0_0_9999px_rgba(15,23,42,0.4)] pointer-events-none" 
                    style={{ width: `${CROP_SIZE}px`, height: `${CROP_SIZE}px` }}
                  />

                  {/* Centering crosshairs to help compose the target picture */}
                  <div className="absolute w-3.5 h-px bg-white/55" />
                  <div className="absolute w-px h-3.5 bg-white/55" />
                </div>
                
                {/* Small indicator label */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/85 text-white/90 text-[8px] font-bold px-2 py-0.5 rounded-full pointer-events-none">
                  Drag with mouse to center
                </div>
              </div>

              {/* Slider for zoom factor */}
              <div className="w-full mt-5 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                  <span className="flex items-center gap-1"><ZoomOut size={11} /> Zoom Out</span>
                  <span className="font-mono text-[9px] bg-slate-200 px-1 rounded">{Math.round(zoom * 100)}%</span>
                  <span className="flex items-center gap-1">Zoom In <ZoomIn size={11} /></span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3.5"
                  step="0.01"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-slate-900 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                />
              </div>

              {/* Manipulation Toolbar */}
              <div className="flex gap-2.5 mt-5">
                <button
                  type="button"
                  onClick={() => setRotate((r) => (r + 90) % 360)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-250 hover:bg-slate-50 hover:border-slate-350 text-slate-650 font-bold text-[10px] rounded-lg shadow-3xs cursor-pointer transition-all"
                >
                  <RefreshCw size={11} />
                  <span>Rotate 90°</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setOffset({ x: 0, y: 0 });
                    setRotate(0);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-250 hover:bg-slate-50 hover:border-slate-350 text-slate-550 font-bold text-[10px] rounded-lg shadow-3xs cursor-pointer transition-all"
                >
                  <span>Reset Offset</span>
                </button>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="px-5 py-4 border-t border-slate-100 bg-slate-100/35 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 bg-white border border-slate-205 text-slate-550 hover:text-slate-800 text-[10.5px] font-bold rounded-lg cursor-pointer transition-all hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCrop}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-extrabold text-white text-[10.5px] rounded-lg flex items-center gap-1 shadow-xs shadow-emerald-600/10 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Check size={12} />
                <span>Save Cropped Photo</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
