import * as React from 'react';
import { AgendaCard } from '@/src/components/cards/AgendaCard';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { Button } from '@/src/components/ui/Button';
import { getAgendas } from '@/src/services/agendaService';
import { Agenda } from '@/src/types';
import { useSearch } from '@/src/lib/SearchContext';

export function LatestAgendas() {
  const [agendas, setAgendas] = React.useState<Agenda[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { searchQuery } = useSearch();

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    
    getAgendas(searchQuery).then((data) => {
      if (active) {
        setAgendas(data);
        setLoading(false);
      }
    }).catch(err => {
      console.error('LatestAgendas fetch error:', err);
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [searchQuery]);

  return (
    <section>
      <div className="mb-3">
        <h2 className="text-[14px] font-bold text-muted uppercase tracking-wider flex items-center gap-2">
          <span className="w-1 h-4 bg-accent" />
          Agenda Mendatang
        </h2>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-white">
        {loading ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {agendas.map((agenda) => (
              <AgendaCard key={agenda.id} agenda={agenda} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
