export const BRAND = {
  iconCyan: '/Assets/SVG/icon cyan.svg',
  iconWhite: '/Assets/SVG/icon white.svg',
  iconBlack: '/Assets/SVG/icon black.svg',
  iconSkyBlue: '/Assets/SVG/icon sky blue.svg',
  primary: '/Assets/SVG/Primary logo.svg',
  primaryCyan: '/Assets/SVG/Primary logo cyan.svg',
  primaryBlack: '/Assets/SVG/Primary logo black.svg',
  primaryWhite: '/Assets/PNG/Primary logo white .png',
  secondary: '/Assets/SVG/secondary logo.svg',
  secondaryPng: '/Assets/PNG/secondary logo.png',
  secondaryWhite: '/Assets/SVG/Secondary logo white.svg',
  secondaryCyan: '/Assets/SVG/Secondary logo cyan.svg',
  secondaryBlack: '/Assets/SVG/Secondary logo black.svg',
} as const;

export type BrandVariant =
  | 'primary'
  | 'primary-white'
  | 'primary-cyan'
  | 'primary-black'
  | 'secondary'
  | 'secondary-white'
  | 'secondary-cyan'
  | 'secondary-black'
  | 'icon-cyan'
  | 'icon-white'
  | 'icon-black';

const VARIANT_SRC: Record<BrandVariant, string> = {
  primary: BRAND.primary,
  'primary-white': BRAND.primaryWhite,
  'primary-cyan': BRAND.primaryCyan,
  'primary-black': BRAND.primaryBlack,
  secondary: BRAND.secondary,
  'secondary-white': BRAND.secondaryWhite,
  'secondary-cyan': BRAND.secondaryCyan,
  'secondary-black': BRAND.secondaryBlack,
  'icon-cyan': BRAND.iconCyan,
  'icon-white': BRAND.iconWhite,
  'icon-black': BRAND.iconBlack,
};

export const getBrandSrc = (variant: BrandVariant): string => VARIANT_SRC[variant];
