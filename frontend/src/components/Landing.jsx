import { ShieldCheck, Sparkles, Search, ArrowRight } from 'lucide-react';
import { Button, Card, Badge } from './ui';

export default function Landing({ setView }) {
  return (
    <main className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          <Badge variant="verified">Secure platform</Badge>
          <Badge variant="found">Verified users</Badge>
          <Badge variant="pending">AI-assisted matching</Badge>
        </div>

        <div className="mb-8 max-w-4xl">
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Reconnect lost belongings with the{' '}
            <span className="text-indigo-400">University Lost & Found</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-400 sm:text-xl">
            A trusted place for students and staff to report missing items, track updates, and recover what matters most with confidence.
          </p>
        </div>

        <div className="mb-10 flex justify-center">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setView('login')}
            className="min-w-[180px]"
          >
            <ShieldCheck size={18} />
            Login
          </Button>
        </div>

        <div className="grid w-full gap-4 md:grid-cols-3">
          <Card hoverable className="text-left">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300">
              <ShieldCheck size={20} />
            </div>
            <h2 className="text-lg font-semibold text-white">Trusted recovery flow</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Secure verification steps help ensure the right item reaches the right owner.
            </p>
          </Card>

          <Card hoverable className="text-left">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
              <Sparkles size={20} />
            </div>
            <h2 className="text-lg font-semibold text-white">Smart matching support</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              AI-assisted insights help surface the most relevant matches faster.
            </p>
          </Card>

          <Card hoverable className="text-left">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
              <ArrowRight size={20} />
            </div>
            <h2 className="text-lg font-semibold text-white">Simple next step</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Begin with one clear action and move quickly from reporting to recovery.
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}