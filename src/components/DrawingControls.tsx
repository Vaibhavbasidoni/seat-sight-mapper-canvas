
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Square, StopCircle } from 'lucide-react';

interface DrawingControlsProps {
  isDrawingMode: boolean;
  currentDrawingRow: string;
  currentSeatIndex: number;
  onStopDrawing: () => void;
}

export const DrawingControls: React.FC<DrawingControlsProps> = ({
  isDrawingMode,
  currentDrawingRow,
  currentSeatIndex,
  onStopDrawing
}) => {
  if (!isDrawingMode) {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Drawing Controls</h3>
        <div className="flex items-center gap-2 text-gray-600">
          <Square className="w-4 h-4" />
          <span className="text-sm">Select a row to start seat mapping</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 border-blue-200 bg-blue-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-blue-900">Drawing Mode Active</h3>
        <Badge variant="default" className="bg-blue-600">
          <AlertCircle className="w-3 h-3 mr-1" />
          DRAWING
        </Badge>
      </div>
      
      <div className="space-y-3">
        <div className="text-sm text-blue-800">
          <p className="font-medium">Currently mapping:</p>
          <p>Row: <span className="font-mono bg-white px-2 py-1 rounded">{currentDrawingRow}</span></p>
          <p>Seat: <span className="font-mono bg-white px-2 py-1 rounded">{currentSeatIndex + 1}</span></p>
        </div>
        
        <div className="bg-white p-3 rounded border">
          <p className="text-xs text-gray-600 mb-2">Instructions:</p>
          <ul className="text-xs text-gray-800 space-y-1">
            <li>• Click and drag on the hall image to define seat boundaries</li>
            <li>• Each rectangle will be mapped to the next seat automatically</li>
            <li>• Drawing will stop when all seats in the row are mapped</li>
          </ul>
        </div>
        
        <Button 
          onClick={onStopDrawing} 
          variant="outline" 
          className="w-full border-red-200 text-red-700 hover:bg-red-50"
        >
          <StopCircle className="w-4 h-4 mr-2" />
          Stop Drawing
        </Button>
      </div>
    </Card>
  );
};
