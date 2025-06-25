
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

// Mock data for testing when API is unavailable
const mockData: TransformedData = {
  entities: [
    { id: 'entity1', name: 'Cinema Complex A' },
    { id: 'entity2', name: 'Cinema Complex B' }
  ],
  halls: [
    { id: 'hall1', name: 'Hall 1', entityId: 'entity1' },
    { id: 'hall2', name: 'Hall 2', entityId: 'entity1' },
    { id: 'hall3', name: 'Hall 3', entityId: 'entity2' }
  ],
  cameras: [
    { id: 'camera1', name: 'Front Camera', hallId: 'hall1' },
    { id: 'camera2', name: 'Back Camera', hallId: 'hall1' },
    { id: 'camera3', name: 'Main Camera', hallId: 'hall2' },
    { id: 'camera4', name: 'Side Camera', hallId: 'hall3' }
  ]
};

const fetchEntitiesData = async (): Promise<TransformedData> => {
  console.log('Attempting to fetch data from API...');
  
  try {
    const response = await fetch('http://192.168.0.227:8000/entities', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ApiResponse = await response.json();
    console.log('API Response data:', data);
    
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
    
    console.log('Transformed data:', { entities, halls, cameras });
    return { entities, halls, cameras };
    
  } catch (error) {
    console.error('API fetch failed:', error);
    console.log('Using mock data instead...');
    
    // Return mock data when API fails
    return mockData;
  }
};

export const useEntitiesData = () => {
  return useQuery({
    queryKey: ['entities'],
    queryFn: fetchEntitiesData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1, // Only retry once before falling back to mock data
  });
};
