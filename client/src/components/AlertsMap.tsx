import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

export type AlertPriority = "Low" | "Medium" | "High" | "Critical";


export interface MapAlert {
  id: string | number;
  displayName: string;
  priority: string;

  lon: number;
  /** Latitude (קו רוחב), e.g. 32.08 for Tel Aviv */
  lat: number;
}

export interface AlertsMapProps {
  alerts: MapAlert[];
  /** Map height. The map needs an explicit height. Default: 520 */
  height?: number | string;
  className?: string;
}

const ISRAEL_BOUNDS: LatLngBoundsExpression = [
  [29.4, 34.2],
  [33.4, 35.95],
];

const TILES_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILES_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const PRIORITY_COLOR: Record<AlertPriority, string> = {
  Low: "#5fa8d3",
  Medium: "#e3c65a",
  High: "#f08a3c",
  Critical: "#ff4d4d",
};

const DEFAULT_COLOR = "#8497b0";
const getColor = (priority: string) => PRIORITY_COLOR[priority as AlertPriority] ?? DEFAULT_COLOR;

const PRIORITY_ORDER: AlertPriority[] = ["Low", "Medium", "High", "Critical"];

const CSS = `
.leaflet-tooltip.alerts-map-tooltip {
  background: #050a14;
  border: 1px solid #34506f;
  border-radius: 4px;
  color: #dce6f2;
  padding: 6px 10px;
  font: 12px system-ui, sans-serif;
  box-shadow: none;
}
.leaflet-tooltip-top.alerts-map-tooltip::before { border-top-color: #34506f; }
.alerts-map-tooltip-priority { display: flex; align-items: center; gap: 6px; color: #8497b0; }
.alerts-map-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
`;

export default function AlertsMap({ alerts, height = 520, className }: AlertsMapProps) {
  const sortedAlerts = useMemo(
    () =>
      alerts
        .filter((alert) => Number.isFinite(alert.lon) && Number.isFinite(alert.lat))
        .sort((a, b) => PRIORITY_ORDER.indexOf(a.priority as AlertPriority) - PRIORITY_ORDER.indexOf(b.priority as AlertPriority)),
    [alerts]
  );

  return (
    <div className={className} style={{ position: "relative", height, background: "#0a1220" }}>
      <style>{CSS}</style>

      <MapContainer
        bounds={ISRAEL_BOUNDS}
        minZoom={6}
        style={{ height: "100%", width: "100%", background: "#0a1220" }}
      >
        <TileLayer url={TILES_URL} attribution={TILES_ATTRIBUTION} />

        {sortedAlerts.map((alert) => {
          const color = getColor(alert.priority);
          const position: [number, number] = [alert.lat, alert.lon];
          const isCritical = alert.priority === "Critical";

          return (
            <span key={alert.id}>
              {isCritical && (
                <CircleMarker
                  center={position}
                  radius={15}
                  interactive={false}
                  pathOptions={{ color, weight: 1, opacity: 0.5, fillOpacity: 0.12 }}
                />
              )}
              <CircleMarker
                center={position}
                radius={isCritical ? 8 : 6}
                pathOptions={{ color: "#0a1220", weight: 1.5, fillColor: color, fillOpacity: 1 }}
              >
                <Tooltip direction="top" offset={[0, -8]} opacity={1} className="alerts-map-tooltip">
                  <div dir="auto" style={{ fontWeight: 600 }}>
                    {alert.displayName}
                  </div>
                  <div className="alerts-map-tooltip-priority">
                    <span className="alerts-map-dot" style={{ background: color }} />
                    {alert.priority}
                  </div>
                </Tooltip>
              </CircleMarker>
            </span>
          );
        })}
      </MapContainer>

      <ul
        style={{
          position: "absolute",
          left: 10,
          bottom: 24,
          zIndex: 1000,
          margin: 0,
          padding: "6px 8px",
          listStyle: "none",
          background: "rgba(10, 18, 32, 0.9)",
          border: "1px solid #16233a",
          borderRadius: 4,
          fontSize: 11,
          lineHeight: 1.5,
          color: "#8497b0",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {[...PRIORITY_ORDER].reverse().map((priority) => (
          <li key={priority} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="alerts-map-dot" style={{ background: PRIORITY_COLOR[priority] }} />
            {priority}
          </li>
        ))}
      </ul>
    </div>
  );
}
