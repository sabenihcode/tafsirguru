import { useState } from "react";
import { User } from "lucide-react";

interface LogoProps {
  className?: string;
  fallbackClassName?: string;
}

const LOGO_URL = (import.meta as any).env?.VITE_LOGO_URL || "/logo.png";

export default function Logo({ className = "h-full w-full", fallbackClassName = "h-2/3 w-2/3" }: LogoProps) {
  const [error, setError] = useState(false);

  if (error) {
    return <User className={fallbackClassName} />;
  }

  return (
    <img
      src={LOGO_URL}
      alt="Guru Tafsir"
      className={`object-contain ${className}`}
      onError={() => setError(true)}
    />
  );
}
