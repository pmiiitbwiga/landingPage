import * as React from 'react';
import { 
  LayoutDashboard, User as UserIcon, FileText, Download, 
  LogOut, ChevronRight, CheckCircle, Clock, Camera, 
  Upload as UploadIcon, AlertCircle, Calendar, X, Edit2
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { cn, getInitials } from '@/src/lib/utils';
import { Member, Participation, Post } from '@/src/types';
import { useAuth } from '@/src/lib/AuthContext';
import { TiptapEditor } from '@/src/components/editor/TiptapEditor';
import { createPost } from '@/src/services/postService';
import { getParticipations } from '@/src/services/agendaService';
import { updateMember } from '@/src/services/memberService';
import { toast } from 'sonner';

export function MemberDashboard() {
  const { user, logout, login } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'overview' | 'profile' | 'content' | 'certificates'>('overview');
  const [loading, setLoading] = React.useState(false);
  const [participations, setParticipations] = React.useState<any[]>([]);
  
  // Post states
  const [postTitle, setPostTitle] = React.useState('');
  const [postCategory, setPostCategory] = React.useState('Artikel');
  const [postContent, setPostContent] = React.useState('');
  const [postImage, setPostImage] = React.useState<File | null>(null);
  const [postError, setPostError] = React.useState<string | null>(null);

  // Profile forms
  const [profileForm, setProfileForm] = React.useState({
    name: user?.name || '',
    whatsapp: user?.whatsapp || '',
    komisariat: user?.komisariat || ''
  });

  React.useEffect(() => {
    if (user) {
      loadMyData();
    }
  }, [user]);

  const loadMyData = async () => {
    setLoading(true);
    try {
      const data = await getParticipations();
      const myData = data.filter(p => String(p.memberId) === String(user?.uid));
      setParticipations(myData);
    } catch (err) {
      console.error('Load Participations error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmitPost = async () => {
    if (!postTitle || !postContent) {
      setPostError('Judul dan Isi konten wajib diisi.');
      return;
    }
    setLoading(true);
    setPostError(null);
    try {
      let imageBase64 = '';
      if (postImage) imageBase64 = await fileToBase64(postImage);
      
      const plainText = postContent.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
      const excerpt = plainText.length > 150 ? plainText.substring(0, 150).trim() + '...' : plainText;

      const result = await createPost({
        title: postTitle,
        category: postCategory as any,
        content: postContent,
        excerpt,
        imageBase64,
        author: user.name,
        authorId: user.uid,
      });

      if (result.success) {
        toast.success('BERHASIL! Konten Sahabat telah diajukan.');
        setPostTitle('');
        setPostContent('');
        setPostImage(null);
        setActiveTab('overview');
      } else {
        throw new Error(result.message || 'Gagal mengirim konten.');
      }
    } catch (err: any) {
      setPostError(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const res = await updateMember(user.uid, profileForm);
      if (res.success) {
        login({ ...user, ...profileForm });
        toast.success('Profil Sahabat Berhasil Diperbarui!');
      } else {
        toast.error('Gagal: ' + res.message);
      }
    } catch (err) {
      toast.error('Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen py-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Nav */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-line rounded-2xl p-8 text-center shadow-sm">
              <div className="relative inline-block mb-4">
                {user.photoUrl ? (
                  <img src={user.photoUrl} className="w-24 h-24 rounded-2xl border-4 border-surface shadow-xl object-cover" alt="Profile" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl border-4 border-surface bg-primary flex items-center justify-center shadow-xl">
                    <span className="text-accent font-black text-3xl">{getInitials(user.name)}</span>
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-accent text-primary p-1.5 rounded-lg shadow-lg border-2 border-white">
                  <CheckCircle className="h-4 w-4" />
                </div>
              </div>
              <h3 className="font-black text-ink text-lg leading-tight">{user.name}</h3>
              <p className="text-[10px] text-muted font-black uppercase tracking-[0.2em] mt-2 block bg-surface py-1 rounded-full">{user.statusKaderisasi}</p>
            </div>

            <nav className="bg-white border border-line rounded-2xl overflow-hidden p-2 space-y-1 shadow-sm">
              {[
                { id: 'overview', label: 'DASHBOARD SAYA', icon: LayoutDashboard },
                { id: 'profile', label: 'PROFIL & AKUN', icon: UserIcon },
                { id: 'content', label: 'TULIS KONTEN', icon: FileText },
                { id: 'certificates', label: 'SERTIFIKAT', icon: Download },
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3.5 text-[11px] font-black rounded-xl transition-all uppercase tracking-wider",
                    activeTab === item.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted hover:bg-surface"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" /> {item.label}
                  </div>
                  <ChevronRight className={cn("h-3 w-3 opacity-30", activeTab === item.id && "opacity-100")} />
                </button>
              ))}
              <div className="h-px bg-line my-2 mx-4"></div>
              <button 
                onClick={logout} 
                className="w-full flex items-center gap-3 px-4 py-3.5 text-[11px] font-black text-red-500 rounded-xl hover:bg-red-50 transition-colors uppercase tracking-wider"
              >
                <LogOut className="h-4 w-4" /> KELUAR SISTEM
              </button>
            </nav>
            
            <div className="p-6 bg-primary rounded-2xl text-white relative overflow-hidden shadow-xl">
               <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-32 w-32 bg-accent opacity-10 rounded-full blur-3xl"></div>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">QUOTES PERGERAKAN</p>
               <p className="text-[13px] font-medium leading-relaxed italic">"Tangan Terkepal dan Maju Ke Muka!"</p>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9 space-y-8">
            
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white border border-line p-6 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-4">Agenda Diikuti</p>
                    <div className="flex items-end justify-between">
                       <h2 className="text-4xl font-black text-primary">{participations.length.toString().padStart(2, '0')}</h2>
                       <div className="h-10 w-10 bg-primary/5 rounded-xl flex items-center justify-center">
                          <AlertCircle className="h-5 w-5 text-primary" />
                       </div>
                    </div>
                  </div>
                  <div className="bg-white border border-line p-6 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-4">Status Akun</p>
                    <div className="flex items-end justify-between">
                       <Badge variant="accent" className="text-[10px] px-4 py-1">AKTIF & TERVERIFIKASI</Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-line rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-6 py-5 border-b border-line flex items-center justify-between bg-surface/30">
                    <h3 className="text-[14px] font-black uppercase tracking-widest">RIWAYAT AGENDA TERBARU</h3>
                    <Button variant="outline" size="sm" className="text-[10px] font-black">LIHAT SEMUA</Button>
                  </div>
                  <div className="divide-y divide-line">
                    {participations.length === 0 ? (
                      <div className="p-16 text-center text-muted text-sm italic">Belum ada riwayat agenda kegiatan.</div>
                    ) : (
                      participations.slice(0, 5).map(p => (
                        <div key={p.id} className="p-6 flex items-center justify-between hover:bg-surface/50 transition-colors">
                          <div className="flex gap-4 items-center">
                            <div className="h-12 w-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-inner">
                              <Calendar className="h-6 w-6" />
                            </div>
                            <div>
                               <p className="text-[14px] font-black text-ink">Agenda ID: {p.agendaId}</p>
                               <p className="text-[11px] text-muted font-medium mt-0.5 uppercase tracking-widest">{new Date(p.registeredAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Badge variant={p.status === 'Attended' ? 'primary' : 'outline'} className="font-bold">
                            {p.status === 'Attended' ? 'HADIR' : 'TERDAFTAR'}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white border border-line rounded-2xl p-10 space-y-10 shadow-sm animate-in fade-in duration-500">
                <div className="flex items-center justify-between border-b border-line pb-6">
                  <div>
                    <h3 className="text-[18px] font-black uppercase tracking-tight text-primary">Informasi Kader</h3>
                    <p className="text-[11px] text-muted mt-1 uppercase font-bold tracking-widest">Pastikan data sesuai untuk verifikasi sertifikat</p>
                  </div>
                  <UserIcon className="h-8 w-8 text-primary/20" />
                </div>

                <div className="flex flex-col md:flex-row gap-10">
                  <div className="flex flex-col items-center gap-4">
                     <div className="h-40 w-40 rounded-3xl border-4 border-surface bg-surface overflow-hidden shadow-2xl relative group">
                        {user.photoUrl ? (
                          <img src={user.photoUrl} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-primary/5 text-primary text-5xl font-black">{getInitials(user.name)}</div>
                        )}
                        <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-help">
                           <p className="text-[10px] font-black text-white uppercase tracking-widest">Foto Master</p>
                        </div>
                     </div>
                     <p className="text-[10px] text-muted font-black uppercase tracking-widest">Pas Foto Kader</p>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted uppercase tracking-[0.1em]">Nama Lengkap</label>
                        <input 
                          type="text" 
                          value={profileForm.name}
                          onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                          className="w-full bg-surface border border-line rounded-xl px-5 py-3.5 text-[14px] font-bold text-ink focus:ring-2 focus:ring-primary/10 outline-none transition-all" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted uppercase tracking-[0.1em]">NIM / Identitas</label>
                        <div className="w-full bg-gray-50 border border-line rounded-xl px-5 py-3.5 text-[14px] font-bold text-muted cursor-not-allowed italic">{user.nim}</div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted uppercase tracking-[0.1em]">No. WhatsApp</label>
                        <input 
                          type="text" 
                          value={profileForm.whatsapp}
                          onChange={e => setProfileForm({...profileForm, whatsapp: e.target.value})}
                          className="w-full bg-surface border border-line rounded-xl px-5 py-3.5 text-[14px] font-bold text-ink focus:ring-2 focus:ring-primary/10 outline-none transition-all" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted uppercase tracking-[0.1em]">Komisariat / Rayon</label>
                        <input 
                          type="text" 
                          value={profileForm.komisariat}
                          onChange={e => setProfileForm({...profileForm, komisariat: e.target.value})}
                          className="w-full bg-surface border border-line rounded-xl px-5 py-3.5 text-[14px] font-bold text-ink focus:ring-2 focus:ring-primary/10 outline-none transition-all" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted uppercase tracking-[0.1em]">Email Google</label>
                        <div className="w-full bg-gray-50 border border-line rounded-xl px-5 py-3.5 text-[14px] font-bold text-muted cursor-not-allowed">{user.email}</div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted uppercase tracking-[0.1em]">Pendidikan Kader</label>
                        <div className="w-full bg-gray-50 border border-line rounded-xl px-5 py-3.5 text-[14px] font-bold text-muted italic">{user.statusKaderisasi}</div>
                     </div>
                  </div>
                </div>

                <div className="p-5 bg-accent/5 rounded-2xl flex items-start gap-4 border border-accent/10">
                   <AlertCircle className="h-6 w-6 text-primary mt-0.5" />
                   <div>
                      <p className="text-[13px] font-bold text-primary">Kebijakan Privasi & Data</p>
                      <p className="text-[11px] text-primary/70 leading-relaxed mt-1">
                        Data identitas utama (NIM dan Email) dikunci oleh sistem untuk keamanan basis data. Silakan hubungi Administrator Cabang Lumajang jika memerlukan perubahan data tersebut.
                      </p>
                   </div>
                </div>

                <div className="flex justify-end pt-6">
                   <Button 
                     onClick={handleUpdateProfile}
                     disabled={loading}
                     variant="primary" 
                     className="px-12 py-7 rounded-2xl font-black text-[13px] tracking-widest uppercase shadow-xl shadow-primary/20"
                   >
                     {loading ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
                   </Button>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="bg-white border border-line rounded-2xl p-10 space-y-8 shadow-sm animate-in fade-in duration-500">
                <div className="flex items-center justify-between border-b border-line pb-6">
                  <div>
                    <h3 className="text-[18px] font-black uppercase tracking-tight text-primary">Tulis Konten & Gagasan</h3>
                    <p className="text-[11px] text-muted mt-1 uppercase font-bold tracking-widest">Karyakan pemikiran Sahabat untuk kemajuan pergerakan</p>
                  </div>
                  <Badge variant="outline" className="px-4 py-1 text-[10px] font-black">STATUS: TERBUKA</Badge>
                </div>
                
                {postError && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-xs font-bold border border-red-100">
                    <AlertCircle className="h-5 w-5" /> {postError}
                  </div>
                )}

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted uppercase tracking-widest">Judul Artikel / Berita</label>
                      <input 
                        type="text" 
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        placeholder="Contoh: Refleksi Perjuangan Mahasiswa..." 
                        className="w-full bg-surface border border-line rounded-xl px-5 py-3.5 text-[14px] font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted uppercase tracking-widest">Kategori</label>
                      <select 
                        value={postCategory}
                        onChange={(e) => setPostCategory(e.target.value)}
                        className="w-full bg-surface border border-line rounded-xl px-5 py-3.5 text-[14px] font-bold outline-none appearance-none cursor-pointer"
                      >
                        <option value="Berita">Berita Pergerakan</option>
                        <option value="Artikel">Artikel Gagasan</option>
                        <option value="Opini">Opini Kader</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest">Body / Isi Artikel</label>
                    <div className="border border-line rounded-2xl overflow-hidden min-h-[400px] shadow-sm">
                      <TiptapEditor 
                        content={postContent}
                        onChange={setPostContent}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest">Gambar Sampul (Max 1.5MB)</label>
                    <div className="p-12 border-4 border-dashed border-line rounded-3xl flex flex-col items-center justify-center text-center gap-6 bg-surface/50 hover:bg-surface transition-colors cursor-pointer group" onClick={() => !postImage && document.getElementById('post-image')?.click()}>
                      {postImage ? (
                        <div className="relative">
                          <img 
                            src={URL.createObjectURL(postImage)} 
                            className="h-56 w-auto rounded-3xl shadow-2xl border-4 border-white" 
                            alt="Preview" 
                          />
                          <button 
                            onClick={(e) => { e.stopPropagation(); setPostImage(null); }}
                            className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full p-2.5 shadow-xl hover:bg-red-600 transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="h-20 w-20 rounded-3xl bg-white flex items-center justify-center border border-line shadow-xl group-hover:scale-110 transition-transform">
                            <Camera className="h-10 w-10 text-muted" />
                          </div>
                          <div>
                            <p className="text-[15px] font-black text-ink uppercase tracking-wider">Pilih Gambar Sampul</p>
                            <p className="text-[11px] text-muted font-bold mt-2 uppercase">REKOMENDASI: 1920x1080 PX (LANDSCAPE)</p>
                          </div>
                          <input 
                            type="file" 
                            id="post-image" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => { if (e.target.files?.[0]) setPostImage(e.target.files[0]); }}
                          />
                          <Button 
                            variant="primary" 
                            size="md" 
                            className="px-10 py-5 font-black text-[11px] uppercase tracking-[0.2em]"
                          >
                             PILIH BERKAS
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="pt-8 flex justify-end">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    disabled={loading}
                    onClick={handleSubmitPost}
                    className="px-16 py-8 rounded-2xl font-black text-[14px] tracking-widest uppercase shadow-2xl shadow-primary/30"
                  >
                    {loading ? 'MENGIRIM GAGASAN...' : 'PUBLIKASIKAN GAGASAN'}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'certificates' && (
              <div className="bg-white border border-line rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-500">
                <div className="px-8 py-7 border-b border-line bg-surface/30">
                  <h3 className="text-[18px] font-black uppercase tracking-tight text-primary">Sertifikat Digital Sahabat</h3>
                  <p className="text-[11px] text-muted mt-1 uppercase font-bold tracking-widest">Sertifikat resmi PMII ITB WIGA untuk setiap kegiatan yang Sahabat ikuti</p>
                </div>
                <div className="divide-y divide-line">
                  {participations.length === 0 ? (
                    <div className="p-32 text-center flex flex-col items-center justify-center gap-6">
                       <Clock className="h-16 w-16 text-muted/20" />
                       <div className="space-y-1">
                         <p className="text-ink text-[16px] font-black uppercase tracking-widest">Belum Ada Sertifikat</p>
                         <p className="text-muted text-[12px] font-bold uppercase tracking-widest opacity-60">Selesaikan jenjang kaderisasi untuk mendapatkan sertifikat resmi.</p>
                       </div>
                    </div>
                  ) : (
                    participations.map(p => (
                      <div key={p.id} className="p-8 flex items-center justify-between hover:bg-surface/50 transition-all group">
                        <div className="flex gap-6 items-center">
                          <div className={cn(
                            "h-16 w-16 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                            p.certificateUrl ? "bg-primary text-white scale-110" : "bg-muted/10 text-muted"
                          )}>
                            {p.certificateUrl ? <CheckCircle className="h-8 w-8" /> : <Clock className="h-8 w-8" />}
                          </div>
                          <div>
                            <p className="text-[16px] font-black text-ink leading-tight">Agenda: {p.agendaId}</p>
                            <div className="flex items-center gap-3 mt-2">
                               <Badge variant={p.status === 'Attended' ? 'primary' : 'outline'} className="text-[9px] font-black px-3">
                                 {p.status === 'Attended' ? 'TERVERIFIKASI' : 'MENUNGGU VALIDASI'}
                               </Badge>
                               <span className="text-[10px] text-muted font-black tracking-widest">ID #{p.id.slice(-6)}</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant={p.certificateUrl ? 'primary' : 'outline'} 
                          size="md" 
                          disabled={!p.certificateUrl}
                          className="px-8 font-black text-[11px] tracking-widest uppercase shadow-lg"
                          onClick={() => p.certificateUrl && window.open(p.certificateUrl, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" /> UNDUH SERTIFIKAT
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
