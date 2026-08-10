// Presentation-only grouping of a route's crowd sections, for the text list
// on Route Detail (the map keeps drawing every raw section, since each has
// its own precise geometry). The backend returns many short GPS-derived
// fragments (a real route often has 9+ for a ~1.5km walk, several of them
// NO_DATA) - this merges CONSECUTIVE sections that share the same
// sensoryBand into readable stretches. It never changes, derives, or
// averages a band; a stretch's band is exactly the band every section in
// it already had.
export function mergeSections(sections) {
  const stretches = [];

  for (const section of sections) {
    const last = stretches[stretches.length - 1];

    if (last && last.sensoryBand === section.sensoryBand) {
      last.distanceMeters += section.distanceMeters;
      last.sectionIds.push(section.sectionId);
      for (const sensor of section.sensors) {
        if (!last.sensors.some((s) => s.locationId === sensor.locationId)) {
          last.sensors.push(sensor);
        }
      }
      continue;
    }

    stretches.push({
      key: section.sectionId,
      sensoryBand: section.sensoryBand,
      distanceMeters: section.distanceMeters,
      sectionIds: [section.sectionId],
      sensors: [...section.sensors],
    });
  }

  return stretches;
}
