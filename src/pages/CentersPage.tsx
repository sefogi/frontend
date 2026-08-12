import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { authService } from '../services/auth';
import { getCityFilterOptions } from '../data/cityOptions';
import { Home, MapPin, Phone, Clock, PlusCircle, Pencil, ShieldCheck } from 'lucide-react';

type CenterForm = {
  name: string;
  address: string;
  city: string;
  responsiblePerson: string;
  phone: string;
  schedule: string;
  status: string;
  donationInfo: Array<{ title: string; bankName: string; accountType: string; accountNumber: string; phone?: string; email?: string; instructions: string; linkUrl?: string; qrUrl?: string; }>;
};

const emptyForm: CenterForm = {
  name: '',
  address: '',
  city: '',
  responsiblePerson: '',
  phone: '',
  schedule: '',
  status: 'ACTIVE',
  donationInfo: [],
};

const CentersPage = () => {
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState('ALL');
  const [formData, setFormData] = useState<CenterForm>(emptyForm);
  const user = authService.getCurrentUser();
  const canManageCenters = !!user && (user.role === 'CENTER_ADMIN' || user.role === 'SUPER_ADMIN');

  const cityOptions = useMemo(() => getCityFilterOptions(centers), [centers]);

  const filteredCenters = cityFilter === 'ALL'
    ? centers
    : centers.filter((center) => center.city === cityFilter);

  const loadCenters = async () => {
    try {
      const data = await api.centers.list() as any[];
      setCenters(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCenters();
  }, []);

  const openCreateForm = () => {
    if (!canManageCenters) {
      alert('Debes iniciar sesión como centro de acopio para registrar información.');
      return;
    }
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (center: any) => {
    if (!canManageCenters) {
      alert('Debes iniciar sesión para editar la información del centro.');
      return;
    }
    setEditingId(center.id);
    setFormData({
      name: center.name ?? '',
      address: center.address ?? '',
      city: center.city ?? '',
      responsiblePerson: center.responsiblePerson ?? '',
      phone: center.phone ?? '',
      schedule: center.schedule ?? '',
      status: center.status ?? 'ACTIVE',
      donationInfo: Array.isArray(center.donationInfo) ? center.donationInfo : [],
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        latitude: 0,
        longitude: 0,
        donationInfo: Array.isArray(formData.donationInfo) ? formData.donationInfo : [],
      };

      if (editingId) {
        await api.centers.update(editingId, payload);
        alert('Centro actualizado exitosamente');
      } else {
        await api.centers.create(payload);
        alert('Centro registrado exitosamente. Se ha enviado un correo electrónico con las credenciales de acceso al panel de gestión.');
      }

      setShowForm(false);
      setEditingId(null);
      setFormData(emptyForm);
      await loadCenters();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteDonationCard = async (centerId: string, cardIndex: number) => {
    try {
      await api.donations.deleteDonationInfo(centerId, cardIndex);
      await loadCenters();
    } catch (err: any) {
      alert(err.message || 'No se pudo eliminar la tarjeta de donación');
    }
  };

  const handleDeleteCenter = async (centerId: string) => {
    const confirmed = window.confirm('¿Seguro que deseas eliminar este centro y toda su información asociada?');
    if (!confirmed) return;

    try {
      await api.centers.delete(centerId);
      alert('Centro eliminado correctamente.');
      await loadCenters();
    } catch (err: any) {
      alert(err.message || 'No se pudo eliminar el centro');
    }
  };

  if (loading) return <div className="text-center py-12">Cargando centros...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <section className="mb-8 overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-r from-blue-50 via-white to-sky-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Centros de apoyo</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Centros de Acopio</h2>
            <p className="mt-2 text-slate-600">Directorio público de centros activos para ayuda humanitaria.</p>
          </div>
          {canManageCenters ? (
            <button
              onClick={openCreateForm}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition shadow-sm"
            >
              <PlusCircle size={20} />
              Registrar Centro
            </button>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Inicia sesión como centro de acopio para publicar información.
            </div>
          )}
        </div>
      </section>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <MapPin size={16} className="text-slate-500" />
          Filtrar por ciudad
        </div>
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="ALL">Todas las ciudades</option>
          {cityOptions.map((group) => (
            <optgroup key={group.department} label={group.department}>
              {group.cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">{editingId ? 'Editar Centro' : 'Registrar Centro de Acopio'}</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-500">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Centro</label>
                <input required className="w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ciudad</label>
                  <select required className="w-full p-2 border rounded" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })}>
                    <option value="">Seleccione una ciudad</option>
                    {cityOptions.map((group) => (
                      <optgroup key={group.department} label={group.department}>
                        {group.cities.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dirección</label>
                  <input required className="w-full p-2 border rounded" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Persona Responsable</label>
                <input required className="w-full p-2 border rounded" value={formData.responsiblePerson} onChange={e => setFormData({ ...formData, responsiblePerson: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input required className="w-full p-2 border rounded" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Horario</label>
                <input required className="w-full p-2 border rounded" placeholder="Ej: 8am - 8pm" value={formData.schedule} onChange={e => setFormData({ ...formData, schedule: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <select className="w-full p-2 border rounded" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                  <option value="ACTIVE">Activo</option>
                  <option value="NO_RESOURCES">Sin recursos</option>
                  <option value="TEMPORARILY_CLOSED">Cerrado temporalmente</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 font-medium">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
                  {editingId ? 'Guardar Cambios' : 'Guardar Centro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCenters.map(center => (
          <div key={center.id} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-full text-blue-500">
                <Home size={24} />
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-bold ${center.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : center.status === 'NO_RESOURCES' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                {center.status}
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">{center.name}</h3>
            <div className="space-y-3 text-sm text-slate-600 mb-6">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-slate-400" />
                <span>{center.address}, {center.city}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-slate-400" />
                <span>{center.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-slate-400" />
                <span>{center.schedule}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span>Responsable: {center.responsiblePerson}</span>
              </div>
            </div>

            {Array.isArray(center.donationInfo) && center.donationInfo.length > 0 && (
              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Donaciones</p>
                {center.donationInfo.map((card: any, index: number) => (
                  <div key={`${card.accountNumber}-${index}`} className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-700 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{card.title}</p>
                        <p>{card.bankName} · {card.accountType}</p>
                        <p className="font-mono text-xs">{card.accountNumber}</p>
                        {card.phone && <p>Tel.: {card.phone}</p>}
                        {card.email && <p>Email: {card.email}</p>}
                        <p className="mt-1 text-xs text-slate-500">{card.instructions}</p>
                      </div>

                      {canManageCenters && (
                        <button
                          type="button"
                          onClick={() => handleDeleteDonationCard(center.id, index)}
                          className="rounded-lg bg-red-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t flex justify-between items-center gap-3">
              <span className="text-xs font-mono text-slate-400">{center.id}</span>
              {canManageCenters ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => openEditForm(center)} className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline">
                    <Pencil size={14} />
                    Editar
                  </button>
                  {user?.role === 'SUPER_ADMIN' || !center.createdByUserId || center.createdByUserId === user?.id ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteCenter(center.id)}
                      className="flex items-center gap-2 text-red-600 font-bold text-sm hover:underline"
                    >
                      Eliminar centro
                    </button>
                  ) : null}
                </div>
              ) : (
                <span className="text-xs text-slate-400">Consulta pública</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {filteredCenters.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          No hay centros registrados para la ciudad seleccionada.
        </div>
      )}
    </div>
  );
};

export default CentersPage;
