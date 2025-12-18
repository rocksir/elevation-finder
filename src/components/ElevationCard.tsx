import { useState, useEffect } from 'react';
import { X, Mountain, Waves, TrendingUp, TrendingDown } from 'lucide-react';
import { type Location, getElevationColor, getElevationLabel, formatElevation } from '@/lib/elevation';
import { cn } from '@/lib/utils';

interface ElevationCardProps {
  location: Location;
  onRemove: () => void;
  unit: 'meters' | 'feet';
  comparisonElevation?: number | null;
  index: number;
}

export function ElevationCard({ location, onRemove, unit, comparisonElevation, index }: ElevationCardProps) {
  const [displayElevation, setDisplayElevation] = useState(0);
  const elevation = location.elevation ?? 0;
  
  // Animate the elevation counter
  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = elevation / steps;
    let current = 0;
    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      current = Math.round((elevation * step) / steps);
      setDisplayElevation(current);
      
      if (step >= steps) {
        setDisplayElevation(elevation);
        clearInterval(timer);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [elevation]);

  const color = getElevationColor(elevation);
  const label = getElevationLabel(elevation);
  const isAboveSeaLevel = elevation >= 0;
  const difference = comparisonElevation !== null && comparisonElevation !== undefined
    ? elevation - comparisonElevation
    : null;

  // Calculate visual height percentage (0-100) for the indicator
  const getHeightPercentage = (elev: number) => {
    // Map elevation from -500m to 5000m to 0-100%
    const min = -500;
    const max = 5000;
    const clamped = Math.max(min, Math.min(max, elev));
    return ((clamped - min) / (max - min)) * 100;
  };

  const heightPercent = getHeightPercentage(elevation);
  const seaLevelPercent = getHeightPercentage(0);

  return (
    <div 
      className="relative bg-card rounded-2xl shadow-card overflow-hidden animate-fade-in-up group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute top-3 right-3 p-1.5 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground z-10"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="p-6">
        {/* Location info */}
        <div className="mb-4">
          <h3 className="font-semibold text-lg truncate">{location.name}</h3>
          {location.country && (
            <p className="text-sm text-muted-foreground">{location.country}</p>
          )}
        </div>
        
        {/* Elevation display */}
        <div className="flex items-end gap-4">
          {/* Visual indicator */}
          <div className="relative w-16 h-32 bg-muted rounded-lg overflow-hidden">
            {/* Sea level marker */}
            <div 
              className="absolute left-0 right-0 h-0.5 bg-elevation-sea z-10"
              style={{ bottom: `${seaLevelPercent}%` }}
            >
              <span className="absolute -left-1 top-1 text-[10px] font-medium text-elevation-sea whitespace-nowrap">
                Sea
              </span>
            </div>
            
            {/* Elevation fill */}
            <div 
              className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out rounded-t"
              style={{ 
                height: `${heightPercent}%`,
                background: isAboveSeaLevel 
                  ? `linear-gradient(to top, hsl(145, 50%, 45%), ${color})`
                  : `linear-gradient(to top, hsl(210, 70%, 25%), ${color})`
              }}
            />
            
            {/* Current level marker */}
            <div 
              className="absolute left-0 right-0 h-1 bg-foreground/80 transition-all duration-1000 ease-out"
              style={{ bottom: `${heightPercent}%` }}
            />
          </div>
          
          {/* Text info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isAboveSeaLevel ? (
                <Mountain className="h-5 w-5" style={{ color }} />
              ) : (
                <Waves className="h-5 w-5" style={{ color }} />
              )}
              <span 
                className="text-sm font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {label}
              </span>
            </div>
            
            <p className="text-4xl font-bold tracking-tight animate-count">
              {formatElevation(displayElevation, unit)}
            </p>
            
            <p className="text-sm text-muted-foreground mt-1">
              {isAboveSeaLevel ? 'above' : 'below'} sea level
            </p>
            
            {/* Comparison */}
            {difference !== null && difference !== 0 && (
              <div className={cn(
                "flex items-center gap-1 mt-2 text-sm font-medium",
                difference > 0 ? "text-accent" : "text-elevation-sea"
              )}>
                {difference > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>
                  {formatElevation(Math.abs(difference), unit)} {difference > 0 ? 'higher' : 'lower'}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Coordinates */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground font-mono">
            {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
          </p>
        </div>
      </div>
    </div>
  );
}
