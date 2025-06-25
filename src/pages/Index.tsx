
import React, { useState, useEffect } from 'react';
import { CinemaCanvas } from '@/components/CinemaCanvas';
import { SeatManager } from '@/components/SeatManager';
import { DrawingControls } from '@/components/DrawingControls';
import { OccupancyControls } from '@/components/OccupancyControls';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Camera, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useEntitiesData } from '@/hooks/useEntitiesData';

export interface Seat {
  number: number;
  topXY: { x: number; y: number } | null;
  bottomXY: { x: number; y: number } | null;
  baseAverageColor: string | null;
  isOccupied: boolean;
}

export interface Row {
  name: string;
  order: number;
  seatCount: number;
  seats: Seat[];
}

export interface CameraData {
  id: string;
  name: string;
  hallId: string;
  rows: Row[];
  hallImage: string | null;
}

const Index = () => {
  const { data: apiData, isLoading, error } = useEntitiesData();
  const [selectedEntity, setSelectedEntity] = useState<string>("");
  const [selectedHall, setSelectedHall] = useState<string>("");
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [availableHalls, setAvailableHalls] = useState<any[]>([]);
  const [availableCameras, setAvailableCameras] = useState<any[]>([]);
  const [cameraData, setCameraData] = useState<CameraData | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [currentDrawingRow, setCurrentDrawingRow] = useState<string>("");
  const [currentSeatIndex, setCurrentSeatIndex] = useState(0);

  useEffect(() => {
    if (selectedEntity && apiData) {
      const filteredHalls = apiData.halls.filter(hall => hall.entityId === selectedEntity);
      setAvailableHalls(filteredHalls);
      setSelectedHall("");
      setSelectedCamera("");
    }
  }, [selectedEntity, apiData]);

  useEffect(() => {
    if (selectedHall && apiData) {
      const filteredCameras = apiData.cameras.filter(camera => camera.hallId === selectedHall);
      setAvailableCameras(filteredCameras);
      setSelectedCamera("");
    }
  }, [selectedHall, apiData]);

  useEffect(() => {
    if (selectedCamera && apiData) {
      const camera = apiData.cameras.find(c => c.id === selectedCamera);
      if (camera) {
        setCameraData({
          id: camera.id,
          name: camera.name,
          hallId: camera.hallId,
          rows: [],
          hallImage: null
        });
        toast.success(`Camera ${camera.name} selected`);
      }
    }
  }, [selectedCamera, apiData]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && cameraData) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        setCameraData(prev => prev ? { ...prev, hallImage: imageDataUrl } : null);
        toast.success("Hall image uploaded successfully");
      };
      reader.readAsDataURL(file);
    }
  };

  const addRow = (rowName: string, seatCount: number) => {
    if (!cameraData) return;

    const newRow: Row = {
      name: rowName,
      order: cameraData.rows.length + 1,
      seatCount,
      seats: Array.from({ length: seatCount }, (_, index) => ({
        number: index + 1,
        topXY: null,
        bottomXY: null,
        baseAverageColor: null,
        isOccupied: false
      }))
    };

    setCameraData(prev => prev ? {
      ...prev,
      rows: [...prev.rows, newRow]
    } : null);

    toast.success(`Row ${rowName} added with ${seatCount} seats`);
  };

  const startDrawingForRow = (rowName: string) => {
    setIsDrawingMode(true);
    setCurrentDrawingRow(rowName);
    setCurrentSeatIndex(0);
    toast.info(`Started drawing for row ${rowName}. Click and drag to define seat areas.`);
  };

  const startDrawingForSpecificSeat = (rowName: string, seatNumber: number) => {
    setIsDrawingMode(true);
    setCurrentDrawingRow(rowName);
    setCurrentSeatIndex(seatNumber - 1);
    toast.info(`Started drawing for row ${rowName}, seat ${seatNumber}. Click and drag to define the seat area.`);
  };

  const handleSeatCoordinatesUpdate = (topXY: { x: number; y: number }, bottomXY: { x: number; y: number }) => {
    if (!cameraData || !currentDrawingRow) return;

    setCameraData(prev => {
      if (!prev) return null;

      const updatedRows = prev.rows.map(row => {
        if (row.name === currentDrawingRow) {
          const updatedSeats = [...row.seats];
          if (updatedSeats[currentSeatIndex]) {
            updatedSeats[currentSeatIndex] = {
              ...updatedSeats[currentSeatIndex],
              topXY,
              bottomXY
            };
          }
          return { ...row, seats: updatedSeats };
        }
        return row;
      });

      return { ...prev, rows: updatedRows };
    });

    const row = cameraData.rows.find(r => r.name === currentDrawingRow);
    if (row && currentSeatIndex < row.seatCount - 1) {
      setCurrentSeatIndex(prev => prev + 1);
      toast.success(`Seat ${currentSeatIndex + 1} mapped. Now mapping seat ${currentSeatIndex + 2}`);
    } else {
      setIsDrawingMode(false);
      setCurrentDrawingRow("");
      setCurrentSeatIndex(0);
      toast.success("All seats in this row have been mapped!");
    }
  };

  const saveBaseAverageColorForAll = () => {
    if (!cameraData || !cameraData.hallImage) {
      toast.error("Please upload a hall image first");
      return;
    }

    // This would typically involve canvas image processing
    // For now, we'll simulate the color calculation
    setCameraData(prev => {
      if (!prev) return null;

      const updatedRows = prev.rows.map(row => ({
        ...row,
        seats: row.seats.map(seat => ({
          ...seat,
          baseAverageColor: seat.topXY && seat.bottomXY ? "#rgb(123,123,123)" : null
        }))
      }));

      return { ...prev, rows: updatedRows };
    });

    toast.success("Base average colors calculated for all seats");
  };

  const calculateOccupancy = () => {
    if (!cameraData) return;

    // Simulate occupancy detection
    setCameraData(prev => {
      if (!prev) return null;

      const updatedRows = prev.rows.map(row => ({
        ...row,
        seats: row.seats.map(seat => ({
          ...seat,
          isOccupied: Math.random() > 0.6 // Random occupancy for demo
        }))
      }));

      return { ...prev, rows: updatedRows };
    });

    const totalSeats = cameraData.rows.reduce((total, row) => total + row.seatCount, 0);
    const occupiedSeats = cameraData.rows.reduce((total, row) => 
      total + row.seats.filter(seat => seat.isOccupied).length, 0
    );

    toast.success(`Occupancy calculated: ${occupiedSeats}/${totalSeats} seats occupied`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertCircle className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Error Loading Data</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Failed to fetch entities data from the server. Please check your connection and try again.
          </p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Cinema Hall Seat Mapping System</h1>
          <p className="text-lg text-gray-600">Map seats and monitor occupancy in real-time</p>
        </div>

        {/* Selection Controls */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Entity</label>
              <Select value={selectedEntity} onValueChange={setSelectedEntity} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoading ? "Loading..." : "Select Entity"} />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  ) : (
                    apiData?.entities.map(entity => (
                      <SelectItem key={entity.id} value={entity.id}>
                        {entity.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hall</label>
              <Select value={selectedHall} onValueChange={setSelectedHall} disabled={!selectedEntity || isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Hall" />
                </SelectTrigger>
                <SelectContent>
                  {availableHalls.map(hall => (
                    <SelectItem key={hall.id} value={hall.id}>
                      {hall.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Camera</label>
              <Select value={selectedCamera} onValueChange={setSelectedCamera} disabled={!selectedHall || isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Camera" />
                </SelectTrigger>
                <SelectContent>
                  {availableCameras.map(camera => (
                    <SelectItem key={camera.id} value={camera.id}>
                      {camera.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={!selectedCamera}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button disabled={!selectedCamera} className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Hall Image
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {cameraData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Canvas Area */}
            <div className="lg:col-span-2">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  {cameraData.name} - Hall View
                </h3>
                <CinemaCanvas
                  cameraData={cameraData}
                  isDrawingMode={isDrawingMode}
                  currentDrawingRow={currentDrawingRow}
                  currentSeatIndex={currentSeatIndex}
                  onSeatCoordinatesUpdate={handleSeatCoordinatesUpdate}
                />
              </Card>
            </div>

            {/* Controls Area */}
            <div className="space-y-6">
              <SeatManager
                cameraData={cameraData}
                onAddRow={addRow}
                onStartDrawingForRow={startDrawingForRow}
                onStartDrawingForSpecificSeat={startDrawingForSpecificSeat}
              />

              <DrawingControls
                isDrawingMode={isDrawingMode}
                currentDrawingRow={currentDrawingRow}
                currentSeatIndex={currentSeatIndex}
                onStopDrawing={() => {
                  setIsDrawingMode(false);
                  setCurrentDrawingRow("");
                  setCurrentSeatIndex(0);
                }}
              />

              <OccupancyControls
                onSaveBaseColors={saveBaseAverageColorForAll}
                onCalculateOccupancy={calculateOccupancy}
                cameraData={cameraData}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
