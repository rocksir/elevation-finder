const ContourLines = () => {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="contours" patternUnits="userSpaceOnUse" width="200" height="200">
          <path
            d="M0 100 Q50 80 100 100 T200 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="animate-contour"
            style={{ strokeDasharray: '10 5' }}
          />
          <path
            d="M0 50 Q50 30 100 50 T200 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="animate-contour"
            style={{ strokeDasharray: '10 5', animationDelay: '-5s' }}
          />
          <path
            d="M0 150 Q50 130 100 150 T200 150"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="animate-contour"
            style={{ strokeDasharray: '10 5', animationDelay: '-10s' }}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#contours)" />
    </svg>
  );
};

export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, hsl(186 70% 38% / 0.15), transparent),
            radial-gradient(ellipse 60% 30% at 80% 80%, hsl(145 50% 45% / 0.1), transparent),
            radial-gradient(ellipse 40% 40% at 20% 60%, hsl(200 75% 45% / 0.08), transparent)
          `
        }}
      />
      
      {/* Contour lines */}
      <ContourLines />
      
      {/* Mountain silhouette */}
      <svg
        className="absolute bottom-0 left-0 right-0 h-32 opacity-[0.03]"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
      >
        <path
          d="M0 200 L0 150 L200 80 L350 120 L500 40 L650 100 L800 60 L950 90 L1100 30 L1250 70 L1440 50 L1440 200 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
