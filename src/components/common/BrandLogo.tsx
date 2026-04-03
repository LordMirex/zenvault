import { useState, type CSSProperties, type ImgHTMLAttributes } from 'react';
import { useBranding } from '../../context/BrandingContext';
import { cn } from '../../lib/cn';

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 72,
} as const;

type BrandLogoSize = keyof typeof sizeMap;

type BrandLogoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'onError'> & {
  size?: BrandLogoSize;
  variant?: 'icon' | 'full';
  logoUrl?: string;
  altText?: string;
  wrapperClassName?: string;
  textClassName?: string;
  invertFallback?: boolean;
  /**
   * When true the logo image uses height=size and width=auto so it stretches
   * horizontally to its natural aspect ratio instead of being forced square.
   * Ideal for sidebar / header areas where the full logo width should show.
   */
  stretch?: boolean;
};

export const BrandLogo = ({
  size = 'md',
  variant = 'icon',
  logoUrl: overrideUrl,
  altText: overrideAlt,
  wrapperClassName,
  textClassName,
  invertFallback = false,
  stretch = false,
  className,
  ...imgProps
}: BrandLogoProps) => {
  const { branding } = useBranding();
  const resolvedUrl = overrideUrl ?? branding.logoUrl;
  const resolvedAlt = overrideAlt ?? branding.siteName ?? 'Logo';
  const px = sizeMap[size];

  const [imgFailed, setImgFailed] = useState(false);

  const markLetter = (branding.siteName || 'W').trim().charAt(0).toUpperCase();
  const hasValidUrl = resolvedUrl && resolvedUrl.trim().length > 0 && !imgFailed;

  const squareStyle: CSSProperties = {
    width: px,
    height: px,
    minWidth: px,
    minHeight: px,
  };

  const stretchStyle: CSSProperties = {
    height: px,
    width: 'auto',
    maxWidth: '100%',
  };

  const containerStyle = stretch ? stretchStyle : squareStyle;
  const fallbackFontSize = Math.max(12, Math.round(px * 0.44));
  const displayName = branding.siteName || 'Wallet';

  return (
    <div className={cn('flex min-w-0 items-center gap-3', wrapperClassName)}>
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
          style={squareStyle}
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
        <span className={cn('truncate font-bold tracking-tight', textClassName)}>
          {displayName}
        </span>
      )}
    </div>
  );
};
