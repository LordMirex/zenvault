export const makeQrCodeUrl = (value: string, size = 280) => {
  if (!value) {
    return undefined;
  }

  const encoded = encodeURIComponent(value);
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&format=png&margin=1`;
  return url;
};
