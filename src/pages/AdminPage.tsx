import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { authService } from '../services/auth';
import { LayoutDashboard, Package, PlusCircle, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

const AdminPage = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const isCenterAdmin = currentUser?.role === 'CENTER_ADMIN';
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState<'needs' | 'center' | 'announcements' | 'moderation'>('needs');
  const [centers, setCenters] = useState<any[]>([]);
  const [needs, setNeeds] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [citizenSubmissions, setCitizenSubmissions] = useState<any[]>([]);
  const [reportsMissing, setReportsMissing] = useState<any[]>([]);
  const [reportsFound, setReportsFound] = useState<any[]>([]);
  const [center, setCenter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNeedForm, setShowNeedForm] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showCenterForm, setShowCenterForm] = useState(false);
  const [needForm, setNeedForm] = useState({ categoryId: '', quantityNeeded: '', priority: 'NORMAL' });
  const [centerForm, setCenterForm] = useState({
    name: '',
    address: '',
    city: '',
    responsiblePerson: '',
    phone: '',
    schedule: '',
    status: 'ACTIVE',
  });
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    body: '',
    category: 'HOSPITAL',
    imageUrl: '',
    location: '',
    contact: '',
    publishedBy: 'ADMIN',
    verificationStatus: 'VERIFIED',
  });
  const [donationForm, setDonationForm] = useState({
    title: '',
    bankName: '',
    accountType: 'Cuenta corriente',
    accountNumber: '',
    phone: '',
    email: '',
    instructions: '',
    linkUrl: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const centersData = await api.centers.list() as any[];
      const currentUser = authService.getCurrentUser();
      const userCenters = currentUser?.role === 'CENTER_ADMIN'
        ? centersData.filter((centerItem) => centerItem.createdByUserId === currentUser.id)
        : centersData;

      const activeCenter = userCenters[0] ?? null;
      setCenters(centersData);
      setCenter(activeCenter);

      const [needsData, announcementData, missingReportsData, foundReportsData, citizenSubmissionsData] = await Promise.all([
        api.donations.listNeeds() as Promise<any[]>,
        api.announcements.list() as Promise<any[]>,
        api.reports.listMissing() as Promise<any[]>,
        api.reports.listFound() as Promise<any[]>,
        api.announcements.listCitizenSubmissions() as Promise<any[]>,
      ]);

      const visibleNeeds = currentUser?.role === 'CENTER_ADMIN'
        ? needsData.filter((n: any) => n.centerId === activeCenter?.id)
        : needsData;

      setNeeds(visibleNeeds);
      setAnnouncements(Array.isArray(announcementData) ? announcementData : []);
      setReportsMissing(Array.isArray(missingReportsData) ? missingReportsData : []);
      setReportsFound(Array.isArray(foundReportsData) ? foundReportsData : []);
      setCitizenSubmissions(Array.isArray(citizenSubmissionsData) ? citizenSubmissionsData : []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCenterEditor = () => {
    if (!center) {
      alert('No hay un centro asociado para editar.');
      return;
    }

    setCenterForm({
      name: center.name ?? '',
      address: center.address ?? '',
      city: center.city ?? '',
      responsiblePerson: center.responsiblePerson ?? '',
      phone: center.phone ?? '',
      schedule: center.schedule ?? '',
      status: center.status ?? 'ACTIVE',
    });
    setShowCenterForm(true);
  };

  const handleUpdateCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!center?.id) {
      alert('No hay un centro disponible para actualizar.');
      return;
    }

    try {
      const updatedCenter = await api.centers.update(center.id, {
        ...centerForm,
        donationInfo: Array.isArray(center.donationInfo) ? center.donationInfo : [],
      });
      setCenter(updatedCenter);
      setShowCenterForm(false);
      await loadData();
      alert('Información del centro actualizada correctamente.');
    } catch (err: any) {
      alert(err.message || 'No se pudo actualizar la información del centro');
    }
  };

  const handleDeleteCenter = async () => {
    if (!center?.id) {
      alert('No hay un centro disponible para eliminar.');
      return;
    }

    const confirmed = window.confirm('¿Seguro que deseas eliminar este centro y toda su información asociada?');
    if (!confirmed) return;

    try {
      await api.centers.delete(center.id);
      alert('Centro eliminado correctamente.');
      navigate('/centers');
    } catch (err: any) {
      alert(err.message || 'No se pudo eliminar el centro');
    }
  };

  const handleAddNeed = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.donations.createNeed({
        ...needForm,
        centerId: center?.id,
        quantityNeeded: Number(needForm.quantityNeeded),
        quantityReceived: 0,
      });
      setShowNeedForm(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.announcements.create({
        ...announcementForm,
        verificationStatus: announcementForm.verificationStatus || 'VERIFIED',
      });
      setShowAnnouncementForm(false);
      setAnnouncementForm({
        title: '',
        body: '',
        category: 'HOSPITAL',
        imageUrl: '',
        location: '',
        contact: '',
        publishedBy: 'ADMIN',
        verificationStatus: 'VERIFIED',
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'No se pudo publicar el anuncio');
    }
  };

  const handleVerifyCitizenSubmission = async (id: string, status: string) => {
    try {
      await api.announcements.verifyCitizen(id, status);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'No se pudo actualizar la verificación');
    }
  };

  const handleVerifyReport = async (id: string, status: string) => {
    try {
      await api.reports.verify(id, status);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'No se pudo actualizar el reporte');
    }
  };

  const handleAddDonationCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!center?.id) {
      alert('No hay un centro activo seleccionado.');
      return;
    }

    try {
      const nextCards = [
        ...(Array.isArray(center?.donationInfo) ? center.donationInfo : []),
        {
          ...donationForm,
          id: `${Date.now()}`,
          qrUrl: donationForm.linkUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(donationForm.linkUrl)}` : '',
        }
      ];

      await api.donations.saveDonationInfo(center.id, nextCards);
      setShowDonationForm(false);
      setDonationForm({
        title: '',
        bankName: '',
        accountType: 'Cuenta corriente',
        accountNumber: '',
        phone: '',
        email: '',
        instructions: '',
        linkUrl: '',
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'No se pudo guardar la tarjeta de donación');
    }
  };

  const handleDeleteDonationCard = async (cardIndex: number) => {
    if (!center?.id) {
      alert('No hay un centro activo seleccionado.');
      return;
    }

    try {
      await api.donations.deleteDonationInfo(center.id, cardIndex);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'No se pudo eliminar la tarjeta');
    }
  };

  if (loading) return <div className="text-center py-12">Cargando panel de gestión...</div>;

  const stats = [
    { label: 'Centros activos', value: centers.filter((centerItem) => centerItem.status === 'ACTIVE').length, tone: 'blue' },
    { label: 'Personas desaparecidas', value: reportsMissing.length, tone: 'rose' },
    { label: 'Personas encontradas', value: reportsFound.length, tone: 'emerald' },
    { label: 'Solicitudes de ayuda', value: needs.length, tone: 'amber' },
    { label: 'Necesidades críticas', value: needs.filter((need) => need.priority === 'CRITICAL').length, tone: 'red' },
    { label: 'Donaciones registradas', value: centers.reduce((sum, item) => sum + (Array.isArray(item.donationInfo) ? item.donationInfo.length : 0), 0), tone: 'violet' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className={`mb-8 rounded-3xl border p-6 text-white shadow-lg ${isCenterAdmin ? 'border-emerald-200 bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-700' : 'border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700'}`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
              <LayoutDashboard className="text-white" size={28} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">{isCenterAdmin ? 'Centro de acopio' : 'Dashboard'}</p>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">{isCenterAdmin ? 'Mi panel del centro' : 'Panel de gestión operativa'}</h2>
            </div>
          </div>
          <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ${isCenterAdmin ? 'bg-emerald-200/20 text-emerald-50 ring-emerald-200/30' : 'bg-emerald-500/20 text-emerald-200 ring-emerald-400/30'}`}>
            {isCenterAdmin ? 'Centro admin' : 'Modo activo'}
          </span>
        </div>
      </div>

      {!isSuperAdmin && isCenterAdmin ? (
        <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          {center ? (
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Centro asociado</p>
                <h3 className="text-xl font-bold text-emerald-900">{center.name}</h3>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-emerald-700">{center.city}</div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Centro aún no registrado</p>
                <h3 className="text-xl font-bold text-emerald-900">Registra tu centro para publicar información y necesidades</h3>
              </div>
              <button
                type="button"
                onClick={() => navigate('/centers')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <PlusCircle size={18} />
                Registrar centro
              </button>
            </div>
          )}
        </div>
      ) : null}

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className={`mb-3 inline-flex rounded-xl px-2 py-1 text-xs font-bold uppercase tracking-wide ${
              stat.tone === 'blue' ? 'bg-blue-100 text-blue-700' :
              stat.tone === 'rose' ? 'bg-rose-100 text-rose-700' :
              stat.tone === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
              stat.tone === 'amber' ? 'bg-amber-100 text-amber-700' :
              stat.tone === 'red' ? 'bg-red-100 text-red-700' : 'bg-violet-100 text-violet-700'
            }`}>{stat.label}</div>
            <p className="text-3xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-8 border-b overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('needs')}
          className={`whitespace-nowrap rounded-t-xl px-4 py-2 font-semibold transition ${activeTab === 'needs' ? 'border-b-2 border-blue-600 bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
        >
          {isCenterAdmin ? 'Mis necesidades' : 'Gestión de Necesidades'}
        </button>
        <button
          onClick={() => setActiveTab('center')}
          className={`whitespace-nowrap rounded-t-xl px-4 py-2 font-semibold transition ${activeTab === 'center' ? 'border-b-2 border-blue-600 bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
        >
          {isCenterAdmin ? 'Mi centro' : 'Información del Centro'}
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`whitespace-nowrap rounded-t-xl px-4 py-2 font-semibold transition ${activeTab === 'announcements' ? 'border-b-2 border-blue-600 bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
        >
          {isCenterAdmin ? 'Anuncios' : 'Tablero de anuncios'}
        </button>
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('moderation')}
            className={`whitespace-nowrap rounded-t-xl px-4 py-2 font-semibold transition ${activeTab === 'moderation' ? 'border-b-2 border-blue-600 bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Moderación y estadísticas
          </button>
        )}
      </div>

      {activeTab === 'needs' ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-bold text-slate-800">Recursos Necesarios</h3>
            <button
              onClick={() => setShowNeedForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              <PlusCircle size={18} />
              Añadir Necesidad
            </button>
          </div>

          {showNeedForm && (
            <div className="bg-white p-6 rounded-2xl border shadow-sm mb-6">
              <form onSubmit={handleAddNeed} className="grid gap-4 md:grid-cols-4 items-end">
                <div>
                  <label className="block text-sm font-medium mb-1">Recurso (Ej: Palas, Cascos)</label>
                  <input required className="w-full p-2 border rounded" value={needForm.categoryId} onChange={e => setNeedForm({...needForm, categoryId: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cantidad</label>
                  <input required type="number" className="w-full p-2 border rounded" value={needForm.quantityNeeded} onChange={e => setNeedForm({...needForm, quantityNeeded: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prioridad</label>
                  <select className="w-full p-2 border rounded" value={needForm.priority} onChange={e => setNeedForm({...needForm, priority: e.target.value})}>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">Alta</option>
                    <option value="CRITICAL">Crítica</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowNeedForm(false)} className="px-4 py-2 text-slate-600 font-medium">Cancelar</button>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700">Guardar</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid gap-4">
            {needs.map(need => (
              <div key={need.id} className="bg-white p-4 rounded-xl border shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900">{need.categoryId}</p>
                  <p className="text-sm text-slate-500">Necesario: {need.quantityNeeded} | Recibido: {need.quantityReceived}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    need.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                    need.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {need.priority}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Marcar como Cubierto">
                    <CheckCircle size={20} />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Eliminar">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
            {needs.length === 0 && <p className="text-center py-12 text-slate-500">No hay necesidades registradas actualmente.</p>}
          </div>
        </div>
      ) : activeTab === 'moderation' ? (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className={`mb-3 inline-flex rounded-xl px-2 py-1 text-xs font-bold uppercase tracking-wide ${
                  stat.tone === 'blue' ? 'bg-blue-100 text-blue-700' :
                  stat.tone === 'rose' ? 'bg-rose-100 text-rose-700' :
                  stat.tone === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                  stat.tone === 'amber' ? 'bg-amber-100 text-amber-700' :
                  stat.tone === 'red' ? 'bg-red-100 text-red-700' : 'bg-violet-100 text-violet-700'
                }`}>{stat.label}</div>
                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-xl font-bold text-slate-800">Verificación de información ciudadana</h3>
            {citizenSubmissions.length === 0 ? (
              <p className="text-slate-500">No hay información pendiente por revisar.</p>
            ) : (
              <div className="space-y-4">
                {citizenSubmissions.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-lg font-bold text-slate-900">{item.title}</p>
                        <p className="text-sm text-slate-600">{item.location}</p>
                      </div>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                        item.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' :
                        item.verificationStatus === 'UNVERIFIED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.verificationStatus}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.details}</p>
                    {item.evidenceUrl && (
                      <a href={item.evidenceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-medium text-blue-600 underline">
                        Ver evidencia
                      </a>
                    )}
                    <div className="mt-4 flex gap-2">
                      <button type="button" onClick={() => handleVerifyCitizenSubmission(item.id, 'VERIFIED')} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700">Verificado</button>
                      <button type="button" onClick={() => handleVerifyCitizenSubmission(item.id, 'UNVERIFIED')} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700">No verificado</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-xl font-bold text-slate-800">Moderación de reportes</h3>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h4 className="mb-3 text-lg font-semibold text-slate-700">Personas desaparecidas</h4>
                {reportsMissing.length === 0 ? <p className="text-slate-500">Sin reportes.</p> : (
                  <div className="space-y-3">
                    {reportsMissing.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="font-bold text-slate-900">{item.name} · {item.city}</p>
                        <p className="text-sm text-slate-600">{item.lastSeenLocation}</p>
                        <p className="mt-2 text-xs text-slate-500">{item.verificationStatus}</p>
                        <div className="mt-3 flex gap-2">
                          <button type="button" onClick={() => handleVerifyReport(item.id, 'VERIFIED')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">Verificar</button>
                          <button type="button" onClick={() => handleVerifyReport(item.id, 'UNVERIFIED')} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700">Rechazar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h4 className="mb-3 text-lg font-semibold text-slate-700">Personas encontradas</h4>
                {reportsFound.length === 0 ? <p className="text-slate-500">Sin reportes.</p> : (
                  <div className="space-y-3">
                    {reportsFound.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="font-bold text-slate-900">{item.name || 'Persona encontrada'} · {item.city}</p>
                        <p className="text-sm text-slate-600">{item.lastSeenLocation}</p>
                        <p className="mt-2 text-xs text-slate-500">{item.verificationStatus}</p>
                        <div className="mt-3 flex gap-2">
                          <button type="button" onClick={() => handleVerifyReport(item.id, 'VERIFIED')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">Verificar</button>
                          <button type="button" onClick={() => handleVerifyReport(item.id, 'UNVERIFIED')} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700">Rechazar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      ) : activeTab === 'announcements' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800">Tablero de anuncios</h3>
            <button
              type="button"
              onClick={() => setShowAnnouncementForm(true)}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700"
            >
              + Nuevo anuncio
            </button>
          </div>

          {showAnnouncementForm && (
            <form onSubmit={handleAddAnnouncement} className="grid gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 md:grid-cols-2">
              <input required className="rounded-lg border border-slate-200 bg-white p-2" placeholder="Título del anuncio" value={announcementForm.title} onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })} />
              <select className="rounded-lg border border-slate-200 bg-white p-2" value={announcementForm.category} onChange={e => setAnnouncementForm({ ...announcementForm, category: e.target.value })}>
                <option value="HOSPITAL">Hospital</option>
                <option value="HELP_POINT">Centro de ayuda</option>
                <option value="CALL_TO_ACTION">Convocatoria</option>
                <option value="OTHER">Otro</option>
              </select>
              <input className="rounded-lg border border-slate-200 bg-white p-2 md:col-span-2" placeholder="Ubicación o ciudad" value={announcementForm.location} onChange={e => setAnnouncementForm({ ...announcementForm, location: e.target.value })} />
              <textarea required rows={4} className="rounded-lg border border-slate-200 bg-white p-2 md:col-span-2" placeholder="Texto del anuncio" value={announcementForm.body} onChange={e => setAnnouncementForm({ ...announcementForm, body: e.target.value })} />
              <input className="rounded-lg border border-slate-200 bg-white p-2" placeholder="Contacto (teléfono o correo)" value={announcementForm.contact} onChange={e => setAnnouncementForm({ ...announcementForm, contact: e.target.value })} />
              <input className="rounded-lg border border-slate-200 bg-white p-2" placeholder="URL de imagen (opcional)" value={announcementForm.imageUrl} onChange={e => setAnnouncementForm({ ...announcementForm, imageUrl: e.target.value })} />
              <div className="md:col-span-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAnnouncementForm(false)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700">Cancelar</button>
                <button type="submit" className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-bold text-white hover:bg-amber-700">Publicar anuncio</button>
              </div>
            </form>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            {announcements.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 lg:col-span-2">
                No hay anuncios publicados todavía.
              </div>
            ) : (
              announcements.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="h-40 w-full object-cover" />
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-slate-100 text-slate-500">Sin imagen</div>
                  )}
                  <div className="space-y-3 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">{item.category}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{item.verificationStatus}</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">{item.title}</h4>
                    <p className="text-sm leading-6 text-slate-600">{item.body}</p>
                    {item.location && <p className="text-sm text-slate-600">Ubicación: {item.location}</p>}
                    {item.contact && <p className="text-sm text-slate-600">Contacto: {item.contact}</p>}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border shadow-sm max-w-2xl">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h3 className="text-xl font-bold">Información del Centro</h3>
            {center && (
              <button
                type="button"
                onClick={openCenterEditor}
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100"
              >
                Actualizar información
              </button>
            )}
          </div>

          {showCenterForm && center && (
            <form onSubmit={handleUpdateCenter} className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Nombre del centro</label>
                <input required className="w-full rounded-lg border border-slate-200 bg-white p-2.5" value={centerForm.name} onChange={e => setCenterForm({ ...centerForm, name: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Dirección</label>
                <input required className="w-full rounded-lg border border-slate-200 bg-white p-2.5" value={centerForm.address} onChange={e => setCenterForm({ ...centerForm, address: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Ciudad</label>
                <input required className="w-full rounded-lg border border-slate-200 bg-white p-2.5" value={centerForm.city} onChange={e => setCenterForm({ ...centerForm, city: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Estado</label>
                <select className="w-full rounded-lg border border-slate-200 bg-white p-2.5" value={centerForm.status} onChange={e => setCenterForm({ ...centerForm, status: e.target.value })}>
                  <option value="ACTIVE">Activo</option>
                  <option value="NO_RESOURCES">Sin recursos</option>
                  <option value="TEMPORARILY_CLOSED">Cerrado temporalmente</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Responsable</label>
                <input required className="w-full rounded-lg border border-slate-200 bg-white p-2.5" value={centerForm.responsiblePerson} onChange={e => setCenterForm({ ...centerForm, responsiblePerson: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Teléfono</label>
                <input required className="w-full rounded-lg border border-slate-200 bg-white p-2.5" value={centerForm.phone} onChange={e => setCenterForm({ ...centerForm, phone: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Horario</label>
                <input required className="w-full rounded-lg border border-slate-200 bg-white p-2.5" value={centerForm.schedule} onChange={e => setCenterForm({ ...centerForm, schedule: e.target.value })} />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowCenterForm(false)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700">Cancelar</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700">Guardar cambios</button>
              </div>
            </form>
          )}

          {!showCenterForm && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500">Nombre</label>
                  <p className="font-bold text-slate-900">{center?.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500">Estado</label>
                  <p className="font-bold text-slate-900">{center?.status}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500">Dirección</label>
                <p className="font-bold text-slate-900">{center?.address}, {center?.city}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500">Responsable</label>
                <p className="font-bold text-slate-900">{center?.responsiblePerson}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500">Teléfono</label>
                <p className="font-bold text-slate-900">{center?.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500">Horario</label>
                <p className="font-bold text-slate-900">{center?.schedule}</p>
              </div>
            </div>
          )}

          <div className="pt-4 border-t mt-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="text-lg font-bold text-slate-900">Tarjetas de donación</h4>
              <button
                type="button"
                onClick={() => setShowDonationForm(true)}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700"
              >
                + Nueva tarjeta
              </button>
            </div>

            {showDonationForm && (
              <form onSubmit={handleAddDonationCard} className="mb-4 grid gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 md:grid-cols-2">
                <input required className="rounded-lg border border-slate-200 bg-white p-2" placeholder="Título" value={donationForm.title} onChange={e => setDonationForm({ ...donationForm, title: e.target.value })} />
                <input required className="rounded-lg border border-slate-200 bg-white p-2" placeholder="Banco / entidad" value={donationForm.bankName} onChange={e => setDonationForm({ ...donationForm, bankName: e.target.value })} />
                <input required className="rounded-lg border border-slate-200 bg-white p-2" placeholder="Tipo de cuenta" value={donationForm.accountType} onChange={e => setDonationForm({ ...donationForm, accountType: e.target.value })} />
                <input required className="rounded-lg border border-slate-200 bg-white p-2" placeholder="Número de cuenta / referencia" value={donationForm.accountNumber} onChange={e => setDonationForm({ ...donationForm, accountNumber: e.target.value })} />
                <input className="rounded-lg border border-slate-200 bg-white p-2" placeholder="Teléfono de contacto" value={donationForm.phone} onChange={e => setDonationForm({ ...donationForm, phone: e.target.value })} />
                <input className="rounded-lg border border-slate-200 bg-white p-2" placeholder="Correo de donación" type="email" value={donationForm.email} onChange={e => setDonationForm({ ...donationForm, email: e.target.value })} />
                <input className="rounded-lg border border-slate-200 bg-white p-2 md:col-span-2" placeholder="Enlace de donación (pago, Nequi, Daviplata, transferencia, etc.)" value={donationForm.linkUrl} onChange={e => setDonationForm({ ...donationForm, linkUrl: e.target.value })} />
                <textarea required rows={3} className="rounded-lg border border-slate-200 bg-white p-2 md:col-span-2" placeholder="Instrucciones para donar" value={donationForm.instructions} onChange={e => setDonationForm({ ...donationForm, instructions: e.target.value })} />
                <div className="md:col-span-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowDonationForm(false)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700">Cancelar</button>
                  <button type="submit" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700">Guardar tarjeta</button>
                </div>
              </form>
            )}

            {Array.isArray(center?.donationInfo) && center.donationInfo.length > 0 ? (
              <div className="space-y-3">
                {center.donationInfo.map((card: any, index: number) => (
                  <div key={`${card.accountNumber || index}-${index}`} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{card.title}</p>
                        <p className="text-sm text-slate-700">{card.bankName} · {card.accountType}</p>
                        <p className="font-mono text-xs text-slate-600">{card.accountNumber}</p>
                        {card.phone && <p className="text-xs text-slate-600">Tel.: {card.phone}</p>}
                        {card.email && <p className="text-xs text-slate-600">Email: {card.email}</p>}
                        {card.linkUrl && (
                          <a href={card.linkUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold text-blue-700 underline">
                            Ir al enlace de donación
                          </a>
                        )}
                        {card.qrUrl && (
                          <div className="mt-3 rounded-xl border border-white bg-white p-2">
                            <img src={card.qrUrl} alt={`QR de ${card.title}`} className="h-24 w-24 rounded-md object-cover" />
                          </div>
                        )}
                        <p className="mt-2 text-xs text-slate-500">{card.instructions}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteDonationCard(index)}
                        className="rounded-lg bg-red-600 px-2 py-1 text-xs font-bold text-white hover:bg-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No hay tarjetas de donación registradas.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
