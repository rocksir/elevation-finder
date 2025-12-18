import { type Location, formatElevation } from '@/lib/elevation';

interface ComparisonChartProps {
  locations: Location[];
  unit: 'meters' | 'feet';
}

export function ComparisonChart({ locations, unit }: ComparisonChartProps) {
  if (locations.length < 2) return null;
  
  const validLocations = locations.filter(l => l.elevation !== null);
  if (validLocations.length < 2) return null;
  
  const elevations = validLocations.map(l => l.elevation!);
  const maxElevation = Math.max(...elevations, 100);
  const minElevation = Math.min(...elevations, 0);
  const range = maxElevation - minElevation;
  const padding = range * 0.1;
  
  const chartMin = minElevation - padding;
  const chartMax = maxElevation + padding;
  const chartRange = chartMax - chartMin;
  
  const getBarHeight = (elevation: number) => {
    return ((elevation - chartMin) / chartRange) * 100;
  };
  
  const seaLevelPosition = ((0 - chartMin) / chartRange) * 100;

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 animate-fade-in-up">
      <h3 className="font-semibold text-lg mb-6">Elevation Comparison</h3>
      
      <div className="relative h-64">
        {/* Sea level line */}
        {seaLevelPosition >= 0 && seaLevelPosition <= 100 && (
          <div 
            className="absolute left-0 right-0 border-t-2 border-dashed border-elevation-sea/50 z-10"
            style={{ bottom: `${seaLevelPosition}%` }}
          >
            <span className="absolute -top-3 left-0 text-xs font-medium text-elevation-sea bg-card px-1">
              Sea Level (0m)
            </span>
          </div>
        )}
        
        {/* Bars */}
        <div className="flex items-end justify-around h-full gap-4 px-4">
          {validLocations.map((location, index) => {
            const height = getBarHeight(location.elevation!);
            const isAboveSeaLevel = location.elevation! >= 0;
            
            return (
              <div key={location.id} className="flex flex-col items-center flex-1 max-w-24 h-full">
                {/* Elevation label */}
                <div 
                  className="mb-2 text-center transition-all duration-700"
                  style={{ 
                    transform: `translateY(-${Math.min(height, 90)}%)`,
                    opacity: 0,
                    animation: `fade-in-up 0.5s ease-out ${index * 150}ms forwards`
                  }}
                >
                  <p className="text-lg font-bold whitespace-nowrap">
                    {formatElevation(location.elevation!, unit)}
                  </p>
                </div>
                
                {/* Bar */}
                <div className="relative w-full h-full flex flex-col justify-end">
                  <div
                    className="w-full rounded-t-lg transition-all duration-1000 ease-out"
                    style={{ 
                      height: `${height}%`,
                      background: isAboveSeaLevel
                        ? 'linear-gradient(to top, hsl(145, 50%, 45%), hsl(80, 45%, 50%))'
                        : 'linear-gradient(to top, hsl(210, 70%, 25%), hsl(200, 75%, 45%))',
                      animationDelay: `${index * 100}ms`
                    }}
                  />
                </div>
                
                {/* Location name */}
                <p className="mt-3 text-sm font-medium text-center truncate w-full px-1">
                  {location.name.split(',')[0]}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Stats */}
      <div className="mt-6 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Highest</p>
          <p className="font-semibold text-accent">
            {formatElevation(Math.max(...elevations), unit)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Lowest</p>
          <p className="font-semibold text-elevation-sea">
            {formatElevation(Math.min(...elevations), unit)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Difference</p>
          <p className="font-semibold">
            {formatElevation(Math.max(...elevations) - Math.min(...elevations), unit)}
          </p>
        </div>
      </div>
    </div>
  );
}
