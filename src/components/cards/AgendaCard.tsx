import { Agenda } from '@/src/types';
import { formatDate } from '@/src/lib/utils';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Ticket } from 'lucide-react';

interface AgendaCardProps {
  agenda: Agenda;
}

export function AgendaCard({ agenda }: AgendaCardProps) {
  const detailHref = `/agenda/${agenda.slug}`;

  return (
    <article className="group flex gap-3 border-b border-line bg-white p-3 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col items-center justify-center rounded-md bg-surface p-2 text-primary w-[50px] shrink-0 border border-line">
         <span className="text-[16px] font-extrabold leading-none">{new Date(agenda.date).getDate()}</span>
         <span className="text-[10px] font-bold uppercase tracking-wide opacity-70">
           {new Date(agenda.date).toLocaleDateString('id-ID', { month: 'short' })}
         </span>
      </div>
      <div className="flex-1 min-w-0 pr-4">
        <Link to={detailHref}>
          <h3 className="truncate text-[13px] font-bold text-ink group-hover:text-primary transition-colors">
            {agenda.title}
          </h3>
        </Link>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-muted">
          <div className="flex items-center space-x-1.5 min-w-0">
            <MapPin className="h-3 w-3 text-primary shrink-0" />
            <span className="truncate">{agenda.location}</span>
          </div>
          <div className="flex items-center space-x-1.5 shrink-0">
            <Ticket className="h-3 w-3 text-accent" />
            <span>{agenda.quota ? `${agenda.quota} Kuota` : 'Terbuka'}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
