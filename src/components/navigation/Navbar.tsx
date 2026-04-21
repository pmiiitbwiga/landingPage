import * as React from 'react';
import { Menu, X, Search, ChevronRight, User } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { cn, getInitials } from '@/src/lib/utils';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Beranda', href: '/' },
  { label: 'Tentang', href: '/tentang' },
  { label: 'Berita', href: '/berita' },
  { label: 'Artikel', href: '/artikel' },
  { label: 'Opini', href: '/opini' },
  { label: 'Agenda', href: '/agenda' },
];

import { useSearch } from '@/src/lib/SearchContext';
import { useAuth } from '@/src/lib/AuthContext';

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const { pathname } = useLocation();
  const { searchQuery, setSearchQuery } = useSearch();
  const { user, logout } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/login';
    const userRole = (user.role || (user as any).Role || (user as any).ROLE || '').toString().trim().toUpperCase();
    return userRole.includes('ADMIN') || userRole.includes('PENGURUS') ? '/admin' : '/member';
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b-3 border-accent bg-primary text-white">
      <div className="mx-auto px-6 h-[60px]">
        <div className="flex h-full items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
             <img src="/logo.svg" alt="Logo PMII" className="h-9 w-9 object-contain" />
            <span className="hidden text-lg font-extrabold tracking-tight md:block">
              PK PMII ITB WIGA
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center space-x-6 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'text-[13px] font-medium transition-colors hover:text-accent pb-1',
                  pathname === item.href ? 'border-b-2 border-accent' : 'opacity-90'
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center ml-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari..."
                  className="w-[180px] rounded-md bg-white/10 border border-white/20 py-1.5 pl-9 pr-4 text-[13px] focus:outline-none focus:bg-white/20 transition-all placeholder:text-white/40 focus:w-[220px]"
                />
              </div>
              
              {user ? (
                <div className="group relative">
                  <Link to={getDashboardPath()} className="block">
                    {user.photoUrl ? (
                      <div className="h-9 w-9 rounded-full border-2 border-accent/50 overflow-hidden transition-all group-hover:border-accent">
                        <img src={user.photoUrl} alt={user.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ) : (
                      <div className="h-9 w-9 rounded-full border-2 border-accent/50 bg-primary flex items-center justify-center overflow-hidden transition-all group-hover:border-accent">
                        <span className="text-accent font-black text-[12px]">{getInitials(user.name)}</span>
                      </div>
                    )}
                  </Link>
                  {/* Tooltip / Menu on hover */}
                  <div className="absolute top-full right-0 mt-2 hidden group-hover:block bg-white text-ink text-[12px] rounded-lg shadow-xl border border-line overflow-hidden w-48 z-50">
                     <div className="px-4 py-3 border-b border-line bg-surface/30 text-left">
                        <p className="font-bold truncate text-primary">{user.name}</p>
                        <p className="text-[10px] text-muted uppercase tracking-wider">{user.role}</p>
                     </div>
                     <Link to={getDashboardPath()} className="flex items-center gap-2 px-4 py-2 hover:bg-surface transition-colors text-ink">
                        <ChevronRight className="h-3.5 w-3.5" /> Dashboard
                     </Link>
                     <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 transition-colors text-left border-t border-line font-bold">
                        Keluar
                     </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="group relative">
                  <div className="h-9 w-9 rounded-full border-2 border-accent/50 bg-accent/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-accent">
                     <User className="h-5 w-5 text-accent" />
                  </div>
                  {/* Tooltip on hover */}
                  <div className="absolute top-full right-0 mt-2 hidden group-hover:block bg-white text-primary text-[10px] font-bold px-3 py-1.5 rounded shadow-lg border border-line whitespace-nowrap z-50">
                     MASUK / DAFTAR
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center space-x-4 lg:hidden">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-white/80 hover:text-white transition-colors"
            >
              <Search className="h-6 w-6" />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-white/80 hover:text-white transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t bg-white lg:hidden">
          <div className="container mx-auto space-y-1.5 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center justify-between rounded-lg px-4 py-3 font-medium transition-colors',
                  pathname === item.href ? 'bg-primary/5 text-primary' : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                {item.label}
                <ChevronRight className="h-4 w-4 opacity-50" />
              </Link>
            ))}
            <div className="pt-4 space-y-2 border-t border-line">
              <Link to={getDashboardPath()} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-surface rounded-lg">
                <div className="h-10 w-10 rounded-full border border-line bg-primary flex items-center justify-center overflow-hidden">
                   {user?.photoUrl ? (
                     <img src={user.photoUrl} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                   ) : (
                     <span className="text-accent font-black text-[14px]">
                       {user ? getInitials(user.name) : <User className="h-5 w-5 text-accent" />}
                     </span>
                   )}
                </div>
                <div className="text-left flex-1">
                  <p className="text-[13px] font-bold text-ink leading-tight">{user ? user.name : 'Portal Kader'}</p>
                  <p className="text-[10px] text-muted">{user ? `Role: ${user.role}` : 'Masuk atau Daftar Akun'}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted" />
              </Link>
              
              {user && (
                <button 
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-[12px] font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Keluar dari Akun
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="absolute inset-x-0 top-16 border-b bg-white p-4 shadow-lg lg:hidden animate-in slide-in-from-top duration-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berita atau agenda..."
              className="w-full rounded-lg bg-gray-100 py-3 pl-11 pr-4 text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      )}
    </nav>
  );
}
