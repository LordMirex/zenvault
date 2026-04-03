const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactUsdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUsd = (value: number) => usdFormatter.format(value);

export const formatCompactUsd = (value: number) => compactUsdFormatter.format(value);

export const formatNumber = (value: number, maximumFractionDigits = 2) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value);

export const formatPercent = (value: number) =>
  `${value > 0 ? '+' : ''}${formatNumber(value, 2)}%`;

export const truncateMiddle = (value: string, leading = 8, trailing = 6) => {
  if (value.length <= leading + trailing) {
    return value;
  }

  if (trailing <= 0) {
    return `${value.slice(0, leading)}...`;
  }

  return `${value.slice(0, leading)}...${value.slice(-trailing)}`;
};
