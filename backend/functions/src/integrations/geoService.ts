// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch: any = require("node-fetch");

export interface ReverseGeoResult { wardId: string | "unknown"; lat: number; lng: number; }

export class GeoService {
  constructor(private provider: "google"|"osm"|"local" = "local", private apiKey?: string) {}

  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeoResult> {
    try {
      if (this.provider === "google" && this.apiKey) {
        const resp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`);
        const data: any = await resp.json();
        // Simplified: map to wardId if component found; else unknown
        return {wardId: (data?.results?.[0]?.place_id || "unknown"), lat, lng};
      }
      // OSM or local stub
      return {wardId: "unknown", lat, lng};
    } catch {
      return {wardId: "unknown", lat, lng};
    }
  }
}


