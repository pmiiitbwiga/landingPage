import * as React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAgendaBySlug, registerAgenda, uploadFile } from '@/src/services/agendaService';
import { Agenda } from '@/src/types';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { formatDate } from '@/src/lib/utils';
import { Calendar, MapPin, User, ArrowLeft, Ticket, Clock, Info, CheckCircle, AlertTriangle, Phone, Share2, Copy, FileText } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { useAuth } from '@/src/lib/AuthContext';

export function AgendaDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [agenda, setAgenda] = React.useState<Agenda | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [showRegForm, setShowRegForm] = React.useState(false);
  const [formData, setFormData] = React.useState<Record<string, string>>({
    name: user?.name || '',
    nim: user?.nim || '',
    email: user?.email || '',
    jenisKelamin: (user as any)?.jenisKelamin || '',
    tempatLahir: (user as any)?.tempatLahir || '',
    tanggalLahir: (user as any)?.tanggalLahir || '',
    Alamat: (user as any)?.Alamat || '',
    whatsapp: user?.whatsapp || '',
    komisariat: user?.komisariat || ''
  });

  // Re-sync if user loads later
  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name,
        nim: prev.nim || user.nim,
        email: prev.email || user.email,
        jenisKelamin: prev.jenisKelamin || (user as any).jenisKelamin,
        tempatLahir: prev.tempatLahir || (user as any).tempatLahir,
        tanggalLahir: prev.tanggalLahir || (user as any).tanggalLahir,
        Alamat: prev.Alamat || (user as any).Alamat,
        whatsapp: prev.whatsapp || user.whatsapp,
        komisariat: prev.komisariat || user.komisariat
      }));
    }
  }, [user]);
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const customFields = React.useMemo(() => {
    if (!agenda || !agenda.customFields) return [];
    try {
      return typeof agenda.customFields === 'string' ? JSON.parse(agenda.customFields) : agenda.customFields;
    } catch (e) {
      console.error('Error parsing custom fields:', e);
      return [];
    }
  }, [agenda]);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('openForm') === 'true' && user) {
      setShowRegForm(true);
      // Clean up the URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [user]);

  React.useEffect(() => {
    if (slug) {
      getAgendaBySlug(slug).then((data) => {
        setAgenda(data || null);
        setLoading(false);
      });
    }
  }, [slug]);

  if (loading) {
    return (
        <div className="container mx-auto px-4 py-24 lg:px-8">
            <Skeleton className="h-10 w-2/3 mb-8" />
            <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
    );
  }

  if (!agenda) {
    return (
      <div className="container mx-auto px-4 py-32 text-center lg:px-8">
        <h2 className="text-3xl font-bold mb-4">Agenda Tidak Ditemukan</h2>
        <Link to="/" className="text-primary hover:underline">Kembali ke Beranda</Link>
      </div>
    );
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: `/agenda/${slug}` } });
      return;
    }

    setSubmitting(true);
    try {
      // Handle file uploads in dynamic fields
      const finalFormData = { ...formData };
      const fileFields = customFields.filter((f: any) => f.type === 'file');

      for (const field of fileFields) {
        const fileData = formData[field.id];
        if (fileData && fileData.startsWith('data:')) {
          setSubmitting(true);
          const uploadRes = await uploadFile({
            base64: fileData,
            fileName: `REG_DOC_${user.uid}_${field.id}`.substring(0, 50),
          });
          if (uploadRes.success) {
            finalFormData[field.id] = uploadRes.url;
          }
        }
      }

      const result = await registerAgenda({
        memberId: user.uid,
        agendaId: agenda.id,
        formData: finalFormData
      });

      if (result.success) {
        setSuccess(true);
      } else {
        alert(result.message || 'Terjadi kesalahan saat mendaftar.');
      }
    } catch (err) {
      alert('Gagal mengirim pendaftaran. Periksa koneksi internet Sahabat.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const formatWhatsApp = (phone: any) => {
    const phoneStr = String(phone || '');
    let cleaned = phoneStr.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }
    return `https://wa.me/${cleaned}`;
  };

  const dateObj = agenda.date ? new Date(agenda.date) : new Date();
  const isValidDate = agenda.date ? !isNaN(dateObj.getTime()) : false;

  const shareText = `*${agenda.title}*

📅 Tanggal: ${isValidDate ? formatDate(agenda.date) : 'Segera'} ${agenda.endDate ? `s/d ${formatDate(agenda.endDate)}` : ''}
⏰ Jam: ${agenda.time || '--:--'} WIB
📍 Lokasi: ${agenda.location}

Yuk ikuti kegiatannya! Info lebih lanjut & pendaftaran klik link berikut:
${window.location.href}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: agenda.title,
        text: shareText,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${shareText}`);
      alert('Teks dan tautan berhasil disalin ke papan klip!');
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[35vh] min-h-[350px] bg-primary overflow-hidden">
        <div className="absolute inset-0 h-full w-full bg-primary object-cover opacity-20 mix-blend-overlay" />
        <div className="container relative z-10 mx-auto px-4 h-full flex flex-col justify-center lg:px-8">
            <div className="max-w-4xl space-y-8">
                <Link to="/agenda" className="inline-flex items-center gap-2 text-white/70 hover:text-accent transition-colors text-[11px] font-bold uppercase tracking-widest mb-2">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Kembali ke Daftar Agenda
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-12">
                   <div className="flex-1 order-2 md:order-1 space-y-5">
                       <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight uppercase tracking-tight drop-shadow-md">
                           {agenda.title}
                       </h1>
                       <div className="flex flex-wrap gap-5 text-white/90">
                           <div className="flex items-center gap-2 text-[14px] font-bold">
                               <Calendar className="h-5 w-5 text-accent" />
                               <span>
                                 {isValidDate ? formatDate(agenda.date) : 'Tanggal segera diumumkan'} 
                                 {agenda.endDate && ` s/d ${formatDate(agenda.endDate)}`}
                               </span>
                           </div>
                           <div className="flex items-center gap-2 text-[14px] font-bold">
                               <MapPin className="h-5 w-5 text-accent" />
                               <span>{agenda.location || 'Lokasi segera diumumkan'}</span>
                           </div>
                       </div>
                   </div>
                   {agenda.logoUrl && agenda.logoUrl !== '-' && (
                     <div className="shrink-0 order-1 md:order-2 flex justify-start md:justify-end">
                       <img src={agenda.logoUrl} alt="Logo Kegiatan" className="h-32 md:h-48 w-auto object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.5)]" referrerPolicy="no-referrer" />
                     </div>
                   )}
                </div>
            </div>
        </div>
      </section>

      {/* Info Card Bar */}
      <div className="container relative z-20 mx-auto px-4 lg:px-8 -mt-12">
         <div className="max-w-5xl mx-auto rounded-xl bg-white shadow-xl border border-line p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-surface">
               <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                  <Clock className="h-5 w-5" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Waktu Pelaksanaan</p>
                  <p className="text-[14px] font-bold text-ink">
                    {agenda.time ? agenda.time : (isValidDate ? dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--')} WIB
                  </p>
               </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-surface">
               <div className="h-10 w-10 rounded bg-accent/20 flex items-center justify-center text-primary">
                  <Ticket className="h-5 w-5" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Kuota Tersedia</p>
                  <p className="text-[14px] font-bold text-ink">{agenda.quota ? `${agenda.quota} Peserta` : 'Terbuka Umum'}</p>
               </div>
            </div>
            <div className="flex items-center">
                <Button 
                 onClick={handleShare}
                 className="w-full h-full py-3 rounded-lg text-[14px] font-extrabold uppercase tracking-wider shadow-md hover:-translate-y-0.5 transition-transform" 
                 variant="primary"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Bagikan Agenda
               </Button>
            </div>
         </div>
      </div>

      <div className="container mx-auto px-4 py-16 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content (Left) */}
            <div className="lg:col-span-8 space-y-10">
                <div className="space-y-6">
                    <div className="flex items-center gap-2 border-l-4 border-accent pl-3">
                        <h3 className="text-[16px] font-extrabold text-ink uppercase tracking-wider">
                            Detail & Deskripsi Kegiatan
                        </h3>
                    </div>
                    
                    <div className="bg-white rounded-xl p-8 text-[14px] text-ink leading-relaxed border-2 border-accent/20 shadow-sm whitespace-pre-wrap font-medium">
                        {agenda.content || 'Detail kegiatan akan segera diperbarui oleh panitia.'}
                    </div>

                    <div className="space-y-8 pt-4">
                        <section className="bg-surface rounded-2xl p-8 border border-line shadow-inner">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                               {String(agenda.requirements || '').split(',').filter(Boolean).length > 0 && (
                                  <div>
                                    <div className="flex items-center gap-2 mb-4">
                                      <div className="h-6 w-1 bg-accent rounded-full"></div>
                                      <h4 className="font-black text-[13px] text-primary uppercase tracking-widest">Persyaratan Peserta</h4>
                                    </div>
                                    <ul className="space-y-3 list-none p-0">
                                {String(agenda.requirements || '').split(',').map((r, i) => r.trim()).filter(Boolean).map((r, i) => (
                                          <li key={i} className="flex items-start gap-3 text-[13px] font-bold text-muted group">
                                            <div className="h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-accent group-hover:text-white transition-colors">
                                              <span className="text-[10px]">✓</span>
                                            </div>
                                            <span className="leading-tight">{r}</span>
                                          </li>
                                        ))}
                                    </ul>
                                  </div>
                               )}
                              
                              {String(agenda.facilities || '').split(',').filter(Boolean).length > 0 && (
                                 <div>
                                  <div className="flex items-center gap-2 mb-4">
                                      <div className="h-6 w-1 bg-primary rounded-full"></div>
                                      <h4 className="font-black text-[13px] text-primary uppercase tracking-widest">Fasilitas Sahabat</h4>
                                    </div>
                                  <ul className="grid grid-cols-1 gap-3 list-none p-0">
                                      {String(agenda.facilities || '').split(',').map((f, i) => f.trim()).filter(Boolean).map((f, i) => (
                                        <li key={i} className="flex items-center gap-3 text-[13px] font-bold text-muted group">
                                          <div className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                            <Ticket className="h-3.5 w-3.5" />
                                          </div>
                                          <span>{f}</span>
                                        </li>
                                      ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                        </section>

                        {agenda.contactPerson && (
                          <div className="mt-12 pt-8 border-t border-line/50">
                            <h4 className="font-bold text-[14px] text-ink mb-6 uppercase tracking-wider flex items-center gap-2">
                              <Phone className="h-4 w-4 text-accent" />
                              Hubungi Panitia (Contact Person):
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {String(agenda.contactPerson || '').split(',').map((cp, i) => {
                                const parts = String(cp || '').trim().split(':');
                                const name = parts[0]?.trim();
                                const phone = parts[1]?.trim() || name;
                                return (
                                  <a 
                                    key={i} 
                                    href={formatWhatsApp(phone)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 rounded-xl border border-line bg-white hover:border-accent hover:shadow-md transition-all group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                                        <Phone className="h-5 w-5" />
                                      </div>
                                      <div>
                                        <p className="text-[12px] font-bold text-ink">{name}</p>
                                        <p className="text-[10px] font-medium text-muted">{phone}</p>
                                      </div>
                                    </div>
                                    <div className="h-8 w-8 rounded-lg bg-surface flex items-center justify-center text-muted group-hover:text-green-600">
                                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </div>
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}
                    </div>

                    <div className="rounded-xl border border-line bg-white p-6 space-y-6">
                        <h4 className="text-[14px] font-bold text-ink uppercase tracking-wider border-b border-line pb-3">Lokasi & Navigasi</h4>
                        <div className="aspect-video bg-surface rounded-lg border border-line flex flex-col items-center justify-center text-muted gap-2 text-center p-4">
                            <MapPin className="h-6 w-6 opacity-30" />
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{agenda.location || 'Lokasi Menunggu Konfirmasi'}</span>
                        </div>
                        <div className="space-y-3">
                            <p className="text-[12px] text-muted leading-relaxed">
                                <strong className="text-ink">Alamat:</strong> {agenda.location || 'Segera Diumumkan'}
                            </p>
                            <Button variant="outline" size="sm" className="w-full text-[11px] font-bold">BUKA DI GOOGLE MAPS</Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar / Registration Form (Right) */}
            <aside className="lg:col-span-4 space-y-6">
                {showRegForm ? (
                  <div id="registration-form" className="bg-white rounded-2xl border-2 border-primary/20 p-6 shadow-2xl animate-in slide-in-from-right duration-500 sticky top-24">
                    {success ? (
                      <div className="text-center py-8 space-y-4">
                        <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                          <CheckCircle className="h-10 w-10" />
                        </div>
                        <h3 className="text-xl font-black text-primary uppercase">Pendaftaran Berhasil!</h3>
                        <p className="text-xs text-muted font-bold leading-relaxed">
                          Terima kasih Sahabat <strong>{user?.name}</strong>. Cek status pendaftaranmu di Dashboard Anggota.
                        </p>
                        <Link to="/profile">
                          <Button variant="outline" className="w-full font-bold text-[11px]">KE DASHBOARD ANGGOTA</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                           <h3 className="text-[14px] font-black text-primary uppercase">Formulir Pendaftaran</h3>
                           <button onClick={() => setShowRegForm(false)} className="text-muted hover:text-red-500 font-bold text-[10px] uppercase underline">Tutup</button>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-5">
                           {/* Data Diri (Mandatory) */}
                           <div className="space-y-4 p-5 bg-surface border-2 border-line rounded-2xl">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="h-5 w-5 rounded-lg bg-primary text-white flex items-center justify-center">
                                  <User className="h-3 w-3" />
                                </div>
                                <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Informasi Pendaftar</h4>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black text-muted uppercase ml-1">Nama Lengkap</label>
                                  <input required type="text" className="w-full bg-white border border-line rounded-xl px-3 py-2 text-sm font-bold text-ink" 
                                    value={formData.name} onChange={e => handleInputChange('name', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-black text-muted uppercase ml-1">NIM Sahabat</label>
                                    <input required type="text" className="w-full bg-white border border-line rounded-xl px-3 py-2 text-sm font-bold text-ink" 
                                      value={formData.nim} onChange={e => handleInputChange('nim', e.target.value)} />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-black text-muted uppercase ml-1">Jenis Kelamin</label>
                                    <select required className="w-full bg-white border border-line rounded-xl px-3 py-2 text-sm font-bold text-ink outline-none" 
                                      value={formData.jenisKelamin} onChange={e => handleInputChange('jenisKelamin', e.target.value)}>
                                      <option value="">Pilih</option>
                                      <option value="Laki-laki">Laki-laki</option>
                                      <option value="Perempuan">Perempuan</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-black text-muted uppercase ml-1">Tpt Lahir</label>
                                    <input required type="text" className="w-full bg-white border border-line rounded-xl px-3 py-2 text-sm font-bold text-ink" 
                                      value={formData.tempatLahir} onChange={e => handleInputChange('tempatLahir', e.target.value)} />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-black text-muted uppercase ml-1">Tgl Lahir</label>
                                    <input required type="date" className="w-full bg-white border border-line rounded-xl px-3 py-2 text-sm font-bold text-ink" 
                                      value={formData.tanggalLahir} onChange={e => handleInputChange('tanggalLahir', e.target.value)} />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black text-muted uppercase ml-1">Alamat Lengkap</label>
                                  <textarea required rows={2} className="w-full bg-white border border-line rounded-xl px-3 py-2 text-sm font-bold text-ink resize-none" 
                                    value={formData.Alamat} onChange={e => handleInputChange('Alamat', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-black text-muted uppercase ml-1">No. WhatsApp</label>
                                    <input required type="text" className="w-full bg-white border border-line rounded-xl px-3 py-2 text-sm font-bold text-ink" 
                                      value={formData.whatsapp} onChange={e => handleInputChange('whatsapp', e.target.value)} />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-black text-muted uppercase ml-1">Komisariat</label>
                                    <input required type="text" className="w-full bg-white border border-line rounded-xl px-3 py-2 text-sm font-bold text-ink" 
                                      value={formData.komisariat} onChange={e => handleInputChange('komisariat', e.target.value)} />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black text-muted uppercase ml-1">Email Google</label>
                                  <input required type="email" disabled className="w-full bg-surface border border-line rounded-xl px-3 py-2 text-sm font-extrabold text-muted cursor-not-allowed" 
                                    value={formData.email} />
                                </div>
                              </div>
                           </div>

                           {/* Custom Fields */}
                           {customFields.length > 0 && (
                             <div className="space-y-4">
                               <p className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                 <Info className="h-3 w-3" />
                                 Informasi Tambahan
                               </p>
                               {customFields.map((field: any) => {
                                 const fType = (field.type || 'text').toLowerCase();
                                 const isReq = field.isRequired !== false && field.isRequired !== 'false';
                                 return (
                                   <div key={field.id} className="space-y-1.5">
                                     <label className="text-[11px] font-black text-ink uppercase tracking-tight flex items-center gap-1">
                                       {field.label}
                                       {isReq && <span className="text-red-500">*</span>}
                                       {!isReq && <span className="text-muted text-[9px] lowercase font-normal">(opsional)</span>}
                                     </label>
                                     
                                     {fType === 'select' ? (
                                       <select 
                                         required={isReq}
                                         className="w-full rounded-lg border border-line p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white font-bold text-ink"
                                         onChange={(e) => handleInputChange(field.id, e.target.value)}
                                         value={formData[field.id] || ''}
                                       >
                                         <option value="">-- Pilih {field.label || 'Opsi'} --</option>
                                         {(() => {
                                           const opts = typeof field.options === 'string' 
                                             ? String(field.options || '').split(',') 
                                             : (Array.isArray(field.options) ? field.options : []);
                                           return opts.map((opt: any, idx: number) => {
                                             const val = String(opt).trim();
                                             return val ? <option key={`${field.id}-opt-${idx}`} value={val}>{val}</option> : null;
                                           });
                                         })()}
                                       </select>
                                     ) : fType === 'file' ? (
                                       <div className="space-y-2 p-4 border-2 border-dashed border-line rounded-xl bg-surface/30 hover:bg-surface/50 transition-colors">
                                         <div className="flex items-center gap-3 mb-2">
                                           <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                             <FileText className="h-4 w-4" />
                                           </div>
                                           <span className="text-[11px] font-black uppercase text-primary">Upload Berkas</span>
                                         </div>
                                         <input 
                                           required={isReq}
                                           type="file"
                                           className="block w-full text-xs text-muted
                                             file:mr-4 file:py-2 file:px-6
                                             file:rounded-lg file:border-0
                                             file:text-[11px] file:font-black
                                             file:bg-primary file:text-white
                                             hover:file:bg-primary/90 cursor-pointer"
                                           onChange={(e) => {
                                             const file = e.target.files?.[0];
                                             if (file) {
                                               const reader = new FileReader();
                                               reader.onloadend = () => handleInputChange(field.id, reader.result as string);
                                               reader.readAsDataURL(file);
                                             }
                                           }}
                                         />
                                         {formData[field.id] && (
                                           <div className="flex items-center gap-2 pt-2 text-green-600 font-black italic">
                                              <CheckCircle className="h-4 w-4" />
                                              <span className="text-[10px] uppercase">Berkas siap diunggah</span>
                                           </div>
                                         )}
                                       </div>
                                     ) : (
                                       <input 
                                         required={isReq}
                                         type={fType === 'number' ? 'number' : fType === 'date' ? 'date' : 'text'} 
                                         placeholder={`Masukkan ${field.label}...`}
                                         className="w-full rounded-lg border border-line p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white font-bold text-ink"
                                         value={formData[field.id] || ''}
                                         onChange={(e) => handleInputChange(field.id, e.target.value)}
                                       />
                                     )}
                                   </div>
                                 );
                               })}
                             </div>
                           )}

                           <div className="pt-2">
                              <Button 
                                type="submit" 
                                className="w-full py-3 text-[12px] font-black uppercase tracking-widest shadow-lg shadow-primary/10"
                                disabled={submitting}
                              >
                                {submitting ? 'MEMPROSES...' : 'KIRIM PENDAFTARAN'}
                              </Button>
                           </div>
                        </form>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6 sticky top-24">
                     <div className="rounded-xl bg-white border border-line p-6 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between border-b border-line pb-3">
                           <span className="text-[11px] font-bold text-muted uppercase tracking-widest">Status</span>
                           <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">PENDAFTARAN DIBUKA</Badge>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-bold text-muted uppercase">Batas Waktu</p>
                           <p className="text-[14px] font-black text-ink">{isValidDate ? formatDate(agenda.date) : 'Segera Diumumkan'}</p>
                        </div>
                        <Button 
                          onClick={() => {
                            if (!user) {
                              navigate('/login', { state: { from: `/agenda/${slug}?openForm=true` } });
                            } else {
                              setShowRegForm(true);
                              setTimeout(() => {
                                document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' });
                              }, 100);
                            }
                          }}
                          className="w-full py-6 text-[14px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                        >
                          DAFTAR SEKARANG
                        </Button>
                        <p className="text-[10px] text-center text-muted italic font-medium">
                          * Klik tombol di atas untuk mengisi formulir pendaftaran digital.
                        </p>
                     </div>

                     <div className="rounded-2xl bg-gradient-to-br from-accent to-accent/80 p-6 border border-accent shadow-lg shadow-accent/20">
                        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-primary mb-4">
                           <Phone className="h-5 w-5" />
                        </div>
                        <h4 className="text-[15px] font-black text-primary uppercase tracking-tight mb-2">Butuh Bantuan?</h4>
                        <p className="text-[11px] text-primary/70 mb-5 font-bold leading-relaxed uppercase tracking-wide">
                          Hubungi Panitia Pelaksana jika Sahabat memiliki kendala teknis terkait pendaftaran.
                        </p>
                        {(() => {
                          const firstContact = String(agenda.contactPerson || '').split(',')[0];
                          const hp = (String(firstContact || '').split(':')[1] || firstContact || '08123456789').trim();
                          return (
                            <a 
                              href={formatWhatsApp(hp)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full bg-primary text-white text-[11px] font-black uppercase tracking-widest py-3.5 rounded-xl shadow-xl shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                            >
                                <Phone className="h-4 w-4" />
                                HUBUNGI WHATSAPP
                            </a>
                          )
                        })()}
                    </div>
                  </div>
                )}
            </aside>
        </div>
      </div>
    </div>
  );
}
