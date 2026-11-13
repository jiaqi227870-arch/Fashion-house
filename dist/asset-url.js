// The standalone build replaces this resolver with embedded artwork.
export function staticAsset(name) {
  return `./assets/${name}`;
}
