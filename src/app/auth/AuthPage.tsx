import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Lock, Phone, GraduationCap, Building2, ArrowRight, Github, Camera, Upload, MapPin, Calendar as CalendarIcon, UserCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginWithEmail, registerMember, loginWithGoogle } from '@/src/services/authService';
import { useAuth } from '@/src/lib/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import { compressImage } from '@/src/lib/imageUtils';

export function AuthPage() {
  const { user, login } = useAuth();
  const [isLogin, setIsLogin] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [errorDetails, setErrorDetails] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from || null;

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      if (from) {
        navigate(from, { replace: true });
      } else {
        const userRole = (user.role || (user as any).Role || (user as any).ROLE || '').toString().trim().toUpperCase();
        const isPrivileged = userRole.includes('ADMIN') || userRole.includes('PENGURUS');
        const path = isPrivileged ? '/admin' : '/member';
        navigate(path);
      }
    }
  }, [user, navigate, from]);

  // Form States
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [name, setName] = React.useState('');
  const [nim, setNim] = React.useState('');
  const [whatsapp, setWhatsapp] = React.useState('');
  const [komisariat, setKomisariat] = React.useState('');
  const [jenisKelamin, setJenisKelamin] = React.useState('');
  const [tempatLahir, setTempatLahir] = React.useState('');
  const [tanggalLahir, setTanggalLahir] = React.useState('');
  const [alamat, setAlamat] = React.useState('');
  const [photo, setPhoto] = React.useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };


  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    const loadingToast = toast.loading(isLogin ? 'Sedang memverifikasi...' : 'Sedang memproses pendaftaran, harap tunggu...');

    try {
      if (isLogin) {
        const result = await loginWithEmail(email, password);
        if (result.success && result.user) {
          toast.dismiss(loadingToast);
          toast.success(`Selamat datang kembali, ${result.user.name}!`);
          login(result.user); // Using context login
          if (from) {
            navigate(from, { replace: true });
          } else {
            const userRole = (result.user.role || (result.user as any).Role || (result.user as any).ROLE || '').toString().trim().toUpperCase();
            const isPrivileged = userRole.includes('ADMIN') || userRole.includes('PENGURUS');
            const path = isPrivileged ? '/admin' : '/member';
            navigate(path);
          }
        } else {
          toast.dismiss(loadingToast);
          toast.error('Login gagal');
          setError(result.message || 'Email atau Password salah.');
        }
      } else {
        let photoBase64 = '';
        if (photo) {
          photoBase64 = await compressImage(photo);
        }

        const result = await registerMember({ 
          name, nim, email, whatsapp, komisariat, 
          jenisKelamin, tempatLahir, tanggalLahir, alamat,
          password, 
          statusKaderisasi: 'CALON',
          role: 'CALON',
          accountStatus: 'AKTIF',
          photoUrl: '', // Will be set by server
          ...({ 
            photoBase64, 
            photoName: photo?.name 
          } as any)
        });
        if (result.success) {
          toast.dismiss(loadingToast);
          toast.success('Pendaftaran berhasil! Silakan login sekarang.');
          setIsLogin(true);
        } else {
          toast.dismiss(loadingToast);
          toast.error('Gagal mendaftar');
          setError(result.message || 'Gagal mendaftarkan akun. Coba lagi.');
        }
      }
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error('Kesalahan sistem');
      setError(err.message || 'Terjadi kesalahan koneksi.');
      setErrorDetails(err.details || null);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      let fetchedUserInfo: any = null;
      const googleToastId = toast.loading('Sedang memproses akun Google...');
      try {
        setIsGoogleLoading(true);
        setError(null);
        setErrorDetails(null);
        
        // Fetch user basic profile using access token
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        
        if (!userInfoRes.ok) {
          throw new Error('Gagal mengambil data dari Google');
        }
        
        fetchedUserInfo = await userInfoRes.json();
        
        // Send to backend
        const result = await loginWithGoogle(fetchedUserInfo.email, fetchedUserInfo.name, fetchedUserInfo.picture);
        
        if (result.success && result.user) {
          toast.dismiss(googleToastId);
          toast.success(`Berhasil login dengan akun Google!`);
          login(result.user);
          if (from) {
            navigate(from, { replace: true });
          } else {
            const userRole = (result.user.role || (result.user as any).Role || (result.user as any).ROLE || '').toString().trim().toUpperCase();
            const isPrivileged = userRole.includes('ADMIN') || userRole.includes('PENGURUS');
            const path = isPrivileged ? '/admin' : '/member';
            navigate(path);
          }
        } else if (result.requireRegistration === true || String(result.requireRegistration) === 'true') {
          setIsLogin(false);
          setEmail(fetchedUserInfo.email || '');
          setName(fetchedUserInfo.name || '');
          // Auto generate a complex password since they use Google, or let them set one
          // We will let them set one as fallback
          toast.dismiss(googleToastId);
          toast.info("Email Anda belum terdaftar. Silakan lengkapi data profil berikut untuk menyelesaikan pendaftaran.", { duration: 6000 });
          setError("Email Anda belum terdaftar. Silakan melengkapi form manual.");
        } else {
          toast.dismiss(googleToastId);
          toast.error(result.message || 'Gagal login menggunakan Google.');
          setError(result.message || 'Gagal login menggunakan Google.');
        }
      } catch (err: any) {
        // If the backend returned a wrapper error but it has requireRegistration, parse it
        if (err.requireRegistration || err.message?.includes('Email belum terdaftar')) {
          setIsLogin(false);
          if (fetchedUserInfo) {
             setEmail(fetchedUserInfo.email || '');
             setName(fetchedUserInfo.name || '');
          }
          setError("Email Anda belum terdaftar. Silakan melengkapi form manual.");
          toast.dismiss(googleToastId);
          toast.info("Email Anda belum terdaftar. Silakan melengkapi data profil berikut untuk menyelesaikan pendaftaran.", { duration: 6000 });
        } else {
          toast.dismiss(googleToastId);
          toast.error('Kesalahan sistem Google');
          setError(err.message || 'Terjadi kesalahan sistem.');
        }
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: errorResponse => {
      console.error(errorResponse);
      toast.error('Login Google dibatalkan atau gagal.');
      setError('Login Google dibatalkan atau gagal.');
    },
  });

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-surface px-4">
      <div className="max-w-[1000px] w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-2xl border border-line">
        
        {/* Left Side: Branding / Info */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-primary text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 mb-12">
              <div className="bg-white p-2 rounded-lg">
                <img src="/logo.svg" className="h-8 w-auto" alt="Logo" />
              </div>
              <span className="font-black text-xl tracking-tighter">PMII WIGA</span>
            </Link>
            
            <h1 className="text-4xl font-black leading-tight mb-6">
              {isLogin ? 'Selamat Datang Kembali, Sahabat!' : 'Gabung dalam Pergerakan Besar'}
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              {isLogin 
                ? 'Masuk ke portal kader untuk mengakses sertifikat, materi, dan pengelolaan administrasi organisasi.' 
                : 'Daftarkan diri Anda untuk menjadi bagian dari keluarga besar PMII ITB Widya Gama Lumajang.'}
            </p>
          </div>

          <div className="relative z-10 pt-12 border-t border-white/10">
            <p className="text-sm font-medium text-white/50 italic">
              "Tangan Terkepal dan Maju Ke Muka"
            </p>
          </div>
        </div>

        {/* Right Side: Forms */}
        <div className="p-8 lg:p-12">
          <div className="max-w-md mx-auto">
            <div className="flex gap-4 mb-8 bg-surface p-1 rounded-xl">
              <button 
                type="button"
                onClick={() => { setIsLogin(true); setError(null); }}
                className={cn(
                  "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all",
                  isLogin ? "bg-white shadow-sm text-primary" : "text-muted hover:text-ink"
                )}
              >
                LOG IN
              </button>
              <button 
                type="button"
                onClick={() => { setIsLogin(false); setError(null); }}
                className={cn(
                  "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all",
                  !isLogin ? "bg-white shadow-sm text-primary" : "text-muted hover:text-ink"
                )}
              >
                DAFTAR
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-100 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-600"></div>
                  <span className="text-xs font-bold uppercase tracking-tight">{error}</span>
                </div>
                {errorDetails && (
                  <div className="mt-2 pt-2 border-t border-red-200/50">
                    <p className="text-[10px] font-medium leading-relaxed text-red-500/80 bg-white/50 p-2 rounded">
                      <span className="font-black">Saran Perbaikan: </span>
                      {errorDetails}
                    </p>
                  </div>
                )}
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.form 
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleAuth}
                className="space-y-4"
              >
                {!isLogin && (
                  <>
                    <div className="flex flex-col items-center mb-6">
                      <div className="relative group">
                        <div className="h-20 w-20 rounded-full border-2 border-dashed border-line bg-surface flex items-center justify-center overflow-hidden group-hover:border-primary transition-colors cursor-pointer" onClick={() => document.getElementById('photo-upload')?.click()}>
                          {photoPreview ? (
                            <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                          ) : (
                            <Camera className="h-8 w-8 text-muted group-hover:text-primary transition-colors" />
                          )}
                        </div>
                        <input 
                          id="photo-upload"
                          type="file" 
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden" 
                        />
                        <button 
                          type="button"
                          onClick={() => document.getElementById('photo-upload')?.click()}
                          className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-lg border border-white"
                        >
                          <Upload className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-[10px] font-bold text-muted mt-2 uppercase tracking-widest">Unggah Foto Profil</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-widest text-muted ml-1">Nama Lengkap</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Masukkan nama sesuai KTP" 
                          className="w-full bg-surface border border-line rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all" 
                          required 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black uppercase tracking-widest text-muted ml-1">NIM / ID</label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                          <input 
                            type="text" 
                            value={nim}
                            onChange={(e) => setNim(e.target.value)}
                            placeholder="Nim Sahabat..." 
                            className="w-full bg-surface border border-line rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all" 
                            required 
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black uppercase tracking-widest text-muted ml-1">Jenis Kelamin</label>
                        <div className="relative">
                          <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                          <select 
                            value={jenisKelamin}
                            onChange={(e) => setJenisKelamin(e.target.value)}
                            className="w-full bg-surface border border-line rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/10 outline-none appearance-none transition-all" 
                            required
                          >
                            <option value="">Pilih JK</option>
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black uppercase tracking-widest text-muted ml-1">Tempat Lahir</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                          <input 
                            type="text" 
                            value={tempatLahir}
                            onChange={(e) => setTempatLahir(e.target.value)}
                            placeholder="Kota..." 
                            className="w-full bg-surface border border-line rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/10 outline-none" 
                            required 
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black uppercase tracking-widest text-muted ml-1">Tanggal Lahir</label>
                        <div className="relative">
                          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                          <input 
                            type="date" 
                            value={tanggalLahir}
                            onChange={(e) => setTanggalLahir(e.target.value)}
                            className="w-full bg-surface border border-line rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/10 outline-none" 
                            required 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-widest text-muted ml-1">Alamat Domisili</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted" />
                        <textarea 
                          value={alamat}
                          onChange={(e) => setAlamat(e.target.value)}
                          placeholder="Alamat lengkap..." 
                          rows={2}
                          className="w-full bg-surface border border-line rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/10 outline-none resize-none" 
                          required 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black uppercase tracking-widest text-muted ml-1">WhatsApp</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                          <input 
                            type="tel" 
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            placeholder="08..." 
                            className="w-full bg-surface border border-line rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all" 
                            required 
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black uppercase tracking-widest text-muted ml-1">Komisariat / Rayon</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                          <select 
                            value={komisariat}
                            onChange={(e) => setKomisariat(e.target.value)}
                            className="w-full bg-surface border border-line rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/10 outline-none appearance-none transition-all" 
                            required
                          >
                            <option value="">Pilih Komisariat</option>
                            <option>ITB Widya Gama Lumajang</option>
                            <option>Lainnya (Eksternal)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-muted ml-1">Email Google</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contoh@gmail.com" 
                      className="w-full bg-surface border border-line rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/10 outline-none" 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-muted ml-1">Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full bg-surface border border-line rounded-xl pl-10 pr-12 py-3 text-sm focus:ring-2 focus:ring-primary/10 outline-none" 
                      required 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  disabled={loading}
                  className="w-full py-6 rounded-xl font-black text-sm tracking-widest group"
                >
                  {loading ? 'MEMPROSES...' : (isLogin ? 'MASUK SEKARANG' : 'DAFTAR KADER')}
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                <div className="relative my-6 text-center">
                  <span className="relative z-10 bg-white px-4 text-[10px] font-black text-muted uppercase tracking-widest">Atau Gunakan</span>
                  <div className="absolute top-1/2 left-0 w-full h-px bg-line -translate-y-1/2"></div>
                </div>

                <button 
                  type="button" 
                  onClick={() => handleGoogleLogin()}
                  disabled={loading || isGoogleLoading}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-line rounded-xl py-3 text-sm font-bold hover:bg-surface transition-colors disabled:opacity-50"
                >
                  <img src="https://www.google.com/favicon.ico" className="h-4 w-4" alt="Google" />
                  {isGoogleLoading ? 'MEMPROSES...' : 'Lanjut dengan Google'}
                </button>
              </motion.form>
            </AnimatePresence>

            <p className="mt-8 text-center text-xs text-muted font-medium">
              {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{' '}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-bold hover:underline"
              >
                {isLogin ? 'Daftar di sini' : 'Login sekarang'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
