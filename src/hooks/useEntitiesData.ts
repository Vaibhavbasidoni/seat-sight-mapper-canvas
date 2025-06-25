
import { useQuery } from '@tanstack/react-query';

interface ApiCamera {
  cameraId: string;
  cameraName: string;
}

interface ApiHall {
  hallId: string;
  hallName: string;
  cameras: ApiCamera[];
}

interface ApiEntity {
  _id: string;
  entityName: string;
  halls: ApiHall[];
}

interface ApiResponse {
  entities: ApiEntity[];
}

// Transform API data to match existing interface structure
export interface TransformedEntity {
  id: string;
  name: string;
}

export interface TransformedHall {
  id: string;
  name: string;
  entityId: string;
}

export interface TransformedCamera {
  id: string;
  name: string;
  hallId: string;
}

export interface TransformedData {
  entities: TransformedEntity[];
  halls: TransformedHall[];
  cameras: TransformedCamera[];
}

const fetchEntitiesData = async (): Promise<TransformedData> => {
  const response = await fetch('http://192.168.0.227:8000/entities');
  
  if (!response.ok) {
    throw new Error('Failed to fetch entities data');
  }
  
  const data: ApiResponse = await response.json();
  
  // Transform the data to match existing structure
  const entities: TransformedEntity[] = data.entities.map(entity => ({
    id: entity._id,
    name: entity.entityName
  }));
  
  const halls: TransformedHall[] = data.entities.flatMap(entity =>
    entity.halls.map(hall => ({
      id: hall.hallId,
      name: hall.hallName,
      entityId: entity._id
    }))
  );
  
  const cameras: TransformedCamera[] = data.entities.flatMap(entity =>
    entity.halls.flatMap(hall =>
      hall.cameras.map(camera => ({
        id: camera.cameraId,
        name: camera.cameraName,
        hallId: hall.hallId
      }))
    )
  );
  
  return { entities, halls, cameras };
};

export const useEntitiesData = () => {
  return useQuery({
    queryKey: ['entities'],
    queryFn: fetchEntitiesData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
