import { LatLng } from "@/types";

/**
 * Geocodes an address using the HERE API to get its latitude and longitude coordinates
 * @param address The address string to geocode
 * @returns Promise resolving to an object containing latitude and longitude
 * @throws Error if address cannot be found or API request fails
 */
export async function geocodeAddress(address: string): Promise<LatLng> {
  // HERE API endpoint for geocoding
  const endpoint = 'https://geocode.search.hereapi.com/v1/geocode';
  
  // Construct the URL with query parameters
  const url = `${endpoint}?q=${encodeURIComponent(address)}&apiKey=${import.meta.env.HERE_API_KEY}`;

  // Make the API request
  const response = await fetch(url);
  const data = await response.json();

  // HERE API returns results in 'items' array instead of 'results'
  if (!data.items?.[0]) {
    throw new Error('Address not found');
  }

  // Extract coordinates from the first result
  // HERE API uses 'position' object with 'lat' and 'lng' properties
  const { position } = data.items[0];
  return {
    lat: position.lat,
    lng: position.lng
  };
}