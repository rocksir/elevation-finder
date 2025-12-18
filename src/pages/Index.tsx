import { useState } from 'react';
import { Mountain, ArrowLeftRight, Ruler, Map, LayoutGrid, HelpCircle } from 'lucide-react';
import { LocationSearch } from '@/components/LocationSearch';
import { ElevationCard } from '@/components/ElevationCard';
import { ComparisonChart } from '@/components/ComparisonChart';
import { ElevationMap } from '@/components/ElevationMap';
import { HeroBackground } from '@/components/HeroBackground';
import { HowToUseModal } from '@/components/HowToUseModal';
import { AdBanner } from '@/components/AdBanner';
import { Button } from '@/components/ui/button';
import { type Location } from '@/lib/elevation';
import { cn } from '@/lib/utils';

type ViewMode = 'cards' | 'map';

const Index = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [unit, setUnit] = useState<'meters' | 'feet'>('meters');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [showHelp, setShowHelp] = useState(false);

  const handleLocationSelect = (location: Location) => {
    setLocations((prev) => [...prev, location]);
  };

  const handleRemoveLocation = (id: string) => {
    setLocations((prev) => prev.filter((l) => l.id !== id));
  };

  const clearAll = () => {
    setLocations([]);
  };

  const toggleUnit = () => {
    setUnit((prev) => (prev === 'meters' ? 'feet' : 'meters'));
  };

  // First location is the comparison base
  const comparisonBase = locations[0]?.elevation ?? null;

  return (
    <div className="min-h-screen bg-background relative">
      <HeroBackground />
      <HowToUseModal />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="pt-12 pb-8 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6 animate-fade-in-up">
              <Mountain className="h-4 w-4" />
              <span>Powered by SRTM elevation data</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              Elevation
              <span className="bg-gradient-to-r from-primary via-accent to-elevation-sea bg-clip-text text-transparent"> Finder</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Discover the height above or below sea level for any location on Earth. 
              Compare elevations between different places.
            </p>
            
            {/* Search */}
            <div className="flex justify-center mb-6 animate-fade-in-up relative z-50" style={{ animationDelay: '300ms', overflow: 'visible' }}>
              <LocationSearch onLocationSelect={handleLocationSelect} />
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-center gap-3 flex-wrap animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleUnit}
                className="gap-2"
              >
                <Ruler className="h-4 w-4" />
                {unit === 'meters' ? 'Meters' : 'Feet'}
              </Button>
              
              {/* View mode toggle */}
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setViewMode('cards')}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 transition-colors",
                    viewMode === 'cards' 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-card hover:bg-muted text-muted-foreground"
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 transition-colors",
                    viewMode === 'map' 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-card hover:bg-muted text-muted-foreground"
                  )}
                >
                  <Map className="h-4 w-4" />
                  Map
                </button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  localStorage.removeItem('elevation-finder-onboarded');
                  window.location.reload();
                }}
                className="text-muted-foreground gap-1"
              >
                <HelpCircle className="h-4 w-4" />
                Help
              </Button>
              
              {locations.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-muted-foreground"
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Top Ad Banner - below header */}
        <div className="px-4 mb-8">
          <AdBanner slot="header" className="max-w-4xl mx-auto" />
        </div>

        {/* Content */}
        <main className="px-4 pb-16">
          <div className="max-w-6xl mx-auto">
            {/* Map View - always available */}
            {viewMode === 'map' && (
              <div className="space-y-8">
                <ElevationMap 
                  locations={locations} 
                  unit={unit}
                  onAddLocation={handleLocationSelect}
                />
                
                {/* Comparison chart - visible when multiple locations */}
                {locations.length >= 2 && (
                  <ComparisonChart locations={locations} unit={unit} />
                )}
              </div>
            )}
            
            {/* Cards View */}
            {viewMode === 'cards' && (
              <>
                {locations.length === 0 ? (
                  <div className="text-center py-16 animate-fade-in-up">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                      <ArrowLeftRight className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No locations yet</h2>
                    <p className="text-muted-foreground mb-4">
                      Search for a location or switch to Map view to click anywhere
                    </p>
                    <Button
                      variant="elevation"
                      onClick={() => setViewMode('map')}
                      className="gap-2"
                    >
                      <Map className="h-4 w-4" />
                      Explore Map
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {locations.map((location, index) => (
                        <ElevationCard
                          key={location.id}
                          location={location}
                          onRemove={() => handleRemoveLocation(location.id)}
                          unit={unit}
                          comparisonElevation={index > 0 ? comparisonBase : null}
                          index={index}
                        />
                      ))}
                    </div>
                    
                    {/* Comparison chart - always visible when multiple locations */}
                    <ComparisonChart locations={locations} unit={unit} />
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        {/* Bottom Ad Banner - above footer */}
        <div className="px-4 py-8">
          <AdBanner slot="footer" className="max-w-4xl mx-auto" />
        </div>

        {/* Footer */}
        <footer className="border-t border-border py-6 px-4">
          <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
            <p>
              Elevation data from{' '}
              <a 
                href="https://open-meteo.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Open-Meteo
              </a>
              {' '}using NASA SRTM (Shuttle Radar Topography Mission) data.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
