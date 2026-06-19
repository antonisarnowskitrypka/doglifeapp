import { latLngToCell, gridDisk } from 'h3-js'
// Relative (not `#shared`): that alias is type-only — it does NOT resolve at Nitro runtime.
import { RES, ringsFor } from '../../shared/utils/geo'

/**
 * H3 helpers that need the `h3-js` library — kept server-side so the binding never ships to the
 * client. The pure math (`RES`, `ringsFor`) lives in `shared/utils/geo.ts`. See dev-docs/36 & 13.
 */

/** The H3 cell containing a point, at the platform resolution. */
export function cellFor(lat: number, lng: number): string {
  return latLngToCell(lat, lng, RES)
}

/**
 * Precomputed H3 coverage for a point + reach radius (km), stored as `searchCells` on the
 * searchable doc and queried with `array-contains` (see [Search](dev-docs/13-search.md)).
 * Over-covers slightly; haversine is the source of truth at query time.
 */
export function searchCellsFor(lat: number, lng: number, radiusKm: number): string[] {
  return gridDisk(cellFor(lat, lng), ringsFor(radiusKm))
}
