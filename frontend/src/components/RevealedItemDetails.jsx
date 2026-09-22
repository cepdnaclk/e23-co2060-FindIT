import React from 'react';
import { MapPin, Tag, ArrowLeft, Mail, Phone, Sparkles, ImageIcon, Calendar, Clock } from 'lucide-react';
import { Button, Card, Badge } from './ui';

export default function RevealedItemDetails({ item, onBack }) {
  if (!item) return null;

  const metadata = [
    {
      icon: MapPin,
      label: 'Location Found',
      value: item.location,
      accent: 'text-indigo-300',
      bg: 'bg-indigo-500/10',
    },
    {
      icon: Calendar,
      label: 'Date Found',
      value: item.date || 'Not provided',
      accent: 'text-emerald-300',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: Clock,
      label: 'Time Found',
      value: item.time || 'Not provided',
      accent: 'text-sky-300',
      bg: 'bg-sky-500/10',
    },
    {
      icon: Tag,
      label: 'Category',
      value: item.category || 'Other',
      accent: 'text-amber-300',
      bg: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="mx-auto my-6 max-w-6xl px-3 sm:px-4 lg:px-6">
      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/80 shadow-2xl shadow-slate-950/40 backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.24),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.16),_transparent_30%)]" />

        <div className="relative p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="verified" className="px-3.5 py-1.5 text-[11px]">
                Verified Match
              </Badge>
              <Badge variant="found" className="px-3.5 py-1.5 text-[11px]">
                Recovered Item
              </Badge>
            </div>

            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="rounded-full px-3.5 py-2.5 text-slate-300 transition-all duration-200 hover:bg-slate-800 hover:text-white"
            >
              <ArrowLeft size={18} />
              <span>Back to Dashboard</span>
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Card className="group overflow-hidden border-slate-800/80 bg-slate-950/70 p-0 shadow-2xl shadow-slate-950/30">
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                      <ImageIcon size={28} />
                    </div>
                    <span className="text-sm font-semibold uppercase tracking-[0.28em]">No Image Provided</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />
              </div>
            </Card>

            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-300">
                  <Sparkles size={16} />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.3em]">Recovered item</span>
                </div>
                <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{item.title}</h2>
                <p className="text-base leading-7 text-slate-300">{item.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="found" className="px-3.5 py-1.5 text-[11px]">
                  Found Item Match
                </Badge>
                {item.category && (
                  <Badge variant="verified" className="px-3.5 py-1.5 text-[11px]">
                    {item.category}
                  </Badge>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {metadata.map((entry) => {
                  const Icon = entry.icon;
                  return (
                    <Card
                      key={entry.label}
                      className="border-slate-800/80 bg-slate-950/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/40"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`rounded-2xl p-2.5 ${entry.bg}`}>
                          <Icon size={18} className={entry.accent} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                            {entry.label}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-100">{entry.value}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900 p-5 shadow-inner shadow-emerald-950/20 transition-all duration-200 hover:border-emerald-500/40">
                <div className="mb-4 flex items-center gap-2">
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-400">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400/80">
                      Owner contact
                    </p>
                    <h3 className="text-lg font-semibold text-white">Finder's Contact Info</h3>
                  </div>
                </div>

                {item.owner_email && (
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-3">
                    <div className="mt-0.5 rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
                      <Mail size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                        University Email
                      </p>
                      <p className="mt-1 break-all text-sm font-semibold text-slate-100">{item.owner_email}</p>
                    </div>
                  </div>
                )}

                {item.contact_number && (
                  <div className={`mt-3 flex items-start gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-3 ${item.owner_email ? '' : 'mt-0'}`}>
                    <div className="mt-0.5 rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
                      <Phone size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                        Phone Number
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-100">{item.contact_number}</p>
                    </div>
                  </div>
                )}

                {(!item.owner_email && !item.contact_number) && (
                  <div className="rounded-2xl border border-dashed border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-400/80">
                    No contact details provided.
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}