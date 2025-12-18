import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { searchLocations, getElevation, type GeocodingResult, type Location } from '@/lib/elevation';
import { cn } from '@/lib/utils';
import { useRateLimit } from '@/hooks/useRateLimit';
import { useToast } from '@/hooks/use-toast';

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void;
}

export function LocationSearch({ onLocationSelect }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingElevation, setLoadingElevation] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Rate limit: 10 searches per minute
  const { isLimited, checkRateLimit } = useRateLimit({ maxRequests: 10, windowMs: 60000 });

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        if (!checkRateLimit()) {
          toast({
            title: "Too many requests",
            description: "Please wait a moment before searching again.",
            variant: "destructive",
          });
          return;
        }
        
        setIsLoading(true);
        try {
          const locations = await searchLocations(query);
          setResults(locations);
          setIsOpen(true);
        } catch (error: any) {
          console.error('Search error:', error);
          if (error?.message === 'quota_exceeded') {
            toast({
              title: 'Monthly API limit reached',
              description: 'You have reached your monthly API request limit. Try again next month or use the map to pick locations.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Search failed',
              description: 'Unable to search locations right now. Please try again later.',
            });
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, checkRateLimit, toast]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (result: GeocodingResult) => {
    const key = `${result.latitude}-${result.longitude}`;
    setLoadingElevation(key);
    
    try {
      const elevation = await getElevation(result.latitude, result.longitude);
      const location: Location = {
        id: crypto.randomUUID(),
        name: result.admin1 ? `${result.name}, ${result.admin1}` : result.name,
        latitude: result.latitude,
        longitude: result.longitude,
        elevation,
        country: result.country,
      };
      onLocationSelect(location);
      setQuery('');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to get elevation:', error);
      const err: any = error;
      if (err?.message === 'quota_exceeded') {
        toast({
          title: 'Monthly API limit reached',
          description: 'You have reached your monthly API request limit. Try again next month or use the map to pick locations.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Elevation failed',
          description: 'Unable to retrieve elevation for this location. Please try again.',
        });
      }
    } finally {
      setLoadingElevation(null);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for a location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 pr-4 h-14 text-base shadow-card"
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
        )}
      </div>
      
      {isOpen && results.length > 0 && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-elevation border border-border overflow-hidden z-[9999] animate-fade-in-up"
          style={{ pointerEvents: 'auto' }}
        >
          {results.map((result) => {
            const key = `${result.latitude}-${result.longitude}`;
            const isLoadingThis = loadingElevation === key;
            
            return (
              <button
                key={key}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleSelect(result);
                }}
                disabled={isLoadingThis}
                className={cn(
                  "w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left cursor-pointer",
                  isLoadingThis && "opacity-70"
                )}
                style={{ pointerEvents: 'auto' }}
              >
                {isLoadingThis ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />
                ) : (
                  <MapPin className="h-5 w-5 text-primary shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {result.admin1 ? `${result.name}, ${result.admin1}` : result.name}
                  </p>
                  {result.country && (
                    <p className="text-sm text-muted-foreground truncate">{result.country}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
      {isOpen && !isLoading && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-elevation border border-border p-3 z-[9999] animate-fade-in-up">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            <p className="text-sm text-muted-foreground">If search doesn't return results, try using the map to pick a location instead.</p>
          </div>
        </div>
      )}
    </div>
  );
}
