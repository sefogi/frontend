import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { getCityFilterOptions } from '../data/cityOptions';
import { User, PlusCircle, Camera, CheckCircle, Filter } from 'lucide-react';

const ReportsPage = ({ type }: { type: 'missing' | 'found' }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [formData, setFormData] = useState({
    name: '', age: '', city: '', lastSeenLocation: '', description: '', contactInfo: '', type: type === 'missing' ? 'MISSING' : 'FOUND'
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    async function loadReports() {
      try {
        const data = type === 'missing' ? await api.reports.listMissing() : await api.reports.listFound();
        setReports(data as any[]);
      } catch (err: any) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, [type]);

  const cityOptions = useMemo(() => getCityFilterOptions(reports), [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesStatus = statusFilter === 'ALL'
        ? true
        : statusFilter === 'VERIFIED'
          ? report.verificationStatus === 'VERIFIED'
          : report.verificationStatus !== 'VERIFIED';

      const matchesCity = cityFilter === 'ALL' ? true : report.city === cityFilter;
      return matchesStatus && matchesCity;
    });
  }, [reports, statusFilter, cityFilter]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('age', formData.age);
      data.append('city', formData.city);
      data.append('lastSeenLocation', formData.lastSeenLocation);
      data.append('description', formData.description);
      data.append('contactInfo', formData.contactInfo);
      data.append('type', formData.type);
      data.append('reportDate', new Date().toISOString());
      if (photo) {
        data.append('photo', photo);
      }

      await api.reports.submit(data);
      setShowForm(false);
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="text-center py-12">Cargando reportes...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <section className="mb-8 overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-r from-sky-50 via-white to-indigo-50 p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Reporte público</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {type === 'missing' ? 'Personas Desaparecidas' : 'Personas Encontradas'}
            </h2>
            <p className="mt-2 text-slate-600">Información actualizada en tiempo real y verificada por el equipo.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition shadow-sm"
          >
            <PlusCircle size={20} />
            Reportar {type === 'missing' ? 'Desaparecido' : 'Encontrado'}
          </button>
        </div>
      </section>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Filter size={16} className="text-slate-500" />
          Filtros
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'ALL' | 'VERIFIED' | 'PENDING')} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="ALL">Todos</option>
            <option value="VERIFIED">Verificados</option>
            <option value="PENDING">Pendientes</option>
          </select>

          <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
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
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Reportar Persona</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="w-32 h-32 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={32} className="text-slate-400" />
                  )}
                </div>
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-2">
                  <Camera size={16} />
                  {photo ? 'Cambiar Foto' : 'Subir Foto'}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input required className="w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Edad</label>
                  <input required type="number" className="w-full p-2 border rounded" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} />
                </div>
              </div>
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
                <label className="block text-sm font-medium mb-1">Lugar donde fue vista por última vez</label>
                <input required className="w-full p-2 border rounded" value={formData.lastSeenLocation} onChange={e => setFormData({ ...formData, lastSeenLocation: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea required className="w-full p-2 border rounded" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Información de contacto</label>
                <input required className="w-full p-2 border rounded" value={formData.contactInfo} onChange={e => setFormData({ ...formData, contactInfo: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 font-medium">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Enviar Reporte</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map(report => (
          <div key={report.id} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-slate-500 border">
                {report.photoUrl ? (
                  <img src={`http://localhost:3001${report.photoUrl}`} alt={report.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={24} />
                )}
              </div>
              <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${report.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {report.verificationStatus === 'VERIFIED' && <CheckCircle size={12} />}
                {report.verificationStatus}
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">{report.name}</h3>
            <div className="space-y-2 text-sm text-slate-600 mb-4">
              <p><strong className="text-slate-900">Edad:</strong> {report.age}</p>
              <p><strong className="text-slate-900">Ciudad:</strong> {report.city}</p>
              <p><strong className="text-slate-900">Última vez visto:</strong> {report.lastSeenLocation}</p>
              <p className="italic">"{report.description}"</p>
            </div>
            <div className="pt-4 border-t flex justify-between items-center">
              <span className="text-xs font-mono text-slate-400">{report.id}</span>
              <a href={`tel:${report.contactInfo}`} className="text-blue-600 font-bold text-sm hover:underline">Contactar</a>
            </div>
          </div>
        ))}
      </div>
      {filteredReports.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          No hay reportes disponibles en este momento.
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
