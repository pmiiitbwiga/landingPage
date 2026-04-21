import * as React from 'react';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { 
  LayoutDashboard, Users, FileText, Calendar, CheckSquare, 
  Settings, ExternalLink, ChevronRight, User as UserIcon, 
  Plus, Trash2, X, PlusCircle, Save, Download, Edit2, Search, Filter,
  Camera, Upload as UploadIcon, AlertCircle, CheckCircle, Clock, User
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { cn, getInitials } from '@/src/lib/utils';
import { Agenda, Member, Participation, Post, UserRole } from '@/src/types';
import { useAuth } from '@/src/lib/AuthContext';
import { TiptapEditor } from '@/src/components/editor/TiptapEditor';
import { createPost, getPosts } from '@/src/services/postService';
import { postToSheet } from '@/src/services/apiService';
import { getAgendas, getFormFields, addFormField, createAgenda, updateAgenda, deleteAgenda, getParticipations } from '@/src/services/agendaService';
import { getMembers, createMember, updateMember, deleteMember } from '@/src/services/memberService';

export function AdminDashboard() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();

  // Secondary Security Check
  const userRole = (user?.role || (user as any)?.Role || (user as any)?.ROLE || '').toString().trim().toUpperCase();
  const isAdmin = userRole.includes('ADMIN') || userRole.includes('PENGURUS');

  if (!isAdmin) {
    return <Navigate to="/member" replace />;
  }

  const [activeTab, setActiveTab] = React.useState<'overview' | 'submissions' | 'members' | 'agendas' | 'p-overview' | 'p-profile' | 'p-content' | 'p-certs'>('overview');
  const [pendingPosts, setPendingPosts] = React.useState<Post[]>([]);
  const [participations, setParticipations] = React.useState<any[]>([]);
  
  // Member Post State
  const [postTitle, setPostTitle] = React.useState('');
  const [postCategory, setPostCategory] = React.useState('Artikel');
  const [postContent, setPostContent] = React.useState('');
  const [postImage, setPostImage] = React.useState<File | null>(null);
  const [postError, setPostError] = React.useState<string | null>(null);
  const [agendas, setAgendas] = React.useState<Agenda[]>([]);
  const [members, setMembers] = React.useState<Member[]>([]);
  const [formFields, setFormFields] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showAgendaModal, setShowAgendaModal] = React.useState(false);
  const [editingAgendaId, setEditingAgendaId] = React.useState<string | null>(null);
  const [showMemberModal, setShowMemberModal] = React.useState(false);
  const [editingMemberUid, setEditingMemberUid] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('ALL');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [viewingParticipantsAgendaId, setViewingParticipantsAgendaId] = React.useState<string | null>(null);
  
  // Profile Edit State
  const [profileForm, setProfileForm] = React.useState({
    name: user?.name || '',
    whatsapp: user?.whatsapp || '',
    komisariat: user?.komisariat || ''
  });

  // Agenda Form State
  const [agendaForm, setAgendaForm] = React.useState({
    title: '',
    date: '',
    endDate: '',
    time: '',
    location: '',
    content: '',
    quota: '',
    facilities: '',
    requirements: '',
    logoBase64: '',
    customFields: [] as any[],
    contactPerson: ''
  });

  // Member Form State
  const [memberForm, setMemberForm] = React.useState({
    name: '',
    nim: '',
    email: '',
    jenisKelamin: 'Laki-laki',
    tempatLahir: '',
    tanggalLahir: '',
    Alamat: '',
    whatsapp: '',
    komisariat: '',
    statusKaderisasi: 'CALON',
    role: 'CALON' as UserRole,
    accountStatus: 'AKTIF' as any
  });

  // Master Field Modal State
  const [showFieldModal, setShowFieldModal] = React.useState(false);
  const [newField, setNewField] = React.useState({ label: '', type: 'text', options: '', isRequired: true });

  React.useEffect(() => {
    if (activeTab === 'submissions' || activeTab === 'overview') {
      getPosts().then(posts => {
        setPendingPosts(posts.filter(p => p.status === 'Pending'));
      });
    }
    if (activeTab === 'agendas') {
      loadAgendas();
      loadFormFields();
    }
    if (activeTab === 'members') {
      loadMembers();
    }
    if (activeTab === 'p-overview' || activeTab === 'p-certs') {
      loadMyParticipations();
    }
  }, [activeTab]);

  const loadMyParticipations = async () => {
    if (!user) return;
    try {
      const data = await getParticipations();
      const myData = data.filter(p => String(p.memberId) === String(user.uid));
      setParticipations(myData);
    } catch (err) {
      console.error('Load Participations error:', err);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmitMyPost = async () => {
    if (!postTitle || !postContent) {
      setPostError('Judul dan Isi konten wajib diisi.');
      return;
    }

    if (postImage && postImage.size > 1.5 * 1024 * 1024) {
      setPostError('Ukuran gambar terlalu besar (Maksimal 1.5MB).');
      return;
    }

    setLoading(true);
    setPostError(null);

    try {
      let imageBase64 = '';
      if (postImage) {
        imageBase64 = await fileToBase64(postImage);
      }

      const plainText = postContent
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&[a-z0-9#]+;/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      const excerpt = plainText.length > 150 ? plainText.substring(0, 150).trim() + '...' : plainText;

      const result = await createPost({
        title: postTitle,
        category: postCategory as any,
        content: postContent,
        excerpt,
        imageBase64,
        author: user!.name,
        authorId: user!.uid,
      });

      if (result.success) {
        alert('BERHASIL! Konten Sahabat telah diajukan dan sedang menunggu moderasi Admin.');
        setPostTitle('');
        setPostContent('');
        setPostImage(null);
        setActiveTab('p-overview');
      } else {
        throw new Error(result.message || 'Gagal mengirim konten.');
      }
    } catch (err: any) {
      setPostError(err.message || 'Terjadi kesalahan saat mengirim konten.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMyProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await updateMember(user.uid, profileForm);
      if (res.success) {
        const updatedUser = { ...user, ...profileForm };
        login(updatedUser);
        alert('Profil Berhasil Diperbarui!');
      } else {
        alert('Gagal memperbarui profil: ' + res.message);
      }
    } catch (err) {
      alert('Terjadi kesalahan saat memperbarui profil.');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    setLoading(true);
    const data = await getMembers();
    setMembers(data);
    setLoading(false);
  };

  const loadAgendas = async () => {
    setLoading(true);
    const data = await getAgendas();
    setAgendas(data);
    setLoading(false);
  };

  const loadFormFields = async () => {
    const data = await getFormFields();
    setFormFields(data);
  };

  const loadParticipations = async () => {
    setLoading(true);
    const data = await getParticipations();
    setParticipations(data);
    setLoading(false);
  };

  const handleCreateAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...agendaForm,
        authorId: user?.uid,
        customFields: JSON.stringify(agendaForm.customFields)
      };
      
      const res = editingAgendaId 
        ? await updateAgenda(editingAgendaId, payload)
        : await createAgenda(payload);

      if (res.success) {
        alert(editingAgendaId ? 'Agenda berhasil diperbarui!' : 'Agenda berhasil dibuat!');
        setShowAgendaModal(false);
        setEditingAgendaId(null);
        setAgendaForm({ title: '', date: '', endDate: '', time: '', location: '', content: '', quota: '', facilities: '', requirements: '', logoBase64: '', customFields: [], contactPerson: '' });
        loadAgendas();
      }
    } catch (err) {
      alert('Gagal menyimpan agenda.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgenda = async (id: string) => {
    if (!confirm('Hapus agenda ini secara permanen?')) return;
    try {
      setLoading(true);
      const res = await deleteAgenda(id);
      if (res.success) {
        loadAgendas();
      } else {
        alert(res.message || 'Gagal menghapus agenda.');
      }
    } catch (err) {
      alert('Gagal menghapus agenda.');
    } finally {
      setLoading(false);
    }
  };

  const openEditAgenda = (agd: Agenda) => {
    setEditingAgendaId(agd.id);
    let cFields = [];
    try {
      cFields = typeof agd.customFields === 'string' ? JSON.parse(agd.customFields) : (agd.customFields || []);
    } catch (e) {
      cFields = [];
    }
    
    setAgendaForm({
      title: agd.title,
      date: agd.date ? agd.date.substring(0, 10) : '',
      endDate: agd.endDate ? agd.endDate.substring(0, 10) : '',
      time: agd.time ? agd.time.replace('.', ':') : '',
      location: agd.location,
      content: agd.content,
      quota: agd.quota?.toString() || '',
      facilities: agd.facilities || '',
      requirements: agd.requirements || '',
      logoBase64: '',
      customFields: cFields,
      contactPerson: agd.contactPerson || ''
    });
    setShowAgendaModal(true);
  };

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = editingMemberUid 
        ? await updateMember(editingMemberUid, memberForm)
        : await createMember(memberForm);

      if (res.success) {
        alert(editingMemberUid ? 'Data kader diperbarui!' : 'Kader baru berhasil ditambah!');
        setShowMemberModal(false);
        setEditingMemberUid(null);
        setMemberForm({ 
          name: '', 
          nim: '', 
          email: '', 
          jenisKelamin: 'Laki-laki',
          tempatLahir: '',
          tanggalLahir: '',
          Alamat: '',
          whatsapp: '', 
          komisariat: '', 
          statusKaderisasi: 'CALON', 
          role: 'CALON',
          accountStatus: 'AKTIF'
        });
        loadMembers();
      } else {
        alert(res.message || 'Gagal menyimpan data kader.');
      }
    } catch (err) {
      alert('Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (uid: string) => {
    if (!confirm('Hapus data kader ini?')) return;
    try {
      setLoading(true);
      const res = await deleteMember(uid);
      if (res.success) {
        loadMembers();
      }
    } catch (err) {
      alert('Gagal menghapus kader.');
    } finally {
      setLoading(false);
    }
  };

  const openEditMember = (m: Member) => {
    setEditingMemberUid(m.uid);
    setMemberForm({
      name: m.name,
      nim: m.nim,
      email: m.email,
      jenisKelamin: m.jenisKelamin || 'Laki-laki',
      tempatLahir: m.tempatLahir || '',
      tanggalLahir: m.tanggalLahir ? m.tanggalLahir.substring(0, 10) : '',
      Alamat: m.Alamat || '',
      whatsapp: m.whatsapp,
      komisariat: m.komisariat,
      statusKaderisasi: m.statusKaderisasi,
      role: m.role,
      accountStatus: m.accountStatus || 'AKTIF'
    });
    setShowMemberModal(true);
  };

  const fetchImageAsBase64 = async (url: string): Promise<string | null> => {
    if (!url || url === '-' || !url.startsWith('http')) return null;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error('Error fetching image:', e);
      return null;
    }
  };

  const downloadExcel = async (data: any[], filename: string) => {
    if (data.length === 0) return;
    setLoading(true);
    
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data PMII');

      let processedData = data;
      const isMemberExport = filename === 'data_kader.csv';
      const isAgendaExport = filename === 'agenda_peserta.csv';

      if (isMemberExport) {
        processedData = data.map(m => ({
          'Nama': m.name,
          'NIM': m.nim,
          'Email': m.email,
          'Jenis Kelamin': m.jenisKelamin,
          'Tempat Lahir': m.tempatLahir,
          'Tanggal Lahir': m.tanggalLahir ? m.tanggalLahir.substring(0, 10) : '',
          'Alamat': m.Alamat,
          'WhatsApp': m.whatsapp,
          'Komisariat': m.komisariat,
          'Status Kaderisasi': m.statusKaderisasi,
          'Status Akun': m.accountStatus || 'AKTIF',
          'Role': m.role,
          'Foto': m.photoUrl || '',
          'Bergabung Pada': m.createdAt
        }));
      } else if (isAgendaExport) {
        processedData = data.map(p => {
          const member = members.find(m => m.uid === p.memberId);
          let fData = {};
          try { fData = JSON.parse(p.formData); } catch(e) {}
          return {
            'Nama': member?.name || 'Unknown',
            'NIM': member?.nim || '',
            'Email': member?.email || '',
            'Jenis Kelamin': member?.jenisKelamin || '',
            'Tempat Lahir': member?.tempatLahir || '',
            'Tanggal Lahir': member?.tanggalLahir || '',
            'Alamat': member?.Alamat || '',
            'WhatsApp': member?.whatsapp || '',
            'Komisariat': member?.komisariat || '',
            'Foto Peserta': member?.photoUrl || '',
            'Status Presensi': p.status,
            ...fData,
            'Terdaftar Pada': new Date(p.registeredAt).toLocaleString('id-ID')
          };
        });
      }

      const headers = Object.keys(processedData[0]);
      worksheet.columns = headers.map(h => ({ 
        header: h.toUpperCase(), 
        key: h, 
        width: h === 'Alamat' ? 40 : 20 
      }));

      // Style Header
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF004A99' } // PMII Blue
      };

      for (let i = 0; i < processedData.length; i++) {
        const rowData = processedData[i];
        const row = worksheet.addRow(rowData);
        row.height = 60;
        row.alignment = { vertical: 'middle', horizontal: 'left' };

        // Handle Image Embedding
        const photoFieldName = isMemberExport ? 'Foto' : (isAgendaExport ? 'Foto Peserta' : null);
        if (photoFieldName && rowData[photoFieldName]) {
          const imgUrl = rowData[photoFieldName];
          const base64 = await fetchImageAsBase64(imgUrl);
          
          if (base64) {
            try {
              const imageId = workbook.addImage({
                base64: base64,
                extension: 'png',
              });

              const colIndex = headers.indexOf(photoFieldName);
              worksheet.addImage(imageId, {
                tl: { col: colIndex, row: i + 1 },
                ext: { width: 70, height: 75 },
                editAs: 'oneCell'
              });
              
              // Clear URL text to show only image
              row.getCell(colIndex + 1).value = "";
            } catch (imgErr) {
              console.error("Failed to add image to excel", imgErr);
            }
          }
        }
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const finalFileName = filename.replace('.csv', '.xlsx');
      saveAs(new Blob([buffer]), finalFileName);
    } catch (err) {
      console.error("Export Error:", err);
      alert("Gagal mengekspor data ke Excel.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAgendaForm(prev => ({ ...prev, logoBase64: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleAddNewMasterField = async () => {
    if (!newField.label) return;
    try {
      setLoading(true);
      const res = await addFormField(newField);
      if (res.success) {
        await loadFormFields();
        setShowFieldModal(false);
        setNewField({ label: '', type: 'text', options: '', isRequired: true });
      }
    } catch (err) {
      alert('Gagal menambah field.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFieldSelection = (field: any) => {
    const exists = agendaForm.customFields.find(f => f.id === field.id);
    if (exists) {
      setAgendaForm(prev => ({ ...prev, customFields: prev.customFields.filter(f => f.id !== field.id) }));
    } else {
      setAgendaForm(prev => ({ ...prev, customFields: [...prev.customFields, field] }));
    }
  };

  const openParticipants = (id: string) => {
    setViewingParticipantsAgendaId(id);
    loadParticipations();
    loadMembers(); // Ensure we have latest user names
  };

  const downloadParticipants = (agendaId: string) => {
    const agenda = agendas.find(a => a.id === agendaId);
    const filtered = participations.filter(p => p.agendaId === agendaId);
    if (filtered.length === 0) {
      alert('Belum ada pendaftar untuk agenda ini.');
      return;
    }
    
    downloadExcel(filtered, 'agenda_peserta.csv');
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Setujui dan terbitkan konten ini?')) return;
    try {
      setLoading(true);
      await postToSheet('update_post', { id, status: 'Published' });
      setPendingPosts(prev => prev.filter(p => p.id !== id));
      alert('Konten berhasil diterbitkan!');
    } catch (err) {
      alert('Gagal menyetujui konten.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Tolak konten ini?')) return;
    try {
      setLoading(true);
      await postToSheet('update_post', { id, status: 'Rejected' });
      setPendingPosts(prev => prev.filter(p => p.id !== id));
      alert('Konten ditolak.');
    } catch (err) {
      alert('Gagal menolak konten.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-surface min-h-screen">
      {/* Top Bar */}
      <div className="bg-primary text-white border-b-2 border-accent px-6 h-[50px] flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
            <span className="text-[14px] font-extrabold tracking-tighter uppercase whitespace-nowrap">Dashboard Terpadu</span>
            <div className="h-4 w-px bg-white/20 hidden sm:block"></div>
            <span className="text-[12px] opacity-70 hidden sm:block">Sistem Informasi WIGA</span>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[11px] font-bold truncate max-w-[150px] leading-tight">{user.name}</span>
              <span className="text-[9px] font-black tracking-widest text-accent uppercase">{user.role}</span>
            </div>
            <Button onClick={logout} variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-7 text-[10px] font-extrabold uppercase">KELUAR</Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Unified Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
             {/* Admin Section */}
             <div className="space-y-2">
                <h4 className="px-4 text-[10px] font-black text-muted uppercase tracking-widest">AREA ADMINISTRASI</h4>
                <nav className="bg-white border border-line rounded-xl overflow-hidden p-2 space-y-1 shadow-sm">
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className={cn("w-full flex items-center justify-between px-4 py-3 text-[13px] font-bold rounded-lg transition-colors", activeTab === 'overview' ? "bg-primary text-white" : "text-muted hover:bg-surface")}
                  >
                    <div className="flex items-center gap-3"><LayoutDashboard className="h-4 w-4" /> Ikhtisar Admin</div>
                    <ChevronRight className="h-3 w-3 opacity-50" />
                  </button>
                  <button 
                    onClick={() => setActiveTab('submissions')}
                    className={cn("w-full flex items-center justify-between px-4 py-3 text-[13px] font-bold rounded-lg transition-colors", activeTab === 'submissions' ? "bg-primary text-white" : "text-muted hover:bg-surface")}
                  >
                    <div className="flex items-center gap-3"><FileText className="h-4 w-4" /> Persetujuan Konten</div>
                    <span className={cn("h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-extrabold", activeTab === 'submissions' ? "bg-white text-primary" : "bg-accent text-primary")}>
                      {pendingPosts.length}
                    </span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('members')}
                    className={cn("w-full flex items-center justify-between px-4 py-3 text-[13px] font-bold rounded-lg transition-colors", activeTab === 'members' ? "bg-primary text-white" : "text-muted hover:bg-surface")}
                  >
                    <div className="flex items-center gap-3"><Users className="h-4 w-4" /> Manajemen Kader</div>
                    <ChevronRight className="h-3 w-3 opacity-50" />
                  </button>
                  <button 
                    onClick={() => setActiveTab('agendas')}
                    className={cn("w-full flex items-center justify-between px-4 py-3 text-[13px] font-bold rounded-lg transition-colors", activeTab === 'agendas' ? "bg-primary text-white" : "text-muted hover:bg-surface")}
                  >
                    <div className="flex items-center gap-3"><Calendar className="h-4 w-4" /> Kelola Agenda</div>
                    <ChevronRight className="h-3 w-3 opacity-50" />
                  </button>
                </nav>
             </div>

             {/* Personal Section */}
             <div className="space-y-2">
                <h4 className="px-4 text-[10px] font-black text-muted uppercase tracking-widest">AREA PERSONAL KADER</h4>
                <nav className="bg-white border border-line rounded-xl overflow-hidden p-2 space-y-1 shadow-sm">
                  <button 
                    onClick={() => setActiveTab('p-overview')}
                    className={cn("w-full flex items-center justify-between px-4 py-3 text-[13px] font-bold rounded-lg transition-colors", activeTab === 'p-overview' ? "bg-primary text-white" : "text-muted hover:bg-surface")}
                  >
                    <div className="flex items-center gap-3"><UserIcon className="h-4 w-4" /> Dashboard Saya</div>
                    <ChevronRight className="h-3 w-3 opacity-50" />
                  </button>
                  <button 
                    onClick={() => setActiveTab('p-profile')}
                    className={cn("w-full flex items-center justify-between px-4 py-3 text-[13px] font-bold rounded-lg transition-colors", activeTab === 'p-profile' ? "bg-primary text-white" : "text-muted hover:bg-surface")}
                  >
                    <div className="flex items-center gap-3"><Settings className="h-4 w-4" /> Profil & Akun</div>
                    <ChevronRight className="h-3 w-3 opacity-50" />
                  </button>
                  <button 
                    onClick={() => setActiveTab('p-content')}
                    className={cn("w-full flex items-center justify-between px-4 py-3 text-[13px] font-bold rounded-lg transition-colors", activeTab === 'p-content' ? "bg-primary text-white" : "text-muted hover:bg-surface")}
                  >
                    <div className="flex items-center gap-3"><Edit2 className="h-4 w-4" /> Tulis Konten</div>
                    <ChevronRight className="h-3 w-3 opacity-50" />
                  </button>
                  <button 
                    onClick={() => setActiveTab('p-certs')}
                    className={cn("w-full flex items-center justify-between px-4 py-3 text-[13px] font-bold rounded-lg transition-colors", activeTab === 'p-certs' ? "bg-primary text-white" : "text-muted hover:bg-surface")}
                  >
                    <div className="flex items-center gap-3"><PlusCircle className="h-4 w-4" /> Sertifikat & Agenda</div>
                    <ChevronRight className="h-3 w-3 opacity-50" />
                  </button>
                </nav>
             </div>

             <div className="mt-8 bg-white border border-line rounded-xl p-5 space-y-4 shadow-sm">
                <h4 className="text-[11px] font-bold text-muted uppercase tracking-widest border-b border-line pb-2">Informasi Sistem</h4>
                <div className="space-y-2">
                    <p className="text-[11px] font-medium text-muted flex justify-between">DB: <span>Spreadsheet</span></p>
                    <p className="text-[11px] font-medium text-muted flex justify-between">API: <span className="text-green-500 font-bold">Online</span></p>
                    <p className="text-[11px] font-medium text-muted flex justify-between">Asset: <span>GDrive</span></p>
                </div>
                <Button size="sm" variant="outline" className="w-full text-[10px] font-extrabold" onClick={() => window.open('https://docs.google.com/spreadsheets/d/1X-6a8Yt_z9Gv1oH7-z0T-Ld7fP-f0t_V-y_q-X-y-k8/edit', '_blank')}>
                   MASTER DATA <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
            </div>
          </aside>

          {/* Admin Main Content */}
          <main className="lg:col-span-9 space-y-8">
            
            {activeTab === 'overview' && (
              <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatBox title="Total Kader" val="542" />
                    <StatBox title="Agenda Aktif" val="3" />
                    <StatBox title="Total Artikel" val="128" />
                    <StatBox title="Pending" val={pendingPosts.length.toString()} highlight />
                 </div>

                 <div className="bg-white border border-line rounded-xl p-6">
                    <h3 className="text-[14px] font-extrabold uppercase mb-6">Aktivitas Terakhir</h3>
                    <div className="space-y-4">
                        <ActivityItem action="Mendaftarkan agenda baru: MAPABA 2026" time="2 jam lalu" />
                        <ActivityItem action="Menyetujui artikel dari Sahabat Fauzi" time="4 jam lalu" />
                        <ActivityItem action="Memverifikasi kehadiran 42 kader" time="Kemarin" />
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="bg-white border border-line rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-line bg-surface/30">
                  <h3 className="text-[14px] font-extrabold uppercase tracking-tight">Menunggu Persetujuan</h3>
                  <p className="text-[11px] text-muted">Konten yang ditulis anggota memerlukan validasi sebelum tayang publik.</p>
                </div>
                <div className="divide-y divide-line">
                  {pendingPosts.length === 0 ? (
                    <div className="p-12 text-center text-muted italic text-[13px]">
                      Tidak ada konten yang menunggu persetujuan.
                    </div>
                  ) : (
                    pendingPosts.map(post => (
                      <div key={post.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <Badge variant="outline" className="text-[9px]">{post.category}</Badge>
                             <h4 className="text-[14px] font-bold text-ink">{post.title}</h4>
                          </div>
                          <p className="text-[11px] text-muted">Oleh: <span className="font-bold text-primary">{post.author}</span> • {new Date(post.createdAt!).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link to={`/${post.category?.toLowerCase()}/${post.slug}`} target="_blank">
                            <Button variant="outline" size="sm" className="text-[11px] font-extrabold text-muted">PRATINJAU</Button>
                          </Link>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            disabled={loading}
                            onClick={() => handleReject(post.id)}
                            className="text-[11px] font-extrabold text-red-600 bg-red-50 border-red-100"
                          >
                            TOLAK
                          </Button>
                          <Button 
                            variant="primary" 
                            size="sm" 
                            disabled={loading}
                            onClick={() => handleApprove(post.id)}
                            className="text-[11px] font-extrabold"
                          >
                            SETUJUI & TERBITKAN
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                {/* TEST EDIT */}
                <div className="flex items-center justify-between">
                   <div>
                      <h3 className="text-[18px] font-black uppercase tracking-tight text-primary">Manajemen Database Kader</h3>
                      <p className="text-[11px] text-muted font-bold mt-1 uppercase tracking-widest">Pusat Kendali Data dan Keanggotaan PMII ITB WIGA</p>
                   </div>
                   <div className="flex items-center gap-2">
                     <Button onClick={() => downloadExcel(members, 'database_kader_wiga.csv')} variant="outline" size="sm" className="text-[11px] font-black"><Download className="h-4 w-4 mr-2" /> EKSPOR DATA</Button>
                     <Button onClick={() => { setEditingMemberUid(null); setShowMemberModal(true); }} className="text-[11px] font-black bg-primary text-white"><Plus className="h-4 w-4 mr-2" /> TAMBAH KADER</Button>
                   </div>
                </div>

                {/* Member Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-line p-5 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Total Kader</p>
                    <h3 className="text-2xl font-black text-ink">{members.length}</h3>
                  </div>
                  <div className="bg-white border border-line p-5 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Kader Aktif</p>
                    <h3 className="text-2xl font-black text-primary">{members.filter(m => m.statusKaderisasi === 'KADER').length}</h3>
                  </div>
                  <div className="bg-white border border-line p-5 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Calon Anggota</p>
                    <h3 className="text-2xl font-black text-accent">{members.filter(m => m.statusKaderisasi === 'CALON').length}</h3>
                  </div>
                  <div className="bg-white border border-line p-5 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Pengurus</p>
                    <h3 className="text-2xl font-black text-ink">{members.filter(m => m.role === 'PENGURUS' || m.role === 'ADMIN').length}</h3>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                   <div className="flex flex-1 w-full gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                        <input 
                          type="text" 
                          placeholder="Cari Nama, NIM, atau Komisariat..." 
                          className="w-full bg-white border border-line rounded-xl pl-10 pr-4 py-2.5 text-[13px] font-medium focus:ring-2 focus:ring-primary/10 outline-none"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <select 
                        className="bg-white border border-line rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/10 cursor-pointer"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                      >
                         <option value="ALL">SEMUA AKSES</option>
                         <option value="ADMIN">ADMIN</option>
                         <option value="PENGURUS">PENGURUS</option>
                         <option value="KADER">KADER</option>
                         <option value="CALON">CALON</option>
                         <option value="KADER EKSTERNAL">EKSTERNAL</option>
                      </select>
                   </div>
                </div>

                <div className="bg-white border border-line rounded-3xl overflow-hidden shadow-sm">
                  {loading ? (
                    <div className="p-32 text-center flex flex-col items-center justify-center gap-6 animate-pulse">
                      <div className="h-20 w-20 rounded-3xl bg-surface"></div>
                      <p className="text-[12px] font-black text-muted uppercase tracking-[0.3em]">Singkronisasi Data...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-surface/50 border-b border-line">
                          <tr>
                            <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-widest">Profiling & Identitas</th>
                            <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-widest">Komisariat</th>
                            <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-widest">Kaderisasi</th>
                            <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-widest text-right">Opsi Manajemen</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                          {members.filter(m => {
                            const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                               m.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                               m.komisariat.toLowerCase().includes(searchTerm.toLowerCase());
                            const mRole = m.role.trim().toUpperCase();
                            const matchRole = roleFilter === 'ALL' || mRole === roleFilter;
                            return matchSearch && matchRole;
                          }).length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-10 py-40 text-center text-muted font-black text-[14px] uppercase tracking-widest opacity-20 italic">Kader tidak ditemukan.</td>
                            </tr>
                          ) : (
                            members.filter(m => {
                              const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                                 m.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                 m.komisariat.toLowerCase().includes(searchTerm.toLowerCase());
                              const mRole = m.role.trim().toUpperCase();
                              const matchRole = roleFilter === 'ALL' || mRole === roleFilter;
                              return matchSearch && matchRole;
                            }).map(m => (
                              <tr key={m.uid} className="hover:bg-surface/30 transition-all group">
                                <td className="px-10 py-6">
                                  <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-accent font-black text-[18px] shadow-xl shadow-primary/10 group-hover:scale-110 transition-transform">
                                      {getInitials(m.name)}
                                    </div>
                                    <div>
                                      <p className="text-[16px] font-black text-ink leading-tight group-hover:text-primary transition-colors">{m.name}</p>
                                      <div className="flex items-center gap-3 mt-1.5">
                                         <span className="text-[11px] font-black text-muted uppercase tracking-widest">{m.nim}</span>
                                         <span className="h-1.5 w-1.5 rounded-full bg-line"></span>
                                         <span className="text-[11px] font-bold text-muted">{m.whatsapp}</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-10 py-6">
                                  <div className="flex flex-col">
                                    <span className="text-[15px] font-black text-ink tracking-tight uppercase">{m.komisariat}</span>
                                    <span className="text-[10px] font-bold text-muted mt-1 uppercase tracking-widest">Kader Cabang Lumajang</span>
                                  </div>
                                </td>
                                <td className="px-10 py-6">
                                  <div className="flex flex-wrap gap-3 items-center">
                                    <Badge variant={m.role.trim().toUpperCase() === 'ADMIN' || m.role.trim().toUpperCase() === 'PENGURUS' ? 'primary' : 'outline'} className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5">{m.statusKaderisasi}</Badge>
                                    <Badge variant="accent" className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5">{m.role}</Badge>
                                    <div className={cn(
                                       "h-2.5 w-2.5 rounded-full",
                                       (m as any).accountStatus === 'NONAKTIF' ? "bg-red-500 animate-pulse" : "bg-green-500 shadow-sm shadow-green-500/50"
                                    )}></div>
                                  </div>
                                </td>
                                <td className="px-10 py-6 text-right">
                                  <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                    <Button onClick={() => openEditMember(m)} variant="outline" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"><Edit2 className="h-4 w-4" /></Button>
                                    <Button onClick={() => handleDeleteMember(m.uid)} variant="outline" size="sm" className="h-10 w-10 p-0 rounded-xl border-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 className="h-4 w-4" /></Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                 {/* MODAL TAMBAH/EDIT KADER */}
                 {showMemberModal && (
                   <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm overflow-y-auto">
                     <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl my-auto animate-in zoom-in duration-200 overflow-hidden">
                        <div className="p-6 border-b border-line flex items-center justify-between bg-surface/30">
                           <h3 className="text-lg font-black text-primary uppercase tracking-tight">
                             {editingMemberUid ? 'Edit Data Kader' : 'Tambah Kader Baru'}
                           </h3>
                           <button onClick={() => { setShowMemberModal(false); setEditingMemberUid(null); }} className="text-muted hover:text-red-500 transition-colors"><X className="h-6 w-6" /></button>
                        </div>
                        
                        <form onSubmit={handleMemberSubmit} className="p-8 space-y-5">
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <label className="text-[10px] font-bold text-muted uppercase">Nama Lengkap</label>
                                 <input required type="text" className="w-full border border-line rounded-lg p-2.5 text-sm outline-none bg-surface/10 focus:bg-white" 
                                   value={memberForm.name} onChange={e => setMemberForm({...memberForm, name: e.target.value})} />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[10px] font-bold text-muted uppercase">NIM / ID</label>
                                 <input required type="text" className="w-full border border-line rounded-lg p-2.5 text-sm outline-none bg-surface/10 focus:bg-white" 
                                   value={memberForm.nim} onChange={e => setMemberForm({...memberForm, nim: e.target.value})} />
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <label className="text-[10px] font-bold text-muted uppercase">Email Utama</label>
                                 <input required type="email" className="w-full border border-line rounded-lg p-2.5 text-sm outline-none bg-surface/10 focus:bg-white" 
                                   value={memberForm.email} onChange={e => setMemberForm({...memberForm, email: e.target.value})} />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[10px] font-bold text-muted uppercase">No. WhatsApp</label>
                                 <input required type="text" placeholder="08..." className="w-full border border-line rounded-lg p-2.5 text-sm outline-none bg-surface/10 focus:bg-white" 
                                   value={memberForm.whatsapp} onChange={e => setMemberForm({...memberForm, whatsapp: e.target.value})} />
                              </div>
                           </div>

                           <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-1">
                                 <label className="text-[10px] font-bold text-muted uppercase">Jenis Kelamin</label>
                                 <select className="w-full border border-line rounded-lg p-2.5 text-sm outline-none bg-surface/10 focus:bg-white" 
                                   value={memberForm.jenisKelamin} onChange={e => setMemberForm({...memberForm, jenisKelamin: e.target.value})}>
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                 </select>
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[10px] font-bold text-muted uppercase">Tempat Lahir</label>
                                 <input required type="text" className="w-full border border-line rounded-lg p-2.5 text-sm outline-none bg-surface/10 focus:bg-white" 
                                   value={memberForm.tempatLahir} onChange={e => setMemberForm({...memberForm, tempatLahir: e.target.value})} />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[10px] font-bold text-muted uppercase">Tanggal Lahir</label>
                                 <input required type="date" className="w-full border border-line rounded-lg p-2.5 text-sm outline-none bg-surface/10 focus:bg-white" 
                                   value={memberForm.tanggalLahir} onChange={e => setMemberForm({...memberForm, tanggalLahir: e.target.value})} />
                              </div>
                           </div>

                           <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted uppercase">Alamat Lengkap</label>
                              <textarea required rows={2} className="w-full border border-line rounded-lg p-2.5 text-sm outline-none bg-surface/10 focus:bg-white resize-none" 
                                value={memberForm.Alamat} onChange={e => setMemberForm({...memberForm, Alamat: e.target.value})} />
                           </div>

                           <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted uppercase">Komisariat / Rayon</label>
                              <input required type="text" className="w-full border border-line rounded-lg p-2.5 text-sm outline-none bg-surface/10 focus:bg-white" 
                                value={memberForm.komisariat} onChange={e => setMemberForm({...memberForm, komisariat: e.target.value})} />
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <label className="text-[10px] font-bold text-muted uppercase">Status Kaderisasi</label>
                                 <select className="w-full border border-line rounded-lg p-2.5 text-sm outline-none bg-surface/10 focus:bg-white" 
                                   value={memberForm.statusKaderisasi} onChange={e => setMemberForm({...memberForm, statusKaderisasi: e.target.value as any})}>
                                    <option value="CALON">CALON</option>
                                    <option value="KADER">KADER</option>
                                 </select>
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[10px] font-bold text-muted uppercase">Akses Sistem (Role)</label>
                                 <select className="w-full border border-line rounded-lg p-2.5 text-sm outline-none bg-surface/10 focus:bg-white" 
                                   value={memberForm.role} onChange={e => setMemberForm({...memberForm, role: e.target.value as any})}>
                                    <option value="CALON">CALON</option>
                                    <option value="KADER">KADER</option>
                                    <option value="PENGURUS">PENGURUS</option>
                                    <option value="KADER EKSTERNAL">KADER EKSTERNAL</option>
                                    <option value="ADMIN">ADMINISTRATOR (SYSTEM)</option>
                                 </select>
                              </div>
                           </div>

                           <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted uppercase">Status Akun</label>
                              <select className="w-full border border-line rounded-lg p-2.5 text-sm outline-none bg-surface/10 focus:bg-white" 
                                value={(memberForm as any).accountStatus} onChange={e => setMemberForm({...memberForm, accountStatus: e.target.value as any})}>
                                 <option value="AKTIF">AKTIF</option>
                                 <option value="NONAKTIF">NONAKTIF</option>
                              </select>
                           </div>

                           <div className="pt-4 flex gap-3">
                              <Button type="button" variant="outline" onClick={() => { setShowMemberModal(false); setEditingMemberUid(null); }} className="flex-1 font-bold">BATAL</Button>
                              <Button type="submit" disabled={loading} className="flex-[2] font-black uppercase tracking-widest"><Save className="h-4 w-4 mr-2" /> SIMPAN DATA</Button>
                           </div>
                        </form>
                     </div>
                   </div>
                 )}
              </div>
            )}

            {/* PERSONAL VIEWS */}
            {activeTab === 'p-overview' && (
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
                    <Button onClick={() => setActiveTab('p-certs')} variant="outline" size="sm" className="text-[10px] font-black">LIHAT SEMUA</Button>
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

            {activeTab === 'p-profile' && (
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
                     onClick={handleUpdateMyProfile}
                     disabled={loading}
                     variant="primary" 
                     className="px-12 py-7 rounded-2xl font-black text-[13px] tracking-widest uppercase shadow-xl shadow-primary/20"
                   >
                     {loading ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
                   </Button>
                </div>
              </div>
            )}

            {activeTab === 'p-content' && (
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
                    <div className="p-12 border-4 border-dashed border-line rounded-3xl flex flex-col items-center justify-center text-center gap-6 bg-surface/50 hover:bg-surface transition-colors cursor-pointer group" onClick={() => !postImage && document.getElementById('p-unified-post-image')?.click()}>
                      {postImage ? (
                        <div className="relative">
                          <img 
                            src={URL.createObjectURL(postImage)} 
                            className="h-56 w-auto rounded-3xl shadow-2xl border-4 border-white" 
                            alt="Preview" 
                          />
                          <button 
                            type="button"
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
                            id="p-unified-post-image" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => { if (e.target.files?.[0]) setPostImage(e.target.files[0]); }}
                          />
                          <Button 
                            type="button"
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
                    onClick={handleSubmitMyPost}
                    className="px-16 py-8 rounded-2xl font-black text-[14px] tracking-widest uppercase shadow-2xl shadow-primary/30"
                  >
                    {loading ? 'MENGIRIM GAGASAN...' : 'PUBLIKASIKAN GAGASAN'}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'p-certs' && (
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

            {activeTab === 'agendas' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                   <div>
                      <h3 className="text-[14px] font-extrabold uppercase">Kelola Agenda Kegiatan</h3>
                      <p className="text-[11px] text-muted">Buat dan kelola pendaftaran untuk MAPABA, PKD, atau kegiatan lainnya.</p>
                   </div>
                   <div className="flex items-center gap-2">
                     <Button onClick={() => downloadExcel(agendas, 'data_agenda.csv')} variant="outline" size="sm" className="text-[11px] font-bold"><Download className="h-4 w-4 mr-2" /> EKSPOR EXCEL</Button>
                     <Button onClick={() => { setEditingAgendaId(null); setShowAgendaModal(true); }} className="text-[12px] font-bold"><Plus className="h-4 w-4 mr-2" /> TAMBAH AGENDA</Button>
                   </div>
                </div>

                <div className="bg-white border border-line rounded-xl overflow-hidden min-h-[300px] flex flex-col">
                   {loading ? (
                     <div className="flex-1 flex flex-col items-center justify-center p-12 text-muted animate-pulse">
                        <Calendar className="h-12 w-12 mb-4 opacity-20" />
                        <p className="text-[13px] font-bold uppercase tracking-widest opacity-50">Memuat Data Agenda...</p>
                     </div>
                   ) : (
                     <div className="divide-y divide-line">
                        {agendas.length === 0 ? (
                          <div className="p-12 text-center text-muted italic text-[13px]">Belum ada agenda yang dibuat.</div>
                        ) : (
                          agendas.map(agd => (
                            <div key={agd.id} className="p-6 flex items-center justify-between hover:bg-surface/50 transition-colors">
                               <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                     <h4 className="text-[14px] font-bold text-ink">{agd.title}</h4>
                                     {new Date(agd.date) > new Date() && <Badge variant="accent" className="text-[8px] py-0">MENDATANG</Badge>}
                                  </div>
                                  <p className="text-[11px] text-muted font-medium">{new Date(agd.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} • {agd.location}</p>
                               </div>
                                <div className="flex items-center gap-2">
                                  <Button onClick={() => openParticipants(agd.id)} variant="outline" size="sm" className="text-[11px] font-bold px-4">LIHAT PESERTA</Button>
                                  <Button onClick={() => openEditAgenda(agd)} variant="outline" size="sm" className="h-9 w-9 p-0 text-muted"><Edit2 className="h-4 w-4" /></Button>
                                  <Button onClick={() => handleDeleteAgenda(agd.id)} variant="outline" size="sm" className="h-9 w-9 p-0 text-red-500 border-red-100 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                               </div>
                            </div>
                          ))
                        )}
                     </div>
                   )}
                </div>

                {/* MODAL TAMBAH AGENDA */}
                {showAgendaModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl my-auto animate-in zoom-in duration-200">
                       <div className="p-6 border-b border-line flex items-center justify-between bg-surface/30">
                          <h3 className="text-lg font-black text-primary uppercase tracking-tight">
                            {editingAgendaId ? 'Perbarui Agenda' : 'Buat Agenda Baru'}
                          </h3>
                          <button onClick={() => { setShowAgendaModal(false); setEditingAgendaId(null); }} className="text-muted hover:text-red-500 transition-colors"><X className="h-6 w-6" /></button>
                       </div>
                       
                       <form onSubmit={handleCreateAgenda} className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
                          <div className="space-y-6">
                             <h4 className="text-[12px] font-black text-primary uppercase border-l-4 border-accent pl-3">Informasi Utama</h4>
                             <div className="space-y-2">
                                <label className="text-[11px] font-bold text-muted uppercase">Judul Kegiatan</label>
                                <input required type="text" placeholder="Misal: MAPABA 2026" className="w-full border border-line rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary/20 outline-none" 
                                  value={agendaForm.title} onChange={e => setAgendaForm({...agendaForm, title: e.target.value})} />
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                  <label className="text-[11px] font-bold text-muted uppercase">Tanggal Mulai</label>
                                  <input required type="date" className="w-full border border-line rounded-lg p-3 text-sm outline-none" 
                                    value={agendaForm.date} onChange={e => setAgendaForm({...agendaForm, date: e.target.value})} />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[11px] font-bold text-muted uppercase">Tanggal Selesai</label>
                                  <input type="date" className="w-full border border-line rounded-lg p-3 text-sm outline-none" 
                                    value={agendaForm.endDate} onChange={e => setAgendaForm({...agendaForm, endDate: e.target.value})} />
                               </div>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[11px] font-bold text-muted uppercase">Jam Kegiatan</label>
                                <input type="time" className="w-full border border-line rounded-lg p-3 text-sm outline-none" 
                                  value={agendaForm.time ? agendaForm.time.replace('.', ':') : ''} onChange={e => setAgendaForm({...agendaForm, time: e.target.value})} />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[11px] font-bold text-muted uppercase">Lokasi</label>
                                <input required type="text" placeholder="Gedung / Alamat..." className="w-full border border-line rounded-lg p-3 text-sm outline-none" 
                                  value={agendaForm.location} onChange={e => setAgendaForm({...agendaForm, location: e.target.value})} />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[11px] font-bold text-muted uppercase">Deskripsi Kegiatan</label>
                                <textarea rows={4} className="w-full border border-line rounded-lg p-3 text-sm outline-none" 
                                  value={agendaForm.content} onChange={e => setAgendaForm({...agendaForm, content: e.target.value})}></textarea>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[11px] font-bold text-muted uppercase">Fasilitas (Pisahkan dengan koma)</label>
                                <input type="text" placeholder="Sertifikat, Konsumsi, Materi..." className="w-full border border-line rounded-lg p-3 text-sm outline-none" 
                                  value={agendaForm.facilities} onChange={e => setAgendaForm({...agendaForm, facilities: e.target.value})} />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[11px] font-bold text-muted uppercase">Persyaratan Kegiatan</label>
                                <textarea rows={2} placeholder="Mahasiswa aktif, Lulus PKD..." className="w-full border border-line rounded-lg p-3 text-sm outline-none" 
                                  value={agendaForm.requirements} onChange={e => setAgendaForm({...agendaForm, requirements: e.target.value})}></textarea>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[11px] font-bold text-muted uppercase">Kontak Person (Panitia:0812, Admin:0813)</label>
                                <input type="text" placeholder="Format Nama:Nomor, dipisah koma" className="w-full border border-line rounded-lg p-3 text-sm outline-none" 
                                  value={agendaForm.contactPerson} onChange={e => setAgendaForm({...agendaForm, contactPerson: e.target.value})} />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[11px] font-bold text-muted uppercase">Logo Kegiatan</label>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="text-[11px]" />
                             </div>
                          </div>

                          <div className="space-y-6">
                             <h4 className="text-[12px] font-black text-primary uppercase border-l-4 border-accent pl-3">Formulir Pendaftaran</h4>
                             <p className="text-[11px] text-muted leading-relaxed">Pilih informasi apa saja yang wajib diisi oleh calon pendaftar di agenda ini.</p>
                             
                             <div className="bg-surface p-4 rounded-xl border border-line space-y-4">
                                <div className="space-y-2">
                                   <p className="text-[10px] font-black text-primary uppercase mb-2">Pilih Informasi (Master Fields)</p>
                                   <div className="grid grid-cols-1 gap-2">
                                      {formFields.map(field => (
                                        <label key={field.id} className="flex items-center gap-3 p-2 bg-white rounded border border-line cursor-pointer hover:bg-white/80 transition-colors">
                                           <input 
                                              type="checkbox" 
                                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                                              checked={!!agendaForm.customFields.find(f => f.id === field.id)}
                                              onChange={() => toggleFieldSelection(field)}
                                            />
                                           <div className="flex-1">
                                              <p className="text-[12px] font-bold text-ink leading-tight">{field.label}</p>
                                              <p className="text-[9px] text-muted uppercase tracking-tighter">{field.type}</p>
                                           </div>
                                        </label>
                                      ))}
                                   </div>
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => setShowFieldModal(true)}
                                  className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-primary/20 rounded-lg text-primary text-[11px] font-black uppercase hover:bg-primary/5 transition-colors"
                                >
                                   <PlusCircle className="h-4 w-4" /> TAMBAH MASTER FIELD BARU
                                </button>
                             </div>

                             <div className="space-y-4 pt-4">
                                <h4 className="text-[10px] font-black text-primary uppercase border-b border-line pb-1">Pratinjau Form</h4>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                   <div className="p-3 bg-gray-50 rounded italic text-[11px] text-muted">Data otomatis: Nama, NIM, No. WhatsApp</div>
                                   {agendaForm.customFields.map(field => (
                                      <div key={field.id} className="p-3 bg-primary/5 rounded border border-primary/10 flex items-center justify-between">
                                         <span className="text-[12px] font-bold">{field.label}</span>
                                         <span className="text-[9px] font-bold uppercase py-0.5 px-2 bg-white rounded">{field.type}</span>
                                      </div>
                                   ))}
                                </div>
                             </div>
                          </div>

                          <div className="lg:col-span-2 pt-6 border-t border-line flex gap-4">
                             <Button type="button" variant="outline" onClick={() => setShowAgendaModal(false)} className="flex-1 py-4 font-black uppercase tracking-widest">Batal</Button>
                             <Button type="submit" disabled={loading} className="flex-[2] py-4 font-black uppercase tracking-widest shadow-xl"><Save className="h-4 w-4 mr-2" /> TERBITKAN AGENDA</Button>
                          </div>
                       </form>
                    </div>
                  </div>
                )}

                {/* MODAL TAMBAH MASTER FIELD */}
                {showFieldModal && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-primary/60 backdrop-blur-md">
                     <div className="bg-white rounded-xl w-full max-w-sm p-8 shadow-2xl space-y-6">
                        <div className="flex items-center justify-between">
                           <h4 className="text-sm font-black text-primary uppercase tracking-wider">Tambah Master Field</h4>
                           <button onClick={() => setShowFieldModal(false)}><X className="h-5 w-5 text-muted" /></button>
                        </div>
                        <div className="space-y-4">
                           <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted uppercase">Label Field</label>
                              <input type="text" placeholder="Misal: Ukuran Baju" className="w-full border border-line rounded p-2 text-sm outline-none" 
                                value={newField.label} onChange={e => setNewField({...newField, label: e.target.value})} />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted uppercase">Tipe Data</label>
                              <select className="w-full border border-line rounded p-2 text-sm outline-none" 
                                value={newField.type} onChange={e => setNewField({...newField, type: e.target.value})}>
                                 <option value="text">Teks Pendek</option>
                                 <option value="number">Angka</option>
                                 <option value="date">Tanggal</option>
                                 <option value="select">Pilihan (Dropdown)</option>
                                 <option value="file">Upload File (PDF/Image)</option>
                              </select>
                           </div>
                           {newField.type === 'select' && (
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted uppercase">Opsi (Pisahkan dengan koma)</label>
                                <input type="text" placeholder="S, M, L, XL" className="w-full border border-line rounded p-2 text-sm outline-none" 
                                  value={newField.options} onChange={e => setNewField({...newField, options: e.target.value})} />
                             </div>
                           )}
                           <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted uppercase">Sifat Isian</label>
                              <select className="w-full border border-line rounded p-2 text-sm outline-none" 
                                value={newField.isRequired ? "true" : "false"} onChange={e => setNewField({...newField, isRequired: e.target.value === 'true'})}>
                                 <option value="true">Wajib Diisi (Required)</option>
                                 <option value="false">Opsional (Optional)</option>
                              </select>
                           </div>
                        </div>
                        <Button onClick={handleAddNewMasterField} disabled={loading} className="w-full py-3 font-black text-[12px] uppercase">SIMPAN KE MASTER</Button>
                     </div>
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      </div>

        {/* MODAL LIHAT PESERTA */}
        {viewingParticipantsAgendaId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl my-auto animate-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[85vh]">
               <div className="p-6 border-b border-line flex items-center justify-between bg-surface/30">
                  <div>
                     <h3 className="text-lg font-black text-primary uppercase tracking-tight">Daftar Peserta</h3>
                     <p className="text-[11px] text-muted font-bold uppercase">{agendas.find(a => a.id === viewingParticipantsAgendaId)?.title}</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <Button onClick={() => downloadExcel(participations.filter(p => p.agendaId === viewingParticipantsAgendaId), 'agenda_peserta.csv')} variant="outline" size="sm" className="font-bold text-[11px]"><Download className="h-4 w-4 mr-2" /> EKSPOR PESERTA</Button>
                     <button onClick={() => setViewingParticipantsAgendaId(null)} className="text-muted hover:text-red-500 transition-colors"><X className="h-6 w-6" /></button>
                  </div>
               </div>
               
               <div className="flex-1 overflow-auto">
                  {loading ? (
                    <div className="p-20 text-center animate-pulse">
                      <p className="text-[12px] font-black text-muted uppercase tracking-widest">Memuat Peserta...</p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-surface border-b border-line sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-3 text-[10px] font-black text-muted uppercase tracking-wider">Nama Peserta</th>
                          <th className="px-6 py-3 text-[10px] font-black text-muted uppercase tracking-wider">WhatsApp</th>
                          <th className="px-6 py-3 text-[10px] font-black text-muted uppercase tracking-wider">Waktu Daftar</th>
                          <th className="px-6 py-3 text-[10px] font-black text-muted uppercase tracking-wider text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {participations.filter(p => p.agendaId === viewingParticipantsAgendaId).length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-muted italic text-[13px]">Belum ada kader yang mendaftar.</td>
                          </tr>
                        ) : (
                          participations.filter(p => p.agendaId === viewingParticipantsAgendaId).map(p => {
                            const member = members.find(m => m.uid === p.memberId);
                            return (
                              <tr key={p.id} className="hover:bg-surface/50 transition-colors">
                                 <td className="px-6 py-4">
                                   <p className="text-[13px] font-bold text-ink">{member?.name || 'Kader'}</p>
                                   <p className="text-[10px] text-muted">{member?.nim || 'NIM Tidak Ada'}</p>
                                 </td>
                                 <td className="px-6 py-4">
                                   <span className="text-[12px] font-medium text-muted">{member?.whatsapp || '-'}</span>
                                 </td>
                                 <td className="px-6 py-4">
                                   <span className="text-[12px] font-medium text-muted">{new Date(p.registeredAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                   <Badge variant={p.status === 'Attended' ? 'primary' : 'outline'} className="text-[9px] uppercase tracking-tighter">{p.status}</Badge>
                                 </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  )}
               </div>
            </div>
          </div>
        )}
      </div>
  );
}

function StatBox({ title, val, highlight = false }: { title: string, val: string, highlight?: boolean }) {
    return (
        <div className={cn("bg-white border border-line p-5 rounded-xl", highlight && "border-primary")}>
            <p className="text-[11px] font-bold text-muted uppercase">{title}</p>
            <h2 className={cn("text-3xl font-extrabold mt-1", highlight ? "text-primary" : "text-ink")}>{val}</h2>
        </div>
    )
}

function ActivityItem({ action, time }: { action: string, time: string }) {
    return (
        <div className="flex items-center justify-between border-b border-line pb-3 last:border-0 last:pb-0">
            <div className="flex items-center gap-3">
                <CheckSquare className="h-4 w-4 text-green-500" />
                <span className="text-[13px] font-medium">{action}</span>
            </div>
            <span className="text-[11px] text-muted italic">{time}</span>
        </div>
    )
}
