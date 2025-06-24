
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CameraData } from '@/pages/Index';

interface CinemaCanvasProps {
  cameraData: CameraData;
  isDrawingMode: boolean;
  currentDrawingRow: string;
  currentSeatIndex: number;
  onSeatCoordinatesUpdate: (topXY: { x: number; y: number }, bottomXY: { x: number; y: number }) => void;
}

export const CinemaCanvas: React.FC<CinemaCanvasProps> = ({
  cameraData,
  isDrawingMode,
  currentDrawingRow,
  currentSeatIndex,
  onSeatCoordinatesUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const [hallImageLoaded, setHallImageLoaded] = useState(false);
  const hallImageRef = useRef<HTMLImageElement | null>(null);

  // Load hall image when it changes
  useEffect(() => {
    if (cameraData.hallImage) {
      const img = new Image();
      img.onload = () => {
        hallImageRef.current = img;
        setHallImageLoaded(true);
      };
      img.src = cameraData.hallImage;
    } else {
      setHallImageLoaded(false);
      hallImageRef.current = null;
    }
  }, [cameraData.hallImage]);

  // Canvas rendering function
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw hall image if available
    if (hallImageLoaded && hallImageRef.current) {
      ctx.drawImage(hallImageRef.current, 0, 0, canvas.width, canvas.height);
    } else {
      // Draw placeholder background
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Upload hall image to begin', canvas.width / 2, canvas.height / 2);
    }

    // Draw existing seat boxes
    cameraData.rows.forEach(row => {
      row.seats.forEach(seat => {
        if (seat.topXY && seat.bottomXY) {
          const width = seat.bottomXY.x - seat.topXY.x;
          const height = seat.bottomXY.y - seat.topXY.y;

          // Set seat color based on occupancy
          if (seat.isOccupied) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.6)'; // Red for occupied
            ctx.strokeStyle = '#dc2626';
          } else {
            ctx.fillStyle = 'rgba(34, 197, 94, 0.6)'; // Green for empty
            ctx.strokeStyle = '#16a34a';
          }

          ctx.lineWidth = 2;
          ctx.fillRect(seat.topXY.x, seat.topXY.y, width, height);
          ctx.strokeRect(seat.topXY.x, seat.topXY.y, width, height);

          // Draw seat number
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(
            `${row.name}${seat.number}`,
            seat.topXY.x + width / 2,
            seat.topXY.y + height / 2 + 4
          );
        }
      });
    });

    // Draw current drawing rectangle
    if (isDrawingMode && isDrawing && startPos && currentPos) {
      const width = currentPos.x - startPos.x;
      const height = currentPos.y - startPos.y;

      ctx.strokeStyle = '#3b82f6';
      ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.lineWidth = 2;
      ctx.fillRect(startPos.x, startPos.y, width, height);
      ctx.strokeRect(startPos.x, startPos.y, width, height);

      // Show current seat being drawn
      ctx.fillStyle = '#1d4ed8';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${currentDrawingRow}${currentSeatIndex + 1}`,
        startPos.x + width / 2,
        startPos.y + height / 2 + 5
      );
    }
  }, [cameraData, isDrawingMode, isDrawing, startPos, currentPos, currentDrawingRow, currentSeatIndex, hallImageLoaded]);

  // Redraw canvas when data changes
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Mouse event handlers
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return;

    const pos = getMousePos(e);
    setStartPos(pos);
    setCurrentPos(pos);
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !isDrawing) return;

    const pos = getMousePos(e);
    setCurrentPos(pos);
    drawCanvas();
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !isDrawing || !startPos) return;

    const endPos = getMousePos(e);
    setIsDrawing(false);

    // Ensure we have valid coordinates
    const topXY = {
      x: Math.min(startPos.x, endPos.x),
      y: Math.min(startPos.y, endPos.y)
    };
    const bottomXY = {
      x: Math.max(startPos.x, endPos.x),
      y: Math.max(startPos.y, endPos.y)
    };

    // Only update if the rectangle has meaningful size
    if (Math.abs(bottomXY.x - topXY.x) > 10 && Math.abs(bottomXY.y - topXY.y) > 10) {
      onSeatCoordinatesUpdate(topXY, bottomXY);
    }

    setStartPos(null);
    setCurrentPos(null);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-auto cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ display: 'block' }}
      />
      
      {isDrawingMode && (
        <div className="bg-blue-50 p-3 border-t">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Drawing Mode Active:</span> 
            {currentDrawingRow && ` Mapping ${currentDrawingRow}, Seat ${currentSeatIndex + 1}`}
            <br />
            <span className="text-xs">Click and drag to define seat boundaries</span>
          </p>
        </div>
      )}
    </div>
  );
};
