import { NextResponse } from 'next/server';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');

    if (!latStr || !lngStr) {
      return NextResponse.json(
        { success: false, statusCode: 400, message: 'Coordenadas lat y lng requeridas' },
        { status: 400 },
      );
    }

    const lat = Number.parseFloat(latStr);
    const lng = Number.parseFloat(lngStr);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return NextResponse.json(
        { success: false, statusCode: 400, message: 'Coordenadas inválidas' },
        { status: 400 },
      );
    }

    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`;

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

    const data = (await res.json()) as {
      display_name?: string;
      address?: Record<string, string>;
    };

    const addr = data.address ?? {};
    const road =
      addr.road ||
      addr.pedestrian ||
      addr.footway ||
      addr.cycleway ||
      addr.path ||
      addr.street ||
      addr.residential ||
      '';
    const houseNumber = addr.house_number || '';
    const address = road ? (houseNumber ? `${road} ${houseNumber}` : road) : '';

    const neighborhood =
      addr.suburb ||
      addr.neighbourhood ||
      addr.quarter ||
      addr.city_district ||
      addr.borough ||
      addr.municipality ||
      '';

    const city = addr.city || addr.town || addr.municipality || addr.village || addr.county || '';

    return NextResponse.json({
      success: true,
      statusCode: 200,
      data: {
        address,
        neighborhood,
        city,
        displayName: data.display_name ?? '',
        rawAddress: addr,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error interno al consultar geocodificación inversa';
    return NextResponse.json({ success: false, statusCode: 500, message }, { status: 500 });
  }
}
