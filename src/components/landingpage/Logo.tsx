interface LogoProps {
  size?: "sm" | "md" | "lg";
}

const Logo = ({ size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: {
      svg: "w-6 h-6",
      text: "text-xs",
    },
    md: {
      svg: "w-10 h-10",
      text: "text-lg",
    },
    lg: {
      svg: "w-12 h-12",
      text: "text-xl",
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="flex items-center gap-2">
      <svg
        width={size === "sm" ? "24" : size === "lg" ? "48" : "40"}
        height={size === "sm" ? "24" : size === "lg" ? "48" : "40"}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`text-primary ${currentSize.svg}`}
      >
        {/* Tree trunk */}
        <path
          d="M20 38V22"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Main branches */}
        <path
          d="M20 22L14 16M20 22L26 16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M20 26L12 20M20 26L28 20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M20 30L10 24M20 30L30 24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Leaves/circles at branch ends */}
        <circle cx="14" cy="14" r="3" fill="currentColor" />
        <circle cx="26" cy="14" r="3" fill="currentColor" />
        <circle cx="10" cy="18" r="2.5" fill="currentColor" />
        <circle cx="30" cy="18" r="2.5" fill="currentColor" />
        <circle cx="8" cy="22" r="2" fill="currentColor" />
        <circle cx="32" cy="22" r="2" fill="currentColor" />
        {/* Top leaf */}
        <circle cx="20" cy="10" r="4" fill="currentColor" />
        {/* Small accent leaves */}
        <circle cx="17" cy="6" r="2" fill="currentColor" opacity="0.7" />
        <circle cx="23" cy="6" r="2" fill="currentColor" opacity="0.7" />
      </svg>
      <span className={`font-display ${currentSize.text} font-semibold text-hero`}>
        PARA <span className="font-normal">LEARN</span>
      </span>
    </div>
  );
};

export default Logo;
