export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number | null;
  country?: string;
import quota from "../lib/quota";

// Open-Meteo Geocoding API
export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  if (!query.trim()) return [];

  // Each search counts as 1 request against the monthly quota
  if (!quota.canConsume(1)) {
    throw new Error("quota_exceeded");
  }

  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
  );

  if (!response.ok) throw new Error("Failed to search locations");

  const data = await response.json();

  // consume the quota only after a successful response
  quota.consume(1);

  return (data.results || []).map((result: any) => ({
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country,
    admin1: result.admin1,
  }));
}

// Open-Meteo Elevation API (uses SRTM data, very accurate)
// Open-Meteo Elevation API (uses SRTM data, very accurate)
export async function getElevation(latitude: number, longitude: number): Promise<number> {
  // Each elevation request counts as 1 request against the monthly quota
  if (!quota.canConsume(1)) {
    throw new Error("quota_exceeded");
  }

  const response = await fetch(
    `https://api.open-meteo.com/v1/elevation?latitude=${latitude}&longitude=${longitude}`
  );

  if (!response.ok) throw new Error("Failed to get elevation");

  const data = await response.json();

  quota.consume(1);
  return data.elevation[0];
}

// Get elevation color based on height
export function getElevationColor(elevation: number): string {
  if (elevation < -100) return 'hsl(210, 70%, 25%)'; // Deep ocean
  if (elevation < 0) return 'hsl(200, 75%, 45%)'; // Sea level
  if (elevation < 500) return 'hsl(145, 50%, 45%)'; // Low land
  if (elevation < 1500) return 'hsl(80, 45%, 50%)'; // Mid elevation
  if (elevation < 3000) return 'hsl(35, 55%, 50%)'; // High elevation
  return 'hsl(30, 20%, 92%)'; // Peak/snow
}

// Get elevation label
export function getElevationLabel(elevation: number): string {
  if (elevation < -100) return 'Deep Ocean';
  if (elevation < 0) return 'Below Sea Level';
  if (elevation < 200) return 'Coastal/Lowland';
  if (elevation < 500) return 'Low Elevation';
  if (elevation < 1500) return 'Mid Elevation';
  if (elevation < 3000) return 'High Elevation';
  if (elevation < 5000) return 'Mountain';
  return 'Extreme Altitude';
}

// Format elevation with unit
export function formatElevation(elevation: number, unit: 'meters' | 'feet' = 'meters'): string {
  if (unit === 'feet') {
    return `${Math.round(elevation * 3.28084).toLocaleString()} ft`;
  }
  return `${Math.round(elevation).toLocaleString()} m`;
}
