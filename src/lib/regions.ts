// src/lib/regions.ts
import * as turf from '@turf/turf';
import { LatLng } from '@/types';

// Define polygons for each region using real coordinates
// These coordinates form the boundaries of each region
const MARANA_POLYGON = [
  [-111.233285, 32.365811], // Southwest corner
  [-111.148254, 32.352376], // Bottom center
  [-111.067812, 32.352376], // Southeast corner
  [-111.037837, 32.488960], // Northeast corner
  [-111.157736, 32.501601], // Top center
  [-111.286811, 32.501859], // Northwest corner
  [-111.233285, 32.365811], // Back to start
];

const TUCSON_POLYGON = [
  [-111.011296, 32.127677], // Southwest corner
  [-110.858669, 31.991068], // Bottom center
  [-110.720745, 32.028485], // Southeast corner
  [-110.755592, 32.258133], // Northeast corner
  [-110.904520, 32.277436], // Top center
  [-111.044912, 32.319578], // Northwest corner
  [-111.011296, 32.127677], // Back to start
];

const CATALINA_POLYGON = [
  [-111.044946, 32.319676], // Southwest corner
  [-110.904552, 32.277525],  // Bottom center
  [-110.815927, 32.266234], // Southeast corner
  [-110.824361, 32.337438], // Northeast corner
  [-110.897146, 32.337201], // Top center
  [-111.066020, 32.359374], // Northwest corner
  [-111.044946, 32.319676], // Back to start
];

const VAIL_POLYGON = [
  [-110.72142, 31.963422],  // Southwest corner
  [-110.697737, 31.963131], // Bottom center
  [-110.672123, 31.963290], // Southeast corner
  [-110.657234, 32.104183], // Northeast corner
  [-110.689888, 32.111929], // Top center
  [-110.735782, 32.131273], // Northwest corner
  [-110.720294, 32.028221],  // Back to start
  [-110.72142, 31.963422],  // Back to start
];

// oro valley
const ORO_VALLEY_POLYGON = [
  [-111.066129, 32.359411], // Southwest corner
  [-111.012696, 32.352687], // Bottom center
  [-110.961314, 32.345720], // Southeast corner
  [-110.944476, 32.474303], // Northeast corner
  [-110.981870, 32.474322,], // Top center
  [-111.042691, 32.466431], // Northwest corner
  [-111.066129, 32.359411], // Back to start
];

// Helper function to check if a point is inside a polygon
function isPointInPolygon(point: LatLng, polygon: number[][]): boolean {
  // Convert our point to GeoJSON format
  const pt = turf.point([point.lng, point.lat]);
  
  // Convert our polygon coordinates to a GeoJSON polygon
  const poly = turf.polygon([polygon]);
  
  // Check if point is inside polygon
  return turf.booleanPointInPolygon(pt, poly);
}

export type LocationTag = 'marana' | 'in-town' | 'catalina' | 'vail' | 'out-of-town' | 'oro-valley';

// Main function to determine which region a point falls into
export function determineLocationTag(coordinates: LatLng): LocationTag {
  if (isPointInPolygon(coordinates, MARANA_POLYGON)) {
    return 'marana';
  }
  
  if (isPointInPolygon(coordinates, TUCSON_POLYGON)) {
    return 'in-town';
  }

  if (isPointInPolygon(coordinates, CATALINA_POLYGON)) {
    return 'catalina';
  }

  if (isPointInPolygon(coordinates, VAIL_POLYGON)) {
    return 'vail';
  }

  if (isPointInPolygon(coordinates, ORO_VALLEY_POLYGON)) {
    return 'oro-valley';
  }
  
  return 'out-of-town';
}

// Utility function to visualize service areas (useful for debugging)
export function generateGeoJSON(): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: 'Marana' },
        geometry: {
          type: 'Polygon',
          coordinates: [MARANA_POLYGON]
        }
      },
      {
        type: 'Feature',
        properties: { name: 'Tucson' },
        geometry: {
          type: 'Polygon',
          coordinates: [TUCSON_POLYGON]
        }
      },
      {
        type: 'Feature',
        properties: { name: 'Catalina' },
        geometry: {
          type: 'Polygon',
          coordinates: [CATALINA_POLYGON]
        }
      },
      {
        type: 'Feature',
        properties: { name: 'Vail' },
        geometry: {
          type: 'Polygon',
          coordinates: [VAIL_POLYGON]
      }
      },
      {
        type: 'Feature',
        properties: { name: 'Oro Valley' },
        geometry: {
          type: 'Polygon',
          coordinates: [ORO_VALLEY_POLYGON]
      }
      }

    ]
  };
}