import { NextResponse } from 'next/server';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 3) {
      return NextResponse.json(
        { success: false, statusCode: 400, message: 'Parámetro de búsqueda q requerido' },
        { status: 400 },
      );
    }

    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query.trim())}&limit=1&countrycodes=cl&accept-language=es`;

    const res = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'BuscaTuNido/1.0 (contacto@buscatunido.cl)',
        Accept: 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, statusCode: res.status, message: 'Error en servicio de geocodificación' },
        { status: res.status },
      );
    }

    const data = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({
        success: true,
        statusCode: 200,
        data: null,
      });
    }

    const first = data[0];
    const lat = Number.parseFloat(first.lat);
    const lng = Number.parseFloat(first.lon);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return NextResponse.json({
        success: true,
        statusCode: 200,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      statusCode: 200,
      data: {
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
        displayName: first.display_name ?? '',
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error interno al consultar geocodificación directa';
    return NextResponse.json({ success: false, statusCode: 500, message }, { status: 500 });
  }
}
