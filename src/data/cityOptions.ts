export const CITY_GROUPS = [
  { department: 'Chocó', cities: ['San José del Palmar', 'Quibdó'] },
  { department: 'Valle del Cauca', cities: ['El Cairo', 'Argelia', 'El Águila', 'Cali', 'Cartago', 'Buenaventura', 'Buga', 'Dagua', 'Sevilla', 'Tuluá', 'Caicedonia', 'Trujillo', 'Riofrío', 'Roldanillo', 'Restrepo', 'Jamundí', 'Palmira'] },
  { department: 'Risaralda', cities: ['Pereira', 'Dosquebradas', 'Pueblo Rico', 'Santa Rosa de Cabal', 'Mistrató', 'Belén de Umbría', 'Apía', 'Santuario', 'Balboa'] },
  { department: 'Caldas', cities: ['Manizales', 'Palestina', 'Chinchiná', 'Anserma', 'Riosucio'] },
  { department: 'Quindío', cities: ['Armenia', 'Calarcá', 'Circasia', 'Montenegro'] },
  { department: 'Antioquia', cities: ['Andes', 'Jardín', 'Jericó', 'Amagá', 'La Estrella', 'Medellín', 'Bello'] },
  { department: 'Tolima', cities: ['Ibagué'] },
  { department: 'Cauca', cities: ['Popayán', 'Santander de Quilichao'] },
  { department: 'Huila', cities: ['Neiva'] },
  { department: 'Cundinamarca', cities: ['Bogotá D.C.'] },
] as const;

export const ALL_CITIES = CITY_GROUPS.flatMap((group) => group.cities);

const normalizeCityKey = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-CO');

export const getCityFilterOptions = <T extends { city?: string | null }>(records: T[] = []) => {
  const grouped = new Map<string, Set<string>>();
  CITY_GROUPS.forEach((group) => grouped.set(group.department, new Set(group.cities)));

  const knownCities = new Set<string>();
  CITY_GROUPS.forEach((group) => group.cities.forEach((city) => knownCities.add(normalizeCityKey(city))));

  for (const record of records) {
    const city = (record?.city ?? '').trim();
    if (!city) continue;

    const cityKey = normalizeCityKey(city);
    if (knownCities.has(cityKey)) continue;

    knownCities.add(cityKey);
    const extras = grouped.get('Otras ciudades registradas') ?? new Set<string>();
    extras.add(city);
    grouped.set('Otras ciudades registradas', extras);
  }

  return Array.from(grouped.entries())
    .map(([department, cities]) => ({
      department,
      cities: Array.from(cities).sort((a, b) => a.localeCompare(b, 'es-CO')),
    }))
    .filter(({ cities }) => cities.length > 0);
};
