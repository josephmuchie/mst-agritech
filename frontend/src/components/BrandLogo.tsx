import React from 'react';
import { getBrandSrc, type BrandVariant } from '../brand/brandAssets';

interface BrandLogoProps {
  variant: BrandVariant;
  height?: number;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const BrandLogo: React.FC<BrandLogoProps> = ({
  variant,
  height = 32,
  alt = 'MST Agritech',
  className,
  style,
  onClick,
}) => {
  const isIcon = variant.startsWith('icon-');

  return (
    <img
      src={getBrandSrc(variant)}
      alt={alt}
      className={className}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      style={{
        height,
        width: isIcon ? height : 'auto',
        maxWidth: '100%',
        objectFit: 'contain',
        display: 'block',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    />
  );
};

export default BrandLogo;
