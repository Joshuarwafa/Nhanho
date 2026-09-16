/**
 * Location lookup helpers.
 *
 * Reverse geocoding currently goes through OpenStreetMap's free Nominatim API so
 * "use my current location" works with no API key. Swap `reverseGeocode` for the
 * Google Geocoding/Places API later — every caller only depends on this function's
 * signature, not the provider behind it.
 */

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  });
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`,
    { headers: { Accept: 'application/json' } }
  );
  if (!res.ok) throw new Error('Could not resolve an address for that location.');
  const data = (await res.json()) as { display_name?: string; error?: string };
  if (!data.display_name) throw new Error(data.error ?? 'Could not resolve an address for that location.');
  return data.display_name;
}

/** Detects the browser's current position and resolves it to a readable address. */
export async function locateCurrentAddress(): Promise<string> {
  const pos = await getCurrentPosition();
  return reverseGeocode(pos.coords.latitude, pos.coords.longitude);
}
