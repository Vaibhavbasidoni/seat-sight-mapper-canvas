
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CameraData } from '@/pages/Index';
import { Palette, Eye, Users, TrendingUp } from 'lucide-react';

interface OccupancyControlsProps {
  onSaveBaseColors: () => void;
  onCalculateOccupancy: () => void;
  cameraData: CameraData;
}

export const OccupancyControls: React.FC<OccupancyControlsProps> = ({
  onSaveBaseColors,
  onCalculateOccupancy,
  cameraData
}) => {
  const [showOccupiedOnly, setShowOccupiedOnly] = useState(false);

  const totalSeats = cameraData.rows.reduce((total, row) => total + row.seatCount, 0);
  const mappedSeats = cameraData.rows.reduce((total, row) => 
    total + row.seats.filter(seat => seat.topXY && seat.bottomXY).length, 0
  );
  const occupiedSeats = cameraData.rows.reduce((total, row) => 
    total + row.seats.filter(seat => seat.isOccupied).length, 0
  );
  const seatsWithBaseColors = cameraData.rows.reduce((total, row) => 
    total + row.seats.filter(seat => seat.baseAverageColor).length, 0
  );

  const occupancyPercentage = totalSeats > 0 ? (occupiedSeats / totalSeats) * 100 : 0;
  const mappingProgress = totalSeats > 0 ? (mappedSeats / totalSeats) * 100 : 0;

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Occupancy Analysis</h3>
      
      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Total Seats</div>
          <div className="text-2xl font-bold text-gray-900">{totalSeats}</div>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-sm text-green-600">Mapped</div>
          <div className="text-2xl font-bold text-green-700">{mappedSeats}</div>
        </div>
        
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm text-blue-600">Base Colors</div>
          <div className="text-2xl font-bold text-blue-700">{seatsWithBaseColors}</div>
        </div>
        
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="text-sm text-red-600">Occupied</div>
          <div className="text-2xl font-bold text-red-700">{occupiedSeats}</div>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="space-y-3 mb-6">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Seat Mapping Progress</span>
            <span>{mappingProgress.toFixed(1)}%</span>
          </div>
          <Progress value={mappingProgress} className="h-2" />
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Current Occupancy</span>
            <span>{occupancyPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={occupancyPercentage} className="h-2" />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="space-y-3">
        <Button 
          onClick={onSaveBaseColors}
          disabled={mappedSeats === 0}
          className="w-full"
          variant="outline"
        >
          <Palette className="w-4 h-4 mr-2" />
          Save Base Average Colors
        </Button>
        
        <Button 
          onClick={onCalculateOccupancy}
          disabled={seatsWithBaseColors === 0}
          className="w-full"
        >
          <Eye className="w-4 h-4 mr-2" />
          Calculate Occupancy
        </Button>
        
        <Button
          onClick={() => setShowOccupiedOnly(!showOccupiedOnly)}
          variant="outline"
          className="w-full"
        >
          <Users className="w-4 h-4 mr-2" />
          {showOccupiedOnly ? 'Show All Seats' : 'Show Occupied Only'}
        </Button>
      </div>

      {/* Row-wise Statistics */}
      {cameraData.rows.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-3">Row Statistics</h4>
          <div className="space-y-2">
            {cameraData.rows.map((row, index) => {
              const rowOccupied = row.seats.filter(seat => seat.isOccupied).length;
              const rowOccupancyPercent = row.seatCount > 0 ? (rowOccupied / row.seatCount) * 100 : 0;
              
              return (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Row {row.name}</span>
                    <Badge variant="outline">{row.seatCount} seats</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {rowOccupied}/{row.seatCount}
                    </span>
                    <Badge 
                      variant={rowOccupancyPercent > 80 ? "destructive" : 
                               rowOccupancyPercent > 50 ? "default" : "secondary"}
                    >
                      {rowOccupancyPercent.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};
