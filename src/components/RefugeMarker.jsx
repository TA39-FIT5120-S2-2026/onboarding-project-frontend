import L from 'leaflet';
import { Marker } from 'react-leaflet';
import {
  REFUGE_CATEGORY_COLORS,
  REFUGE_CATEGORY_PATHS,
  refugeCategoryLabel,
} from '../utils/refugeCategories.js';

function createRefugeDivIcon(category) {
  const color = REFUGE_CATEGORY_COLORS[category] ?? REFUGE_CATEGORY_COLORS.quiet_space;
  const path = REFUGE_CATEGORY_PATHS[category] ?? REFUGE_CATEGORY_PATHS.quiet_space;

  return L.divIcon({
    className: 'refuge-marker-icon',
    html: `<span style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9999px;background:${color};color:#fff;box-shadow:0 1px 3px rgba(0,0,0,.35)"><svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="${path}"/></svg></span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export default function RefugeMarker({ refuge, onSelect }) {
  const accessibleName = `${refuge.name}, ${refugeCategoryLabel(refuge.category)}, ${refuge.walkingDistanceMetres} metres`;

  return (
    <Marker
      position={[refuge.lat, refuge.lng]}
      icon={createRefugeDivIcon(refuge.category)}
      keyboard
      eventHandlers={{
        click: () => onSelect?.(refuge),
        add: (event) => {
          const element = event.target.getElement?.();
          if (element) {
            element.setAttribute('role', 'button');
            element.setAttribute('aria-label', accessibleName);
          }
        },
      }}
    />
  );
}
