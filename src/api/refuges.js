// No backend implements GET /api/refuges (see docs/BACKEND_GAPS.md). This
// always serves bundled sample data - never a network call - so the Refuges
// page stays usable. SampleDataNotice tells the user it isn't live.
import refuges from './__fixtures__/refuges.json';

const FIXTURE_DELAY_MS = 250;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getRefuges({ types } = {}) {
  await delay(FIXTURE_DELAY_MS);

  const filtered =
    types && types.length ? refuges.refuges.filter((r) => types.includes(r.category)) : refuges.refuges;

  return { refuges: filtered, searchRadiusMetres: refuges.searchRadiusMetres };
}
