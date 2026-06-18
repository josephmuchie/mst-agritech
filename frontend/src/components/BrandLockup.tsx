import React from 'react';
import BrandLogo from './BrandLogo';

interface BrandLockupProps {
  /** Height of the icon in px; text scales relative to this. */
  iconHeight?: number;
  /** Text colour (defaults to white for dark backgrounds). */
  color?: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Company brand lockup: the white icon paired with the two-line wordmark
 * "MukuyuSmart" / "Technologies". Used on dark surfaces (sidebar, drawer).
 */
const BrandLockup: React.FC<BrandLockupProps> = ({
  iconHeight = 44,
  color = '#FFFFFF',
  onClick,
  className,
  style,
}) => (
  <div
    className={className}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: Math.round(iconHeight * 0.26),
      cursor: onClick ? 'pointer' : undefined,
      minWidth: 0,
      ...style,
    }}
  >
    <BrandLogo variant="icon-white" height={iconHeight} />
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05, minWidth: 0 }}>
      <span
        style={{
          color,
          fontSize: Math.round(iconHeight * 0.42),
          fontWeight: 700,
          letterSpacing: 0.2,
          whiteSpace: 'nowrap',
        }}
      >
        MukuyuSmart
      </span>
      <span
        style={{
          color,
          fontSize: Math.round(iconHeight * 0.30),
          fontWeight: 400,
          letterSpacing: 2,
          opacity: 0.92,
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
        }}
      >
        Technologies
      </span>
    </div>
  </div>
);

export default BrandLockup;
