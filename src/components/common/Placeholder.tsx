import { useBranding } from '../../context/BrandingContext';

export interface PlaceholderProps {
  title: string;
}

export const Placeholder = ({ title }: PlaceholderProps) => {
  const { branding } = useBranding();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 bg-dark-800 rounded-3xl flex items-center justify-center border border-gray-800 shadow-xl">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
      <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
      <p className="text-gray-500 text-center max-w-xs">
        This high-performance module is currently being optimized for the {branding.siteName} experience.
      </p>
    </div>
  );
};
