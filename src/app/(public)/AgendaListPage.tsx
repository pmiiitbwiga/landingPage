import * as React from 'react';
import { useSearch } from '@/src/lib/SearchContext';
import { getAgendas } from '@/src/services/agendaService';
import { Agenda } from '@/src/types';
import { AgendaCard } from '@/src/components/cards/AgendaCard';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { Calendar } from 'lucide-react';

export function AgendaListPage() {
  const { searchQuery } = useSearch();
  const [agendas, setAgendas] = React.useState<Agenda[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    getAgendas(searchQuery).then((data) => {
      setAgendas(data);
      setLoading(false);
    });
  }, [searchQuery]);

  return (
    <div className="bg-surface min-h-screen py-10">
      <div className="container mx-auto px-4 lg:px-8">
        <header className="mb-8 border-b border-line pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex items-center gap-3 border-l-4 border-accent pl-4">
            <h1 className="text-2xl font-extrabold text-ink md:text-3xl uppercase tracking-tight">Agenda Kegiatan</h1>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-primary font-bold">
            <Calendar className="h-4 w-4" />
            <span>Kalender Pergerakan 2026</span>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 4].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        ) : agendas.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {agendas.map((agenda) => (
              <AgendaCard key={agenda.id} agenda={agenda} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-line rounded-lg border-dashed">
            <p className="text-muted text-sm italic mb-4">Tidak ada agenda yang ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
