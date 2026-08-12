import React from 'react';
import { Map, Heart, Users, Home, AlertTriangle, ShieldCheck, Compass, CheckCircle2, BellRing } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <section className="mb-12 overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 shadow-xl shadow-slate-200/70">
        <div className="grid items-center gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.35fr_0.95fr] lg:px-12 lg:py-12">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100">
              Red de ayuda sos · Colombia
            </span>
            <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Información sobre centros, recursos y personas reportadas 
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
              Encuentra centros de ayuda, recursos, donaciones y personas reportadas durante esta emergencia nacional con una experiencia clara, segura y actualizada.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link to="/need-help" className="inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-950/30 transition hover:bg-red-500">
                Necesito ayuda
              </Link>
              <Link to="/map" className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-100">
                Ver mapa
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <InfoCard icon={<ShieldCheck className="text-emerald-600" />} title="Verificación" text="Toda la información crítica se valida para reducir riesgos y confusión." />
            <InfoCard icon={<Compass className="text-blue-600" />} title="Ubicación" text="Navega rápido por centros, recursos y zonas de ayuda más cercanas." />
            <InfoCard icon={<BellRing className="text-amber-600" />} title="Actualización" text="La información se mantiene visible con fecha y estado de verificación." />
          </div>
        </div>
      </section>

      <section className="mb-10 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-red-100 p-2 text-red-600"><AlertTriangle size={20} /></div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Alerta importante</p>
        </div>
        <p className="mt-3 text-base leading-7 text-slate-700">
          Si estás en peligro inmediato, contacta con los servicios de emergencia de tu zona. La prioridad es la seguridad y la coordinación rápida.
        </p>
      </section>

      <section className="mb-10">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h3 className="text-2xl font-bold text-slate-900">Acciones rápidas</h3>
          <span className="text-sm text-slate-500">Todo en un solo acceso</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <ActionLink to="/need-help" icon={<AlertTriangle className="text-orange-500" />} label="Necesito ayuda" color="bg-orange-50 border-orange-200 text-orange-700" />
          <ActionLink to="/centers" icon={<Home className="text-blue-500" />} label="Centros de acopio" color="bg-blue-50 border-blue-200 text-blue-700" />
          <ActionLink to="/donations" icon={<Heart className="text-red-500" />} label="Donaciones" color="bg-red-50 border-red-200 text-red-700" />
          <ActionLink to="/reports/missing" icon={<Users className="text-purple-500" />} label="Personas desaparecidas" color="bg-purple-50 border-purple-200 text-purple-700" />
          <ActionLink to="/reports/found" icon={<Users className="text-green-500" />} label="Personas encontradas" color="bg-green-50 border-green-200 text-green-700" />
          <ActionLink to="/map" icon={<Map className="text-indigo-500" />} label="Mapa de ayuda" color="bg-indigo-50 border-indigo-200 text-indigo-700" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <FeatureCard title="Información útil" text="Consulta centros, recursos y ayuda disponible sin perder tiempo." icon={<CheckCircle2 className="text-emerald-600" />} />
        <FeatureCard title="Respuesta rápida" text="Diseñado para personas en crisis con navegación simple y clara." icon={<Compass className="text-blue-600" />} />
        <FeatureCard title="Confianza" text="Toda la información se entiende como crítica y verificable." icon={<ShieldCheck className="text-slate-700" />} />
      </section>
    </div>
  );
};

const ActionLink = ({ to, icon, label, color }: { to: string, icon: React.ReactNode, label: string, color: string }) => (
  <Link to={to} className={`flex items-center gap-4 rounded-2xl border-2 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${color}`}>
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
      {icon}
    </div>
    <span className="text-base font-bold sm:text-lg">{label}</span>
  </Link>
);

const InfoCard = ({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) => (
  <div className="rounded-2xl border border-white/10 bg-white/95 p-4 shadow-lg shadow-slate-950/10">
    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
      {icon}
    </div>
    <h4 className="text-lg font-bold text-slate-900">{title}</h4>
    <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
  </div>
);

const FeatureCard = ({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">{icon}</div>
    <h4 className="text-lg font-bold text-slate-900">{title}</h4>
    <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
  </div>
);

export default HomePage;
