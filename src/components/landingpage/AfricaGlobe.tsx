const AfricaGlobe = () => {
  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 animate-float">
      {/* Africa silhouette */}
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Shadow/background effect */}
        <ellipse 
          cx="110" 
          cy="170" 
          rx="50" 
          ry="10" 
          className="fill-foreground/10"
        />
        
        {/* Africa continent shape */}
        <path
          d="M85 30C90 25 100 22 110 25C120 28 125 35 130 42C135 50 140 55 142 65C145 75 147 85 145 95C143 105 140 115 135 125C130 135 125 145 118 152C110 160 100 165 90 168C80 170 70 170 62 165C55 160 50 150 48 140C45 130 45 120 48 110C50 100 55 90 60 82C65 75 72 68 78 60C82 52 80 35 85 30Z"
          className="fill-foreground"
        />
        
        {/* Madagascar */}
        <path
          d="M150 130C152 125 155 128 156 135C157 142 155 150 152 155C149 158 146 155 146 148C146 142 148 135 150 130Z"
          className="fill-foreground"
        />

        {/* Globe icon */}
        <g transform="translate(120, 50)">
          <circle 
            cx="35" 
            cy="35" 
            r="32" 
            className="stroke-foreground fill-background" 
            strokeWidth="3"
          />
          {/* Horizontal lines */}
          <ellipse 
            cx="35" 
            cy="35" 
            rx="32" 
            ry="12" 
            className="stroke-foreground" 
            strokeWidth="2.5"
            fill="none"
          />
          <ellipse 
            cx="35" 
            cy="35" 
            rx="32" 
            ry="25" 
            className="stroke-foreground" 
            strokeWidth="2"
            fill="none"
          />
          {/* Vertical line */}
          <path 
            d="M35 3V67" 
            className="stroke-foreground" 
            strokeWidth="2.5"
          />
          {/* Curved vertical */}
          <path 
            d="M15 10C25 25 25 45 15 60M55 10C45 25 45 45 55 60" 
            className="stroke-foreground" 
            strokeWidth="2"
            fill="none"
          />
          {/* Cross/plus in center */}
          <circle cx="35" cy="35" r="4" className="fill-foreground" />
        </g>
      </svg>
    </div>
  );
};

export default AfricaGlobe;
