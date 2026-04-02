import { ArrowRight, Landmark, Wallet } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const TransferModePage = () => {
  const location = useLocation();
  const mode = location.pathname.includes('/receive') ? 'receive' : 'send';

  const options = [
    {
      id: 'payid',
      title: mode === 'send' ? 'Use PayID' : 'Receive by PayID',
      description:
        mode === 'send'
          ? 'Transfer between verified QFS users with internal settlement and no external rail.'
          : 'Expose an internal PayID alias so another QFS account can settle instantly.',
      icon: Landmark,
      href: `/app/${mode}/payid`,
    },
    {
      id: 'external',
      title: mode === 'send' ? 'Use Wallet Address' : 'Receive to Wallet Address',
      description:
        mode === 'send'
          ? 'Route the transfer to an external wallet with fee preview and network handling.'
          : 'Show the active wallet address, network rail, and confirmation guidance.',
      icon: Wallet,
      href: `/app/${mode}/external`,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <section className="rounded-[2rem] border border-gray-800 bg-gradient-to-br from-dark-800 via-dark-900 to-dark-900 p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
          {mode === 'send' ? 'Outbound Routing' : 'Inbound Routing'}
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
          {mode === 'send' ? 'Choose how to send funds' : 'Choose how to receive funds'}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">
          The cloned flow splits wallet transfers into PayID and external address paths. Pick the route first, then choose the asset.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {options.map((option) => (
          <Link
            key={option.id}
            to={option.href}
            className="group rounded-[2rem] border border-gray-800 bg-dark-900 p-6 transition-colors hover:border-gray-700 hover:bg-dark-800"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-gray-700 bg-dark-800 text-primary">
              <option.icon className="h-7 w-7" />
            </div>
            <h3 className="mt-6 text-2xl font-black text-white">{option.title}</h3>
            <p className="mt-3 text-sm leading-7 text-gray-400">{option.description}</p>
            <div className="mt-8 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-primary">
              Continue
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
};
