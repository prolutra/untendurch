/**
 * Default point (centre of Switzerland, near Sachseln OW) the report form puts
 * the pin on when GPS is unavailable. Keep in sync with
 * packages/frontend/src/Store/FallbackPosition.ts.
 */
const FALLBACK = { latitude: 46.79871, longitude: 8.23176 };

/**
 * No watercourse lies within 100 m of the fallback point (nearest: Älggibach,
 * 100–250 m), so no real bridge can be reported there.
 */
const FALLBACK_RADIUS_KM = 0.1;

/**
 * Rejects saving a bridge without a position or on the GPS fallback point.
 * Only checked when the position is new or changed, so existing bridges that
 * already sit on the fallback point can still be edited (and moved away).
 */
export function bridgeVerifyPosition(
  request: Parse.Cloud.BeforeSaveRequest<Parse.Object<Parse.Attributes>>
) {
  const position = request.object.get('position') as
    | Parse.GeoPoint
    | undefined;

  if (!position) {
    throw new Parse.Error(
      Parse.Error.VALIDATION_ERROR,
      'Bridge position is required'
    );
  }

  const previous = request.original?.get('position') as
    | Parse.GeoPoint
    | undefined;
  const positionChanged =
    !previous ||
    previous.latitude !== position.latitude ||
    previous.longitude !== position.longitude;
  if (!positionChanged) return;

  const fallback = new Parse.GeoPoint(FALLBACK);
  if (position.kilometersTo(fallback) < FALLBACK_RADIUS_KM) {
    throw new Parse.Error(
      Parse.Error.VALIDATION_ERROR,
      'Bridge position is the GPS fallback point, not a real position'
    );
  }
}
