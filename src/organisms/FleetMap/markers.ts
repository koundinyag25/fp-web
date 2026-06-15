import { divIcon } from "leaflet";

// Leaflet marker glyphs for the fleet map. Pure (no React) — built once and
// reused per render. Colours are intentionally distinct so the vehicle dot never
// reads as a route endpoint.

// Distinct endpoint markers: a slate square for the start (origin), a green pin
// for the destination.
export const START_ICON = divIcon({
  className: "",
  html:
    '<div style="width:14px;height:14px;background:#94a3b8;border:2px solid #0b1326;' +
    'border-radius:3px;box-shadow:0 0 0 3px rgba(148,163,184,0.25)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export const END_ICON = divIcon({
  className: "",
  html:
    '<svg width="22" height="28" viewBox="0 0 24 24" fill="#22c55e" stroke="#0b1326" ' +
    'stroke-width="1.5" stroke-linejoin="round"><path d="M12 2C8.1 2 5 5.1 5 9c0 4.9 7 13 ' +
    '7 13s7-8.1 7-13c0-3.9-3.1-7-7-7z"/><circle cx="12" cy="9" r="2.6" fill="#0b1326"/></svg>',
  iconSize: [22, 28],
  iconAnchor: [11, 28],
});

// Driver marker: a truck glyph in a status-coloured disc (white ring when selected).
const TRUCK_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" ' +
  'stroke-linejoin="round" style="width:60%;height:60%"><path d="M14 18V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 ' +
  '1v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62' +
  'l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>';

export const truckIcon = (color: string, selected: boolean) => {
  const size = selected ? 30 : 24;
  return divIcon({
    className: "",
    html:
      `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};` +
      `border:2px solid ${selected ? "#ffffff" : "#0b1326"};display:flex;align-items:center;` +
      `justify-content:center;box-shadow:0 0 6px rgba(0,0,0,.55)">${TRUCK_SVG}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};
