export type ServerGeoLocation = {
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  country: string | null;
};

export function extractServerGeoLocation(headersList: Headers): ServerGeoLocation {
  const rawCity =
    headersList.get('cf-ipcity') ??
    headersList.get('cloudfront-viewer-city') ??
    headersList.get('x-vercel-ip-city') ??
    headersList.get('fastly-client-city') ??
    headersList.get('x-geo-city') ??
    headersList.get('x-client-city');

  const rawLat =
    headersList.get('cf-iplatitude') ??
    headersList.get('cloudfront-viewer-latitude') ??
    headersList.get('x-vercel-ip-latitude') ??
    headersList.get('fastly-client-latitude') ??
    headersList.get('x-geo-lat') ??
    headersList.get('x-client-latitude');

  const rawLon =
    headersList.get('cf-iplongitude') ??
    headersList.get('cloudfront-viewer-longitude') ??
    headersList.get('x-vercel-ip-longitude') ??
    headersList.get('fastly-client-longitude') ??
    headersList.get('x-geo-lon') ??
    headersList.get('x-client-longitude');

  const rawCountry =
    headersList.get('cf-ipcountry') ??
    headersList.get('cloudfront-viewer-country-name') ??
    headersList.get('x-vercel-ip-country') ??
    headersList.get('x-geo-country');

  const latitude = rawLat ? Number.parseFloat(rawLat) : null;
  const longitude = rawLon ? Number.parseFloat(rawLon) : null;

  return {
    city: rawCity ? decodeURIComponent(rawCity).trim() : null,
    latitude: typeof latitude === 'number' && !Number.isNaN(latitude) ? latitude : null,
    longitude: typeof longitude === 'number' && !Number.isNaN(longitude) ? longitude : null,
    country: rawCountry ? rawCountry.trim() : null,
  };
}
