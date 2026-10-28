import { useState, useEffect } from "react";
import defaultDoctorAvatar from "@/features/landing/assets/images/doctors/doctor-rafi-kot.jpg";

export interface AvatarImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
  fallbackInitials?: string;
  initialsClassName?: string;
}

/**
 * Avatar component with robust onError handling.
 * Automatically falls back to fallbackSrc or initials if the remote image fails to load.
 */
export function AvatarImage({
  src,
  alt = "Avatar",
  className = "w-full h-full object-cover",
  fallbackSrc = defaultDoctorAvatar,
  fallbackInitials,
  initialsClassName = "w-full h-full flex items-center justify-center font-bold text-sm bg-emerald-100 text-emerald-800",
}: AvatarImageProps) {
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(src || null);

  useEffect(() => {
    setHasError(false);
    setCurrentSrc(src || null);
  }, [src]);

  if (!currentSrc || (hasError && fallbackInitials)) {
    if (fallbackInitials) {
      return <div className={initialsClassName}>{fallbackInitials}</div>;
    }
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        loading="lazy"
      />
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (!hasError) {
          setHasError(true);
          if (!fallbackInitials && fallbackSrc && currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
          }
        }
      }}
    />
  );
}

export default AvatarImage;
