import React from 'react';
import { X, MapPin, Calendar, Clock, Tag, Trash2, Sparkles, ImageIcon } from 'lucide-react';
import { getApiUrl } from '../config';
import { Button, Card, Badge } from './ui';

const LostItemDetails = ({ item, onClose, currentUserEmail }) => {
  if (!item) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      const response = await fetch(`${getApiUrl()}/items/${item.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Report deleted!');
        window.location.reload(); // Quickest way to refresh the dashboard
      } else {
        alert('Failed to delete item.');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const metadata = [
    {
      icon: MapPin,
      label: 'Location Lost',
      value: item.location,
      accent: 'text-indigo-300',
      bg: 'bg-indigo-500/10',
    },
    {
      icon: Calendar,
      label: 'Date Lost',
      value: formatDate(item.date),
      accent: 'text-emerald-300',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: Clock,
      label: 'Time Lost',
      value: formatTime(item.time),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 sm:p-4 lg:p-6 backdrop-blur-xl">
      <div className="relative max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[32px] border border-white/10 bg-slate-900/80 shadow-2xl shadow-slate-950/50 backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.24),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.16),_transparent_30%)]" />

        <div className="relative p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={item.status === 'lost' ? 'lost' : 'found'} className="px-3.5 py-1.5 text-[11px]">
                {item.type ? `${item.type} Item` : 'Item'}
              </Badge>
              {item.category && (
                <Badge variant="verified" className="px-3.5 py-1.5 text-[11px]">
                  {item.category}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {item.owner_email === currentUserEmail && (
                <Button
                  onClick={handleDelete}
                  variant="danger"
                  size="sm"
                  className="rounded-full px-3 py-2.5 sm:px-4"
                  title="Delete Report"
                >
                  <Trash2 size={18} />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              )}

              <Button onClick={onClose} variant="ghost" size="sm" className="rounded-full p-2.5">
                <X size={18} />
              </Button>
            </div>
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
                <div className="flex items-center gap-2 text-indigo-300">
                  <Sparkles size={16} />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.3em]">Reported item</span>
                </div>
                <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{item.title}</h2>
                <p className="text-base leading-7 text-slate-300">{item.description}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {metadata.map((entry, index) => {
                  const Icon = entry.icon;
                  return (
                    <Card key={`${entry.label}-${index}`} className="border-slate-800/80 bg-slate-950/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/40">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-2xl p-2.5 ${entry.bg}`}>
                          <Icon size={18} className={entry.accent} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">{entry.label}</p>
                          <p className="mt-1 text-sm font-semibold text-slate-100">{entry.value}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <Card className="border-slate-800/80 bg-slate-950/60 p-5 transition-all duration-200 hover:border-indigo-500/40">
                <div className="mb-3 flex items-center gap-2">
                  <Tag size={16} className="text-amber-400" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Description</span>
                </div>
                <p className="text-sm leading-7 text-slate-300">{item.description}</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LostItemDetails;