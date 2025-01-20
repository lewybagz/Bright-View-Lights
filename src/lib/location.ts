// src/lib/location.ts
import { LatLng } from "@/types";

// Define the center points for our regions
const MARANA_CENTER: LatLng = {
  lat: 32.4364, // Marana center coordinates
  lng: -111.2224
};

const TUCSON_CENTER: LatLng = {
  lat: 32.2226, // Tucson center coordinates
  lng: -110.9747
};

// Radius in kilometers
const MARANA_RADIUS = 15;
const IN_TOWN_RADIUS = 25;

export type LocationTag = 'marana' | 'in-town' | 'out-of-town' | 'catalina' | 'vail';

function calculateDistance(point1: LatLng, point2: LatLng): number {
  // Haversine formula to calculate distance between two points
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);
  const lat1 = toRad(point1.lat);
  const lat2 = toRad(point2.lat);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI/180);
}

export function determineLocationTag(coordinates: LatLng): LocationTag {
  const maranaDistance = calculateDistance(coordinates, MARANA_CENTER);
  const tucsonDistance = calculateDistance(coordinates, TUCSON_CENTER);

  if (maranaDistance <= MARANA_RADIUS) {
    return 'marana';
  } else if (tucsonDistance <= IN_TOWN_RADIUS) {
    return 'in-town';
  }
  return 'out-of-town';
}