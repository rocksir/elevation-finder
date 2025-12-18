import { cn } from '@/lib/utils';

interface AdBannerProps {
  slot: 'header' | 'content' | 'footer';
  className?: string;
}

/**
 * Google AdSense compliant ad banner component
 * Replace 'ca-pub-XXXXXXXXXXXXXXXX' with your actual AdSense Publisher ID
 * and 'XXXXXXXXXX' with your ad slot ID when you have them
 */
export const AdBanner = ({ slot, className }: AdBannerProps) => {
  // Ad sizes following Google's recommended responsive guidelines
  const adConfig = {
    header: {
      label: 'Advertisement',
      minHeight: '90px',
      format: 'horizontal', // Leaderboard (728x90) or responsive
    },
    content: {
      label: 'Advertisement',
      minHeight: '250px',
      format: 'rectangle', // Medium Rectangle (300x250) or responsive
    },
    footer: {
      label: 'Advertisement',
      minHeight: '90px',
      format: 'horizontal',
    },
  };

  const config = adConfig[slot];

  return (
    <div 
      className={cn(
        "w-full flex flex-col items-center justify-center",
        className
      )}
    >
      {/* Required: Clear ad label for Google AdSense compliance */}
      <span className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
        {config.label}
      </span>
      
      {/* Ad container - placeholder until AdSense is configured */}
      <div 
        className={cn(
          "w-full max-w-[728px] bg-muted/30 border border-border/50 rounded-lg flex items-center justify-center text-muted-foreground text-sm",
          slot === 'content' && "max-w-[336px]"
        )}
        style={{ minHeight: config.minHeight }}
      >
        {/* 
          Replace this placeholder with actual AdSense code:
          
          <ins className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client=ca-pub-4333918908225540"
            data-ad-slot="XXXXXXXXXX"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
          
          And add this useEffect to initialize:
          useEffect(() => {
            try {
              (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
              console.error('AdSense error:', e);
            }
          }, []);
        */}
        <div className="text-center p-4">
          <p className="font-medium">Ad Space</p>
          <p className="text-xs mt-1 opacity-70">
            {slot === 'header' && 'Leaderboard (728×90)'}
            {slot === 'content' && 'Rectangle (300×250)'}
            {slot === 'footer' && 'Leaderboard (728×90)'}
          </p>
        </div>
      </div>
    </div>
  );
};
