import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'BuscaTuNido - Plataforma de Pensiones y Residencias Universitarias en Chile';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#1C1A17',
          color: '#FBF9F6',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#D37B5D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '28px',
                fontWeight: 900,
              }}
            >
              N
            </div>
            <span
              style={{
                fontSize: '36px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
              }}
            >
              BuscaTuNido
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(211, 123, 93, 0.15)',
              border: '1px solid rgba(211, 123, 93, 0.4)',
              borderRadius: '9999px',
              padding: '8px 20px',
              color: '#D37B5D',
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            Chile Universitario
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <h1
            style={{
              fontSize: '56px',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
              margin: 0,
            }}
          >
            Encuentra tu pensión o residencia universitaria ideal
          </h1>

          <p
            style={{
              fontSize: '24px',
              lineHeight: 1.4,
              color: '#A8A29E',
              margin: 0,
              maxWidth: '900px',
            }}
          >
            Precios transparentes en CLP, cercanía a campus y evaluaciones verificadas por la comunidad estudiantil.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '12px',
            }}
          >
            {['Santiago', 'Valparaíso', 'Concepción', 'Valdivia'].map((city) => (
              <div
                key={city}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '16px',
                  color: '#E7E5E4',
                  fontWeight: 500,
                }}
              >
                {city}
              </div>
            ))}
          </div>

          <div
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#D37B5D',
            }}
          >
            buscatunido.cl
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
