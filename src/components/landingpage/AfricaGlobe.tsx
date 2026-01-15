const AfricaGlobe = () => {
  return (
    <div className="relative w-72 h-72 md:w-[450px] md:h-[450px] animate-float flex items-center justify-center">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full animate-pulse" />
      
      {/* Africa silhouette */}
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
      >
        <defs>
          <linearGradient id="africaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="1" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
          </linearGradient>
          <filter id="glow">
             <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
             <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
             </feMerge>
          </filter>
        </defs>

        {/* Shadow/background effect */}
        <ellipse 
          cx="110" 
          cy="185" 
          rx="60" 
          ry="12" 
          className="fill-slate-900/10 dark:fill-slate-100/5 blur-sm"
        />
        
        {/* Africa continent shape */}
        <path
          d="M85 30C90 25 100 22 110 25C120 28 125 35 130 42C135 50 140 55 142 65C145 75 147 85 145 95C143 105 140 115 135 125C130 135 125 145 118 152C110 160 100 165 90 168C80 170 70 170 62 165C55 160 50 150 48 140C45 130 45 120 48 110C50 100 55 90 60 82C65 75 72 68 78 60C82 52 80 35 85 30Z"
          fill="url(#africaGradient)"
          className="transition-all duration-1000 group-hover:scale-105"
        />
        
        {/* Madagascar */}
        <path
          d="M150 130C152 125 155 128 156 135C157 142 155 150 152 155C149 158 146 155 146 148C146 142 148 135 150 130Z"
          fill="url(#africaGradient)"
          opacity="0.8"
        />

        {/* Globe icon - Floating tech element */}
        <g transform="translate(130, 40)" className="animate-bounce-subtle">
          <circle 
            cx="35" 
            cy="35" 
            r="32" 
            className="stroke-white/50 dark:stroke-slate-800/50 fill-white dark:fill-slate-900" 
            strokeWidth="1"
          />
          <circle 
            cx="35" 
            cy="35" 
            r="28" 
            className="stroke-primary/30" 
            fill="none"
            strokeWidth="0.5"
            strokeDasharray="4 4"
          />
          
          {/* Internal tech grid */}
          <path d="M35 15 C45 35 45 35 35 55" className="stroke-primary/50" fill="none" strokeWidth="2" />
          <path d="M15 35 C35 45 35 45 55 35" className="stroke-primary/50" fill="none" strokeWidth="2" />
          
          <circle cx="35" cy="35" r="6" className="fill-primary shadow-lg" filter="url(#glow)" />
        </g>
        
        {/* Connection points across Africa */}
        <circle cx="95" cy="85" r="3" fill="white" className="animate-pulse" />
        <circle cx="75" cy="115" r="2.5" fill="white" className="animate-pulse" style={{ animationDelay: "0.5s" }} />
        <circle cx="115" cy="135" r="2" fill="white" className="animate-pulse" style={{ animationDelay: "1s" }} />
      </svg>
    </div>
  );
};


export default AfricaGlobe;
