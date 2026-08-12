import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { CITY_GROUPS } from '../data/cityOptions';
import { AlertTriangle, MapPin, ShieldCheck, Image as ImageIcon, Megaphone, CheckCircle2 } from 'lucide-react';

const NeedHelpPage = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('ALL');
  const [form, setForm] = useState({
    title: '',
    details: '',
    location: '',
    sourceName: '',
    contact: '',
    evidenceUrl: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [announcementData, submissionData] = await Promise.all([
          api.announcements.list(),
          api.announcements.listCitizenSubmissions(),
        ]); 

        setAnnouncements(Array.isArray(announcementData) ? announcementData : []);
        setSubmissions(Array.isArray(submissionData) ? submissionData : []);
      } catch (error: any) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const verifiedAnnouncements = useMemo(
    () => announcements.filter((item) => item.verificationStatus === 'VERIFIED' && (cityFilter === 'ALL' ? true : item.location === cityFilter)),
    [announcements, cityFilter]
  );

  const filteredSubmissions = useMemo(
    () => submissions.filter((item) => cityFilter === 'ALL' ? true : item.location === cityFilter),
    [submissions, cityFilter]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.announcements.submitCitizen({
        ...form,
        verificationStatus: 'PENDING',
      });
      setForm({ title: '', details: '', location: '', sourceName: '', contact: '', evidenceUrl: '' });
      const fresh = await api.announcements.listCitizenSubmissions();
      setSubmissions(Array.isArray(fresh) ? fresh : []);
      alert('Información enviada para verificación.');
    } catch (error: any) {
      alert(error.message || 'No se pudo enviar la información');
    }
  };

  if (loading) return <div className="px-4 py-12 text-center text-slate-600">Cargando información importante...</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="mb-8 overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-red-50 p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-amber-100 p-3 text-amber-700"><Megaphone size={24} /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Información crítica</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Tablero de anuncios</h2>
            <p className="mt-2 text-slate-600">Información importante para hospitales, puntos de ayuda y convocatorias verificadas.</p>
          </div>
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
          {CITY_GROUPS.map((group) => (
            <optgroup key={group.department} label={group.department}>
              {group.cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {verifiedAnnouncements.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title} className="h-48 w-full object-cover" />
            ) : (
              <div className="flex h-48 items-center justify-center bg-slate-100 text-slate-500">
                <ImageIcon size={32} />
              </div>
            )}
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">{item.category}</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500"><ShieldCheck size={14} /> Verificado</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
              <p className="text-sm leading-6 text-slate-600">{item.body}</p>
              {item.location && (
                <p className="flex items-center gap-2 text-sm text-slate-600"><MapPin size={15} /> {item.location}</p>
              )}
              {item.contact && (
                <p className="text-sm text-slate-600">Contacto: {item.contact}</p>
              )}
            </div>
          </article>
        ))}
      </div>

      {verifiedAnnouncements.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No hay anuncios verificados por el momento.
        </div>
      )}

      <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <AlertTriangle className="text-red-500" />
          <h3 className="text-2xl font-bold text-slate-900">Enviar información comprobable</h3>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <input required className="rounded-xl border border-slate-200 p-3" placeholder="Título" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <input className="rounded-xl border border-slate-200 p-3" placeholder="Ciudad o lugar" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          <input className="rounded-xl border border-slate-200 p-3 md:col-span-2" placeholder="Nombre de la fuente o responsable" value={form.sourceName} onChange={e => setForm({ ...form, sourceName: e.target.value })} />
          <textarea required className="min-h-[120px] rounded-xl border border-slate-200 p-3 md:col-span-2" placeholder="Detalles verificables" value={form.details} onChange={e => setForm({ ...form, details: e.target.value })} />
          <input className="rounded-xl border border-slate-200 p-3" placeholder="Contacto" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
          <input className="rounded-xl border border-slate-200 p-3" placeholder="Enlace de evidencia (opcional)" value={form.evidenceUrl} onChange={e => setForm({ ...form, evidenceUrl: e.target.value })} />
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700">Enviar para revisión</button>
          </div>
        </form>
      </section>

      <section className="mt-12">
        <h3 className="mb-5 text-2xl font-bold text-slate-900">Información enviada por ciudadanos</h3>
        <div className="space-y-3">
          {filteredSubmissions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-500">Todavía no hay registros de verificación ciudadana para la ciudad seleccionada.</div>
          ) : filteredSubmissions.map(item => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-bold text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-600">{item.location}</p>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                  item.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' :
                  item.verificationStatus === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {item.verificationStatus === 'VERIFIED' ? <CheckCircle2 size={14} /> : null} {item.verificationStatus}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.details}</p>
              {item.evidenceUrl && <a href={item.evidenceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-medium text-blue-600">Ver evidencia</a>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default NeedHelpPage;
