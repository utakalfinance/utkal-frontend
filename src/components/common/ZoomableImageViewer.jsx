import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Maximize2,
  FileText,
  ExternalLink,
  MousePointer
} from 'lucide-react';

/**
 * ZoomableImageViewer
 * 
 * High-performance image viewer supporting:
 * - Desktop external mouse wheel zooming (scroll wheel up = zoom in, scroll wheel down = zoom out)
 * - Laptop trackpad pinch-to-zoom (synthetic wheel with ctrlKey)
 * - Click-and-drag panning when zoomed in
 * - Double-click toggle (1x <-> 2x)
 * - Touchscreen 2-finger pinch & 1-finger drag
 * - 90-degree rotation
 * - On-screen zoom toolbar with zoom percentage badge
 * - Non-passive wheel event handling to prevent outer page/modal scroll
 */
export function ZoomableImageViewer({
  src,
  alt = 'Document Preview',
  minZoom = 0.5,
  maxZoom = 5.0,
  initialZoom = 1.0,
  showToolbar = true,
  showHint = true,
  className = '',
  onClose,
}) {
  const [zoom, setZoom] = useState(initialZoom);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showHelperHint, setShowHelperHint] = useState(showHint);

  const containerRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const touchStartRef = useRef({ dist: 0, initialZoom: 1 });

  // Reset zoom & pan when image src changes
  useEffect(() => {
    setZoom(initialZoom);
    setRotation(0);
    setPan({ x: 0, y: 0 });
    setHasError(false);
  }, [src, initialZoom]);

  // Non-passive wheel event listener for external mouse wheel & laptop trackpad pinch
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      // Prevent browser default scroll so the outer modal/page doesn't scroll
      e.preventDefault();
      e.stopPropagation();

      let delta = e.deltaY;
      // Handle different delta modes (pixels, lines, pages)
      if (e.deltaMode === 1) delta *= 25;
      else if (e.deltaMode === 2) delta *= 100;

      // Handle both external mouse wheel (larger deltaY) and trackpad pinch (ctrlKey + small deltaY)
      const isPinch = e.ctrlKey;
      const zoomStep = isPinch ? 0.03 : 0.15;
      const factor = delta < 0 ? (1 + zoomStep) : (1 - zoomStep);

      setZoom((prev) => {
        const next = Math.min(Math.max(prev * factor, minZoom), maxZoom);
        // Automatically re-center if zoomed out to 1x or below
        if (next <= 1.05 && prev > 1.05) {
          setPan({ x: 0, y: 0 });
        }
        return Number(next.toFixed(2));
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [minZoom, maxZoom]);

  // Pan / Drag handlers for desktop mouse
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Left click only
    if (zoom <= 1) return; // Only pan when zoomed in

    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Touch handlers for touchscreen laptops and mobile devices
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // 2-finger pinch
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartRef.current = { dist, initialZoom: zoom };
    } else if (e.touches.length === 1 && zoom > 1) {
      // 1-finger pan
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && touchStartRef.current.dist > 0) {
      e.preventDefault();
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = currentDist / touchStartRef.current.dist;
      const nextZoom = Math.min(
        Math.max(touchStartRef.current.initialZoom * ratio, minZoom),
        maxZoom
      );
      setZoom(Number(nextZoom.toFixed(2)));
    } else if (e.touches.length === 1 && isDragging && zoom > 1) {
      e.preventDefault();
      setPan({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartRef.current = { dist: 0, initialZoom: zoom };
  };

  // Double-click to toggle 1x and 2x zoom
  const handleDoubleClick = (e) => {
    e.preventDefault();
    if (zoom > 1.05) {
      setZoom(1.0);
      setPan({ x: 0, y: 0 });
    } else {
      setZoom(2.0);
    }
  };

  // Reset to initial state
  const handleReset = () => {
    setZoom(initialZoom);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoom((z) => Math.min(Number((z + 0.25).toFixed(2)), maxZoom));
  };

  const handleZoomOut = () => {
    setZoom((z) => {
      const next = Math.max(Number((z - 0.25).toFixed(2)), minZoom);
      if (next <= 1.05) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  if (hasError) {
    return (
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-950 text-slate-300">
        <FileText className="w-14 h-14 text-blue-400 mx-auto mb-3" />
        <p className="font-bold text-base text-white">Unable to render document preview</p>
        <p className="text-xs text-slate-400 font-mono mt-1 mb-4">{src}</p>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors"
        >
          <span>Open or Download Original File</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleClick}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950 select-none ${
        zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
      } ${className}`}
      style={{ touchAction: 'none' }}
      title={zoom > 1 ? 'Drag to pan • Scroll wheel to zoom' : 'Scroll wheel to zoom in • Double-click for 2x'}
    >
      {/* Zoomable & Rotatable Image */}
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0px)`,
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        }}
      >
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          draggable={false}
          className="max-w-full max-h-full object-contain pointer-events-none rounded shadow-2xl"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            transformOrigin: 'center center',
            userSelect: 'none',
            WebkitUserDrag: 'none',
          }}
        />
      </div>

      {/* FLOATING HINT BADGE (Top Center) */}
      {showHelperHint && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/85 backdrop-blur-md text-slate-300 border border-slate-700/60 px-3 py-1 rounded-full text-[11px] font-medium shadow-lg pointer-events-none flex items-center gap-1.5 z-20">
          <MousePointer className="w-3 h-3 text-blue-400" />
          <span>Mouse Wheel: <strong>Zoom</strong> • Drag: <strong>Pan</strong> • Double-click: <strong>Reset</strong></span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowHelperHint(false);
            }}
            className="ml-1 text-slate-500 hover:text-slate-200 pointer-events-auto cursor-pointer"
            title="Dismiss hint"
          >
            ×
          </button>
        </div>
      )}

      {/* FLOATING ZOOM & ROTATION TOOLBAR (Bottom Center) */}
      {showToolbar && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white border border-slate-700/80 px-3 py-1.5 rounded-2xl shadow-2xl flex items-center gap-2 backdrop-blur-md z-30"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Zoom Out Button */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= minZoom}
            className="p-1.5 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Zoom Out (Mouse Wheel Down)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Current Zoom Percentage Badge */}
          <span
            onClick={handleReset}
            className="text-[11px] font-mono font-bold text-slate-200 w-14 text-center cursor-pointer hover:text-blue-400 transition-colors select-none"
            title="Click to reset zoom"
          >
            {Math.round(zoom * 100)}%
          </span>

          {/* Zoom In Button */}
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= maxZoom}
            className="p-1.5 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Zoom In (Mouse Wheel Up)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-slate-700" />

          {/* Rotate 90° Clockwise */}
          <button
            type="button"
            onClick={handleRotate}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Rotate 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Reset Zoom & Pan */}
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Reset to 100% (Double click)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default ZoomableImageViewer;

