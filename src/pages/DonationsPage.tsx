import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Heart, AlertCircle, Package } from 'lucide-react';

const DonationsPage = () => {
  const [needs, setNeeds] = useState<any[]>([]);
  const [available, setAvailable] = useState<any[]>([]);
  const [donationCards, setDonationCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [needsData, availableData, centersData] = await Promise.all([
        api.donations.listNeeds(),
        api.donations.listAvailable(),
        api.centers.list(),
      ]) as [any[], any[], any[]];
      setNeeds(needsData);
      setAvailable(availableData);
      const cards = (Array.isArray(centersData) ? centersData : []).flatMap((center: any) =>
        Array.isArray(center.donationInfo) ? center.donationInfo.map((card: any) => ({ ...card, centerName: center.name, city: center.city })) : []
      );
      setDonationCards(cards);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <div className="text-center py-12">Cargando donaciones...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <section className="mb-10 overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-r from-emerald-50 via-white to-lime-50 p-6 shadow-sm">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Necesidades y apoyo</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 mb-2">Donaciones y Recursos</h2>
          <p className="text-slate-600">Ayuda a coordinar la entrega de suministros esenciales con información clara y priorizada.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section>
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="text-red-500" />
            <h3 className="text-2xl font-bold text-slate-800">Necesidades Actuales</h3>
          </div>
          <div className="space-y-4">
            {needs.map(need => (
              <div key={need.id} className="bg-white p-4 rounded-xl border shadow-sm flex justify-between items-center gap-3">
                <div>
                  <p className="font-bold text-slate-900">Recurso: {need.categoryId}</p>
                  <p className="text-sm text-slate-500">Centro: {need.centerId}</p>
                  <p className="text-sm text-slate-500">Pendiente: {Math.max((Number(need.quantityNeeded) || 0) - (Number(need.quantityReceived) || 0), 0)} | Recibido: {need.quantityReceived ?? 0}</p>
                  <span className={`mt-2 inline-block text-xs font-bold px-2 py-0.5 rounded-full ${
                    need.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                    need.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {need.priority}
                  </span>
                </div>
                <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                  <Heart size={20} />
                </button>
              </div>
            ))}
            {needs.length === 0 && <p className="text-center text-slate-500 py-8">No hay necesidades registradas.</p>}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6">
            <Package className="text-green-500" />
            <h3 className="text-2xl font-bold text-slate-800">Donaciones Disponibles</h3>
          </div>
          <div className="space-y-4">
            {available.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-xl border shadow-sm flex justify-between items-center gap-3">
                <div>
                  <p className="font-bold text-slate-900">Recurso: {item.categoryId}</p>
                  <p className="text-sm text-slate-500">Centro: {item.centerId}</p>
                  <p className="text-sm text-slate-500">Cantidad disponible: {item.quantity}</p>
                </div>
                <button className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition">
                  <Heart size={20} />
                </button>
              </div>
            ))}
            {available.length === 0 && <p className="text-center text-slate-500 py-8">No hay donaciones disponibles.</p>}
          </div>

          <div className="mt-8">
            <h4 className="mb-4 text-xl font-bold text-slate-800">Dónde hacer las donaciones</h4>
            {donationCards.length === 0 ? (
              <p className="text-center text-slate-500 py-6">No hay información de donación publicada aún.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {donationCards.map((card, index) => (
                  <div key={`${card.centerName}-${card.accountNumber || index}`} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{card.title}</p>
                        <p className="text-sm text-slate-700">{card.centerName} · {card.city}</p>
                        <p className="mt-2 text-sm text-slate-700">{card.bankName} · {card.accountType}</p>
                        <p className="font-mono text-xs text-slate-600">{card.accountNumber}</p>
                        {card.phone && <p className="text-xs text-slate-600">Tel.: {card.phone}</p>}
                        {card.email && <p className="text-xs text-slate-600">Email: {card.email}</p>}
                        {card.linkUrl && (
                          <a href={card.linkUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold text-blue-700 underline">
                            Enlace de donación
                          </a>
                        )}
                        <p className="mt-3 text-xs text-slate-500">{card.instructions}</p>
                      </div>
                      {card.qrUrl && (
                        <img src={card.qrUrl} alt={`QR de ${card.title}`} className="h-20 w-20 rounded-lg border border-white bg-white p-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DonationsPage;
