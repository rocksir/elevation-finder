import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { type Location, formatElevation, getElevationColor, getElevationLabel, getElevation } from '@/lib/elevation';
import { Loader2, MousePointer, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Fix for default marker icons
const defaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

interface ClickedPoint {
  latitude: number;
  longitude: number;
  elevation: number | null;
  loading: boolean;
}

interface ElevationMapProps {
  locations: Location[];
  unit: 'meters' | 'feet';
  onLocationClick?: (location: Location) => void;
  onAddLocation?: (location: Location) => void;
}

export function ElevationMap({ locations, unit, onLocationClick, onAddLocation }: ElevationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const clickedMarkerRef = useRef<L.Marker | null>(null);
  
  const [clickedPoint, setClickedPoint] = useState<ClickedPoint | null>(null);

  // Create custom icon based on elevation
  const createElevationIcon = useCallback((elevation: number, isTemp = false) => {
    const color = getElevationColor(elevation);
    const border = isTemp ? 'dashed' : 'solid';
    const opacity = isTemp ? '0.9' : '1';
    
    return L.divIcon({
      className: 'custom-elevation-marker',
      html: `
        <div style="
          width: 36px;
          height: 36px;
          background: ${color};
          border: 3px ${border} white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: ${opacity};
        ">
          <span style="
            transform: rotate(45deg);
            color: white;
            font-weight: 600;
            font-size: 10px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
          ">${Math.round(elevation)}m</span>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 2,
      scrollWheelZoom: true,
    });

    // Topographic tiles
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; OpenStreetMap | Tiles &copy; Esri'
    }).addTo(map);

    // Hillshade overlay
    L.tileLayer('https://tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png', {
      opacity: 0.3
    }).addTo(map);

    mapRef.current = map;

    // Click handler
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      
      setClickedPoint({
        latitude: lat,
        longitude: lng,
        elevation: null,
        loading: true,
      });

      try {
        const elevation = await getElevation(lat, lng);
        setClickedPoint({
          latitude: lat,
          longitude: lng,
          elevation,
          loading: false,
        });
      } catch (error) {
        console.error('Failed to get elevation:', error);
        setClickedPoint(null);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when locations change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers that are no longer in locations
    markersRef.current.forEach((marker, id) => {
      if (!locations.find(loc => loc.id === id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add or update markers for current locations
    locations.forEach(location => {
      if (location.elevation === null) return;
      
      const existingMarker = markersRef.current.get(location.id);
      
      if (existingMarker) {
        existingMarker.setLatLng([location.latitude, location.longitude]);
        existingMarker.setIcon(createElevationIcon(location.elevation));
      } else {
        const marker = L.marker([location.latitude, location.longitude], {
          icon: createElevationIcon(location.elevation)
        }).addTo(map);

        const popupContent = `
          <div style="font-family: 'Outfit', sans-serif; min-width: 140px;">
            <h3 style="font-weight: 600; margin: 0 0 4px 0;">${location.name}</h3>
            ${location.country ? `<p style="color: #666; font-size: 12px; margin: 0 0 8px 0;">${location.country}</p>` : ''}
            <p style="font-size: 18px; font-weight: 700; margin: 0; color: ${getElevationColor(location.elevation)};">
              ${formatElevation(location.elevation, unit)}
            </p>
            <p style="font-size: 11px; color: #666; margin: 2px 0 0 0;">${getElevationLabel(location.elevation)}</p>
          </div>
        `;
        
        marker.bindPopup(popupContent);
        marker.on('click', () => onLocationClick?.(location));
        markersRef.current.set(location.id, marker);
      }
    });

    // Fit bounds if locations exist
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.latitude, loc.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }, [locations, unit, createElevationIcon, onLocationClick]);

  // Handle clicked point marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing clicked marker
    if (clickedMarkerRef.current) {
      clickedMarkerRef.current.remove();
      clickedMarkerRef.current = null;
    }

    if (clickedPoint && !clickedPoint.loading && clickedPoint.elevation !== null) {
      const marker = L.marker([clickedPoint.latitude, clickedPoint.longitude], {
        icon: createElevationIcon(clickedPoint.elevation, true)
      }).addTo(map);

      clickedMarkerRef.current = marker;
    }
  }, [clickedPoint, createElevationIcon]);

  const handleAddClickedLocation = useCallback(() => {
    if (!clickedPoint || clickedPoint.elevation === null || !onAddLocation) return;
    
    const location: Location = {
      id: crypto.randomUUID(),
      name: `Point (${clickedPoint.latitude.toFixed(4)}°, ${clickedPoint.longitude.toFixed(4)}°)`,
      latitude: clickedPoint.latitude,
      longitude: clickedPoint.longitude,
      elevation: clickedPoint.elevation,
    };
    
    onAddLocation(location);
    setClickedPoint(null);
  }, [clickedPoint, onAddLocation]);

  const dismissClickedPoint = useCallback(() => {
    setClickedPoint(null);
  }, []);

  return (
    <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-elevation animate-fade-in-up">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Click instruction */}
      <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-card z-[1000] flex items-center gap-2">
        <MousePointer className="h-4 w-4 text-primary" />
        <p className="text-xs font-medium text-foreground">Click anywhere for elevation</p>
      </div>
      
      {/* Clicked point info panel */}
      {clickedPoint && !clickedPoint.loading && clickedPoint.elevation !== null && (
        <div className="absolute bottom-4 right-4 bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-elevation z-[1000] min-w-[200px] animate-fade-in-up">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs text-muted-foreground">Clicked Point</p>
            <button 
              onClick={dismissClickedPoint}
              className="p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
          <p className="text-2xl font-bold" style={{ color: getElevationColor(clickedPoint.elevation) }}>
            {formatElevation(clickedPoint.elevation, unit)}
          </p>
          <p className="text-xs text-muted-foreground mb-1">
            {getElevationLabel(clickedPoint.elevation)}
          </p>
          <p className="text-xs text-muted-foreground font-mono mb-3">
            {clickedPoint.latitude.toFixed(4)}°, {clickedPoint.longitude.toFixed(4)}°
          </p>
          <Button 
            size="sm" 
            className="w-full h-8 text-xs gap-1"
            onClick={handleAddClickedLocation}
          >
            <Plus className="h-3 w-3" />
            Add to Comparison
          </Button>
        </div>
      )}
      
      {/* Elevation legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-card z-[1000]">
        <p className="text-xs font-medium mb-2 text-foreground">Elevation</p>
        <div className="flex flex-col gap-1">
          {[
            { label: 'Peak', color: 'hsl(30, 20%, 92%)' },
            { label: 'High', color: 'hsl(35, 55%, 50%)' },
            { label: 'Mid', color: 'hsl(80, 45%, 50%)' },
            { label: 'Low', color: 'hsl(145, 50%, 45%)' },
            { label: 'Sea', color: 'hsl(200, 75%, 45%)' },
            { label: 'Deep', color: 'hsl(210, 70%, 25%)' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div 
                className="w-4 h-3 rounded-sm" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Map type indicator */}
      <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-card z-[1000]">
        <p className="text-xs font-medium text-foreground">Topographic View</p>
      </div>
      
      {/* Loading indicator */}
      {clickedPoint?.loading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-card z-[1000] flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <p className="text-sm font-medium">Getting elevation...</p>
        </div>
      )}
    </div>
  );
}
