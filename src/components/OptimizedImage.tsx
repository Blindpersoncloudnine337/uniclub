import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  loading?: 'lazy' | 'eager';
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  loading = 'lazy',
  onError
}) => {
  // Debug logging for publisher logos
  if (src && (src.includes('favicon') || src.includes('google.com/s2/favicons'))) {
    console.log('🖼️ OptimizedImage rendering logo:', {
      src,
      alt,
      className,
      containerClassName
    });
  }

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${className}`}
        loading={loading}
        onError={(e) => {
          console.log('🚨 OptimizedImage onError:', {
            src,
            alt,
            error: e
          });
          if (onError) {
            onError(e);
          }
        }}
      />
    </div>
  );
};

export default OptimizedImage;
