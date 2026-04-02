import { useState, type CSSProperties, type ImgHTMLAttributes } from 'react';
import { useBranding } from '../../context/BrandingContext';
import { cn } from '../../lib/cn';

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
} as const;

type BrandLogoSize = keyof typeof sizeMap;

type BrandLogoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'onError'> & {
  /** Preset size — controls width & height of the container. Default: 'md' */
  size?: BrandLogoSize;
  /** 'icon' renders just the logo mark; 'full' adds the site name beside it */
  variant?: 'icon' | 'full';
  /** Override the logo URL (defaults to branding.logoUrl) */
  logoUrl?: string;
  /** Override the alt text (defaults to branding.siteName) */
  altText?: string;
  /** Additional class names on the wrapper */
  wrapperClassName?: string;
  /** Text class for the name in 'full' variant */
  textClassName?: string;
  /** Whether to invert colors for dark backgrounds */
  invertFallback?: boolean;
};

/**
 * Unified logo component used across the entire app.
 * - Renders the configured logo image when available
 * - Automatically falls back to a styled letter‑mark when the image is missing or fails to load
 * - Guarantees no broken <img> tags anywhere in the system
 */
export const BrandLogo = ({
  size = 'md',
  variant = 'icon',
  logoUrl: overrideUrl,
  altText: overrideAlt,
  wrapperClassName,
  textClassName,
  invertFallback = false,
  className,
  ...imgProps
}: BrandLogoProps) => {
  const { branding } = useBranding();
  const resolvedUrl = overrideUrl ?? branding.logoUrl;
  const resolvedAlt = overrideAlt ?? branding.siteName ?? 'Logo';
  const px = sizeMap[size];

  const [imgFailed, setImgFailed] = useState(false);

  // Determine the first letter for the fallback mark
  const markLetter =
    (branding.siteName || 'W').trim().charAt(0).toUpperCase();

  const hasValidUrl = resolvedUrl && resolvedUrl.trim().length > 0 && !imgFailed;

  const containerStyle: CSSProperties = {
    width: px,
    height: px,
    minWidth: px,
    minHeight: px,
  };

  const fallbackFontSize = Math.max(12, Math.round(px * 0.44));

  const displayName = branding.siteName || 'Wallet';

  return (
    <div
      className={cn('flex items-center gap-2.5', wrapperClassName)}
    >
      {hasValidUrl ? (
        <img
          {...imgProps}
          src={resolvedUrl}
          alt={resolvedAlt}
          onError={() => setImgFailed(true)}
          style={containerStyle}
          className={cn('object-contain', className)}
        />
      ) : (
        <div
          style={containerStyle}
          className={cn(
            'flex items-center justify-center rounded-xl font-black',
            invertFallback
              ? 'bg-white/20 text-white'
              : 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white',
            className,
          )}
        >
          <span style={{ fontSize: fallbackFontSize, lineHeight: 1 }}>
            {markLetter}
          </span>
        </div>
      )}

      {variant === 'full' && (
        <span
          className={cn(
            'truncate font-bold tracking-tight',
            textClassName,
          )}
        >
          {displayName}
        </span>
      )}
    </div>
  );
};
