import React, { useEffect, useMemo, useState } from 'react';
import { MapPin, Droplets, Utensils, Heart, Shield, Filter } from 'lucide-react';
import { api } from '../services/api';
import { getCityFilterOptions } from '../data/cityOptions';

type MapPoint = {
  id: string;
  type: 'CENTER' | 'MEDICAL' | 'WATER' | 'FOOD' | 'ZONE';
  name: string;
  city: string;
  status: 'ACTIVE' | 'NO_RESOURCES' | 'TEMPORARILY_CLOSED';
  x: number;
  y: number;
};

const typeConfig = {
  CENTER: { label: 'Centro', icon: Shield, className: 'bg-blue-600 text-white' },
  MEDICAL: { label: 'Médico', icon: Heart, className: 'bg-red-600 text-white' },
  WATER: { label: 'Agua', icon: Droplets, className: 'bg-cyan-600 text-white' },
  FOOD: { label: 'Alimentos', icon: Utensils, className: 'bg-amber-600 text-white' },
  ZONE: { label: 'Zona', icon: MapPin, className: 'bg-violet-600 text-white' },
};

const MapPage = () => {
  const [selectedType, setSelectedType] = useState<'ALL' | MapPoint['type']>('ALL');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadCenters = async () => {
      try {
        const centers = await api.centers.list();
        if (!active) return;

        const mapped = (Array.isArray(centers) ? centers : []).map((center: any, index: number) => {
          const lat = Number(center.latitude);
          const lon = Number(center.longitude);

          const x = Number.isFinite(lon) ? ((lon + 180) / 360) * 100 : 50 + (index % 3) * 12;
          const y = Number.isFinite(lat) ? ((90 - lat) / 180) * 100 : 50 + (index % 4) * 10;

          return {
            id: center.id ?? `center-${index}`,
            type: 'CENTER' as const,
            name: center.name ?? 'Centro de ayuda',
            city: center.city ?? 'Sin ciudad',
            status: (center.status ?? 'ACTIVE') as MapPoint['status'],
            x: Math.min(95, Math.max(5, x)),
            y: Math.min(95, Math.max(5, y)),
          };
        });

        setPoints(mapped);
      } catch (error) {
        console.error('Error loading map centers', error);
        setPoints([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCenters();
    return () => {
      active = false;
    };
  }, []);

  const cityOptions = useMemo(() => getCityFilterOptions(points), [points]);

  const filteredPoints = useMemo(() => {
    const typeFiltered = selectedType === 'ALL' ? points : points.filter(point => point.type === selectedType);
    return selectedCity === 'ALL' ? typeFiltered : typeFiltered.filter(point => point.city === selectedCity);
  }, [selectedType, selectedCity, points]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <section className="mb-8 overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-r from-indigo-50 via-white to-sky-50 p-6 shadow-sm">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Ubicación</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 mb-2">Mapa de Ayuda</h2>
          <p className="text-slate-600">Visualiza los centros y puntos de apoyo registrados en la plataforma.</p>
        </div>
      </section>

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'CENTER', 'MEDICAL', 'WATER', 'FOOD', 'ZONE'] as const).map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${selectedType === type ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}
            >
              {type === 'ALL' ? 'Todos' : typeConfig[type].label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Filter size={16} className="text-slate-500" />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
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
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-10 text-center text-slate-500">Cargando mapa...</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="relative h-[620px] overflow-hidden rounded-3xl border-4 border-dashed border-slate-300 bg-gradient-to-br from-slate-100 via-white to-sky-50">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '36px 36px' }} />

            {filteredPoints.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-slate-500">
                <div className="max-w-md rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6">
                  No hay puntos geolocalizados actualmente.
                </div>
              </div>
            ) : (
              filteredPoints.map(point => {
                const Icon = typeConfig[point.type].icon;
                return (
                  <div
                    key={point.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  >
                    <div className={`flex items-center gap-2 rounded-full border px-2 py-1 shadow-lg ${typeConfig[point.type].className}`}>
                      <Icon size={14} />
                      <span className="text-xs font-bold">{point.name}</span>
                    </div>
                  </div>
                );
              })
            )}

            {filteredPoints.length > 0 && (
              <div className="absolute bottom-4 right-4 rounded-xl bg-white/90 px-3 py-2 text-xs text-slate-700 shadow-md">
                {filteredPoints.length} puntos visibles
              </div>
            )}
          </div>

          <aside className="space-y-4">
            {filteredPoints.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
                Todavía no hay centros mostrados en el mapa.
              </div>
            ) : (
              filteredPoints.map(point => {
                const Icon = typeConfig[point.type].icon;
                const statusClass =
                  point.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                  point.status === 'NO_RESOURCES' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

                return (
                  <div key={point.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`rounded-lg p-2 ${typeConfig[point.type].className}`}>
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{point.name}</p>
                          <p className="text-sm text-slate-500">{point.city}</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusClass}`}>{point.status}</span>
                    </div>
                  </div>
                );
              })
            )}
          </aside>
        </div>
      )}
    </div>
  );
};

export default MapPage;
