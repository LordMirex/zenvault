import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { setImpersonationToken } from '../../lib/api';

export const ImpersonatePage = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setImpersonationToken(token);
      window.location.href = '/app';
    } else {
      window.location.href = '/login';
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
        Opening session…
      </p>
    </div>
  );
};
