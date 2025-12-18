import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Search, MapPin, BarChart3, Mountain } from 'lucide-react';

const STORAGE_KEY = 'elevation-finder-onboarded';

export function HowToUseModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasOnboarded = localStorage.getItem(STORAGE_KEY);
    if (!hasOnboarded) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mountain className="h-5 w-5 text-primary" />
            Welcome to Elevation Finder
          </DialogTitle>
          <DialogDescription>
            Discover elevation data for any location on Earth
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Search className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Search Locations</h4>
              <p className="text-sm text-muted-foreground">
                Type any city, mountain, or place name to find its elevation
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Click on Map</h4>
              <p className="text-sm text-muted-foreground">
                Switch to Map view and click anywhere to get elevation data
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Compare Elevations</h4>
              <p className="text-sm text-muted-foreground">
                Add multiple locations to see a comparison chart
              </p>
            </div>
          </div>
        </div>
        
        <Button onClick={handleClose} className="w-full">
          Get Started
        </Button>
      </DialogContent>
    </Dialog>
  );
}
