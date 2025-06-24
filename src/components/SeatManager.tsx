import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CameraData } from '@/pages/Index';
import { Plus, MapPin, Target } from 'lucide-react';

interface SeatManagerProps {
  cameraData: CameraData;
  onAddRow: (rowName: string, seatCount: number) => void;
  onStartDrawingForRow: (rowName: string) => void;
  onStartDrawingForSpecificSeat: (rowName: string, seatNumber: number) => void;
}

export const SeatManager: React.FC<SeatManagerProps> = ({
  cameraData,
  onAddRow,
  onStartDrawingForRow,
  onStartDrawingForSpecificSeat
}) => {
  const [newRowName, setNewRowName] = useState('');
  const [newSeatCount, setNewSeatCount] = useState(20);

  const handleAddRow = () => {
    if (newRowName.trim()) {
      onAddRow(newRowName.trim(), newSeatCount);
      setNewRowName('');
      setNewSeatCount(20);
    }
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Seat Management</h3>
      
      {/* Add New Row */}
      <div className="space-y-4 mb-6">
        <div>
          <Label htmlFor="rowName">Row Name</Label>
          <Input
            id="rowName"
            placeholder="e.g., A, B, C"
            value={newRowName}
            onChange={(e) => setNewRowName(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="seatCount">Number of Seats</Label>
          <Input
            id="seatCount"
            type="number"
            min="1"
            max="50"
            value={newSeatCount}
            onChange={(e) => setNewSeatCount(parseInt(e.target.value) || 20)}
          />
        </div>
        
        <Button onClick={handleAddRow} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Row
        </Button>
      </div>

      {/* Existing Rows */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Current Rows</h4>
        
        {cameraData.rows.length === 0 ? (
          <p className="text-gray-500 text-sm">No rows added yet</p>
        ) : (
          <div className="space-y-3">
            {cameraData.rows.map((row, index) => {
              const mappedSeats = row.seats.filter(seat => seat.topXY && seat.bottomXY).length;
              const occupiedSeats = row.seats.filter(seat => seat.isOccupied).length;
              
              return (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Row {row.name}</span>
                      <Badge variant="secondary">{row.seatCount} seats</Badge>
                      <Badge variant={mappedSeats === row.seatCount ? "default" : "outline"}>
                        {mappedSeats}/{row.seatCount} mapped
                      </Badge>
                      {occupiedSeats > 0 && (
                        <Badge variant="destructive">
                          {occupiedSeats} occupied
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onStartDrawingForRow(row.name)}
                      className="flex-1"
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      Draw All Seats
                    </Button>
                  </div>
                  
                  {/* Individual Seat Controls */}
                  <div className="mt-3">
                    <div className="text-xs text-gray-600 mb-2">Individual Seat Mapping:</div>
                    <div className="grid grid-cols-5 gap-1">
                      {row.seats.slice(0, 10).map((seat, seatIndex) => (
                        <Button
                          key={seatIndex}
                          size="sm"
                          variant={seat.topXY && seat.bottomXY ? "default" : "outline"}
                          onClick={() => onStartDrawingForSpecificSeat(row.name, seat.number)}
                          className="text-xs p-1 h-8"
                        >
                          {seat.number}
                        </Button>
                      ))}
                      {row.seats.length > 10 && (
                        <div className="text-xs text-gray-500 flex items-center justify-center">
                          +{row.seats.length - 10}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};
