import { ArrowRight, PlusCircle, SearchCode } from 'lucide-react';
import Badge from './ui/Badge';
import Button from './ui/Button';
import Card from './ui/Card';

export default function Selection({ setReportType, setView, setSelectedImage }) {
  const options = [
    {
      type: 'lost',
      label: 'I LOST SOMETHING',
      subtitle: 'Share what went missing and start the recovery journey with a clear report.',
      badge: 'Lost Report',
      icon: SearchCode,
      iconClass: 'text-rose-500',
      accentClass: 'from-rose-500/20 via-rose-500/5 to-transparent',
      buttonClass: 'hover:border-rose-500/50 hover:bg-slate-800',
    },
    {
      type: 'found',
      label: 'I FOUND SOMETHING',
      subtitle: 'Let others know what you found and help reconnect it to its owner.',
      badge: 'Found Report',
      icon: PlusCircle,
      iconClass: 'text-emerald-500',
      accentClass: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
      buttonClass: 'hover:border-emerald-500/50 hover:bg-slate-800',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 sm:px-8 lg:px-10 animate-in zoom-in duration-300">
      <div className="w-full max-w-5xl">
        <div className="mb-10 text-center">
          <Badge variant="verified" className="mb-4">Choose a report type</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Welcome! What would you like to do?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400 sm:text-lg">
            Start a polished report and guide the item back to the right person with a few simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {options.map((option) => {
            const Icon = option.icon;

            return (
              <Card
                key={option.type}
                hoverable
                className={`group relative overflow-hidden border-slate-800/80 bg-slate-900/80 p-0 ${option.buttonClass}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${option.accentClass}`} />
                <div className="relative flex h-full flex-col p-8 sm:p-10">
                  <div className="mb-6 flex items-center justify-between">
                    <Badge variant={option.type === 'lost' ? 'lost' : 'found'}>{option.badge}</Badge>
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Step 1</span>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 shadow-lg shadow-slate-950/30">
                      <Icon size={36} className={`transition-transform duration-300 group-hover:scale-110 ${option.iconClass}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{option.label}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{option.subtitle}</p>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    className="mt-8 w-full justify-between border border-slate-700/80 bg-slate-800/70 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
                    onClick={() => { setReportType(option.type); setView('report'); setSelectedImage(null); }}
                  >
                    <span className="uppercase tracking-wide">Continue</span>
                    <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}