import type { PensionReview, StayDurationCategory } from './types';

const FIRST_NAMES = [
  'Camila',
  'Matías',
  'Valentina',
  'Diego',
  'Sofía',
  'Benjamín',
  'Ignacio',
  'Francisca',
  'Nicolás',
  'Constanza',
  'Sebastián',
  'Catalina',
  'Felipe',
  'Javiera',
  'Tomás',
  'Isidora',
  'Joaquín',
  'Daniela',
  'Lucas',
  'Fernanda',
  'Vicente',
  'Martina',
  'Maximiliano',
  'Antonia',
  'Cristóbal',
  'Paula',
  'Andrés',
  'Gabriela',
];

const LAST_NAMES = [
  'González',
  'Muñoz',
  'Rojas',
  'Díaz',
  'Pérez',
  'Soto',
  'Contreras',
  'Silva',
  'Martínez',
  'Sepúlveda',
  'Morales',
  'Rodríguez',
  'López',
  'Fuentes',
  'Hernández',
  'Torres',
  'Araya',
  'Flores',
  'Espinoza',
  'Valenzuela',
  'Castillo',
  'Tapia',
  'Reyes',
  'Gutiérrez',
];

const UNIVERSITIES = [
  { shortName: 'UCHILE', name: 'Universidad de Chile' },
  { shortName: 'UC', name: 'Pontificia Universidad Católica de Chile' },
  { shortName: 'USACH', name: 'Universidad de Santiago de Chile' },
  { shortName: 'UdeC', name: 'Universidad de Concepción' },
  { shortName: 'USM', name: 'Universidad Técnica Federico Santa María' },
  { shortName: 'PUCV', name: 'Pontificia Universidad Católica de Valparaíso' },
  { shortName: 'UV', name: 'Universidad de Valparaíso' },
  { shortName: 'UDP', name: 'Universidad Diego Portales' },
  { shortName: 'UAI', name: 'Universidad Adolfo Ibáñez' },
  { shortName: 'UNAB', name: 'Universidad Andrés Bello' },
  { shortName: 'USS', name: 'Universidad San Sebastián' },
  { shortName: 'UACH', name: 'Universidad Austral de Chile' },
  { shortName: 'UFRO', name: 'Universidad de La Frontera' },
  { shortName: 'UTEM', name: 'Universidad Tecnológica Metropolitana' },
  { shortName: 'UBIOBIO', name: 'Universidad del Bío-Bío' },
  { shortName: 'UANDES', name: 'Universidad de los Andes' },
];

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1534751516642-a171edd2521d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
];

const ROOM_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
    caption: 'Dormitorio individual con escritorio',
  },
  {
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
    caption: 'Espacio de estudio con luz natural',
  },
  {
    url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80',
    caption: 'Cocina compartida y comedor',
  },
  {
    url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
    caption: 'Área común para descansar',
  },
  {
    url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80',
    caption: 'Pieza amoblada y clóset amplio',
  },
];

const OPENERS_HIGH = [
  'Mi experiencia viviendo aquí durante mi año universitario fue excelente.',
  'Estuve alojando este semestre y la verdad superó mis expectativas.',
  'Un lugar muy acogedor y perfecto para enfocarse en la carrera.',
  'Bastante conforme con la estadía, cumplió con todo lo que buscaba al llegar de región.',
  'Recomiendo totalmente esta pensión para cualquier estudiante.',
  'Fue una estancia muy grata y tranquila durante todo el periodo académico.',
  'Muy buena pensión, se nota la preocupación por mantener un ambiente grato.',
  'Llegué como mechón a la ciudad y este lugar me facilitó un montón la adaptación.',
  'Excelente opción para vivir cerca de la universidad sin pagar de más.',
  'Viví aquí prácticamente todo el año y no tengo quejas.',
  'Una residencia estudiantil muy cómoda, volvería a quedarme sin dudarlo.',
  'Muy grato ambiente desde el primer día que me instalé.',
];

const OPENERS_MID = [
  'En general es una pensión correcta que cumple con lo básico para el año.',
  'Mi experiencia fue aceptable durante el semestre que me quedé.',
  'Buena pensión para estudiantes, aunque con algunos detalles a considerar.',
  'Cumple con lo necesario para cursar el semestre académico.',
  'Es un lugar piola para estudiar, aunque tiene cosas que podrían mejorar.',
  'La estadía estuvo bien en líneas generales, acorde al precio que se paga.',
];

const LOCATIONS = [
  'La ubicación es inmejorable, a solo unos minutos caminando de las facultades.',
  'Tiene excelente conectividad, el paradero de micros y metro quedan prácticamente a la vuelta.',
  'El barrio es muy tranquilo y seguro, incluso cuando toca volver tarde de la biblioteca.',
  'Se puede llegar a pie al campus todos los días, lo que ahorra mucho tiempo y pasajes.',
  'El sector cuenta con almacenes, farmacias y lugares accesibles para almorzar.',
  'Muy bien ubicada en una zona residencial silenciosa pero con locomoción directa.',
  'Queda cerca de centros de fotocopiado, supermercados y las principales sedes universitarias.',
  'La cercanía con el campus hace que sea muy cómodo volver en los bloques libres.',
];

const FACILITIES = [
  'La habitación es iluminada, con un escritorio espacioso para el computador y apuntes.',
  'La cocina compartida es amplia y cada estudiante cuenta con su espacio en el refrigerador y estantes.',
  'El agua caliente funciona perfecto y la presión de la ducha es muy buena en las mañanas.',
  'Las piezas son abrigadas y la calefacción ayuda bastante en los meses más helados.',
  'Las camas son cómodas y los clósets tienen suficiente espacio para guardar todo.',
  'Las zonas comunes se mantienen muy limpias y la lavandería funciona sin inconvenientes.',
  'El baño siempre limpio y con buena ventilación.',
  'Espacios comunes cómodos para comer y descansar entre clases.',
];

const WIFI_STUDY = [
  'El internet por fibra vuela, nunca tuve caídas ni lag durante certámenes online.',
  'La conexión WiFi es estable y rápida en todas las habitaciones.',
  'El ambiente para estudiar es óptimo; se respetan los horarios de silencio rigurosamente.',
  'Durante semanas de certámenes el silencio en la casa se agradece un montón.',
  'Hay buen aislamiento en las piezas, lo que permite concentrarse sin distracciones.',
  'El internet funcionó impecable para streaming, videollamadas y descargar material pesado.',
];

const LANDLORD_COMMUNITY = [
  'El dueño es sumamente amable y resuelve cualquier duda o inconveniente en minutos.',
  'La administración es muy cordial y respetuosa con los tiempos de los estudiantes.',
  'La convivencia con los demás compañeros fue excelente, de mucho respeto y buena onda.',
  'Se genera un ambiente muy familiar que hace sentir a uno como en casa.',
  'Muy buena disposición de los anfitriones, siempre atentos a que no falte nada.',
  'El trato siempre fue transparente y los gastos comunes claros desde el inicio.',
];

const NUANCES = [
  'A veces en las mañanas hay que coordinar bien el uso de la ducha porque baja un poco la presión.',
  'El único punto a mejorar es que en la cocina a veces se juntan varios a la hora de almuerzo.',
  'El WiFi en las piezas del fondo a ratos baja la señal cuando todos están conectados.',
  'El refrigerador común a veces queda medio justo si todos cocinan mucho.',
  'Se escuchan un poco los ruidos de la calle los viernes, pero nada que impida descansar.',
];

const CLOSINGS = [
  'Totalmente recomendada para quienes buscan tranquilidad y comodidad.',
  'Sin duda una excelente alternativa para estudiantes universitarios.',
  '100% recomendada para estudiantes que vienen de otras regiones.',
  'Me voy muy contento y con excelentes recuerdos de este periodo.',
  'Si buscas un lugar ordenado para rendir bien en la U, este es.',
];

function pickOne<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomReviewText(rating: number): string {
  const parts: string[] = [];
  if (rating >= 4) {
    parts.push(pickOne(OPENERS_HIGH));
    parts.push(pickOne(LOCATIONS));
    parts.push(Math.random() > 0.5 ? pickOne(FACILITIES) : pickOne(WIFI_STUDY));
    if (Math.random() > 0.3) {
      parts.push(pickOne(LANDLORD_COMMUNITY));
    }
    if (Math.random() > 0.4) {
      parts.push(pickOne(CLOSINGS));
    }
  } else {
    parts.push(pickOne(OPENERS_MID));
    parts.push(Math.random() > 0.5 ? pickOne(LOCATIONS) : pickOne(FACILITIES));
    parts.push(pickOne(NUANCES));
    if (Math.random() > 0.4) {
      parts.push(pickOne(LANDLORD_COMMUNITY));
    }
  }
  return parts.join(' ');
}

export function generateRandomReviewsForPension(
  pensionId: string,
  _pensionTitle?: string,
  _city?: string,
  requestedCount?: number,
): PensionReview[] {
  const count = requestedCount ?? Math.floor(Math.random() * 5) + 3;
  const reviews: PensionReview[] = [];

  const durations: StayDurationCategory[] = [
    'ONE_SEMESTER',
    'ONE_YEAR',
    'MORE_THAN_A_YEAR',
    'FEW_WEEKS',
  ];

  const ratingPool = [5, 5, 4, 5, 4, 3, 5, 4, 4, 5];

  for (let i = 0; i < count; i++) {
    const overallRating = pickOne(ratingPool);
    const firstName = pickOne(FIRST_NAMES);
    const lastName = pickOne(LAST_NAMES);
    const university = pickOne(UNIVERSITIES);
    const avatar = pickOne(AVATARS);
    const duration = pickOne(durations);

    const clampRating = (val: number) => Math.min(5, Math.max(1, val));
    const cleanliness = clampRating(overallRating + Math.floor(Math.random() * 3) - 1);
    const landlord = clampRating(overallRating + Math.floor(Math.random() * 3) - 1);
    const quietness = clampRating(overallRating + Math.floor(Math.random() * 2) - 1);
    const wifi = clampRating(overallRating + Math.floor(Math.random() * 2));

    const hasImages = Math.random() < 0.3;
    const reviewImages = hasImages
      ? [
          {
            id: `img-${pensionId}-${i}-1`,
            url: pickOne(ROOM_IMAGES).url,
            caption: pickOne(ROOM_IMAGES).caption,
          },
        ]
      : [];

    const daysAgo = Math.floor(Math.random() * 300) + 5;
    const createdAtDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    reviews.push({
      id: `dyn-rev-${pensionId}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      pensionId,
      overallRating,
      rating: overallRating,
      cleanlinessRating: cleanliness,
      landlordRating: landlord,
      quietnessRating: quietness,
      wifiRating: wifi,
      comment: generateRandomReviewText(overallRating),
      stayDurationCategory: duration,
      stayDuration: duration,
      isResidentVerified: Math.random() > 0.15,
      isVerifiedStudent: true,
      images: reviewImages,
      createdAt: createdAtDate,
      user: {
        id: `usr-${i}-${Math.random().toString(36).slice(2, 7)}`,
        firstName,
        lastName,
        avatarUrl: avatar,
        university: {
          shortName: university.shortName,
          name: university.name,
        },
      },
    });
  }

  return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function calculateRatingStats(reviews: PensionReview[]): {
  average: number;
  count: number;
} {
  if (!reviews || reviews.length === 0) {
    return { average: 4.5, count: 0 };
  }
  const sum = reviews.reduce((acc, r) => acc + (r.overallRating ?? r.rating ?? 5), 0);
  const avg = Math.round((sum / reviews.length) * 10) / 10;
  return { average: avg, count: reviews.length };
}

export function getDeterministicPensionRating(pensionId: string): {
  ratingAverage: number;
  reviewsCount: number;
} {
  let hash = 0;
  for (let i = 0; i < pensionId.length; i++) {
    hash = (hash << 5) - hash + pensionId.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const possibleRatings = [3.9, 4.1, 4.2, 4.3, 4.4, 4.6, 4.7, 4.8, 4.9, 5.0];
  const ratingAverage = possibleRatings[absHash % possibleRatings.length];
  const reviewsCount = 3 + (absHash % 16);
  return { ratingAverage, reviewsCount };
}
