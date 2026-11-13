export const sampleContentNote = 'Demo collection — fictional artwork and artist details. Images are editorial placeholders.';

export const categories = [
  { id: 'illustration', name: 'Fashion Illustration', shortName: 'Illustration', description: 'Artistic representations of clothing using various mediums.', icon: 'illustration' },
  { id: 'textile', name: 'Textile Design', shortName: 'Textile', description: 'Creating patterns and designs for fabrics.', icon: 'textile' },
  { id: 'design', name: 'Fashion Design', shortName: 'Design', description: 'The process of creating clothing and accessories, including sketches and prototypes.', icon: 'design' },
  { id: 'costume', name: 'Costume Design', shortName: 'Costume', description: 'Designing outfits for theatrical productions, films, or television.', icon: 'costume' },
  { id: 'sculpture', name: 'Fashion Sculpture', shortName: 'Sculpture', description: 'Three-dimensional representations of fashion, often using materials like fabric, metal, or plastic.', icon: 'sculpture' },
  { id: 'installation', name: 'Fashion Installation Art', shortName: 'Installation', description: 'Creating immersive environments that combine fashion with visual art, often displayed in galleries or exhibitions.', icon: 'installation' },
  { id: 'collage', name: 'Fashion Collage', shortName: 'Collage', description: 'Combining various materials, images, and textures to create a visual representation of fashion.', icon: 'collage' },
  { id: 'digital', name: 'Digital Fashion Art', shortName: 'Digital', description: 'Creating fashion designs and illustrations using digital tools and software.', icon: 'digital' },
  { id: 'virtual', name: 'Virtual Fashion', shortName: 'Virtual', description: 'Designing and showcasing fashion in virtual environments, such as video games or virtual reality.', icon: 'virtual' },
];

const photo = (id, width = 1000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
const portraits = [
  photo('photo-1534528741775-53994a69daeb', 160),
  photo('photo-1500648767791-00dcc994a43e', 160),
  photo('photo-1524504388940-b1c1722653e1', 160),
  photo('photo-1506794778202-cad84cf45f1d', 160),
  photo('photo-1531123897727-8f129e1688ce', 160),
  photo('photo-1506794778202-cad84cf45f1d', 160),
];

export const artworks = [
  {
    id: 'soft-rebellion', title: 'Soft Rebellion', artist: 'Mira Vale', category: 'illustration',
    media: 'Graphite, ink & gouache',
    statement: 'A study in the tension between a soft silhouette and a sharp gesture. The unfinished line leaves room for the wearer.',
    image: photo('photo-1539109136881-3be0616acf4b'), avatar: portraits[0], year: 2026,
  },
  {
    id: 'after-the-last-show', title: 'After the Last Show', artist: 'Noah Lin', category: 'illustration',
    media: 'Charcoal & chalk on paper',
    statement: 'Clothing becomes a memory of movement. These loose marks follow a figure just before it disappears from view.',
    image: photo('photo-1515886657613-9f3515b0c78f'), avatar: portraits[1], year: 2026,
  },
  {
    id: 'woven-static', title: 'Woven Static', artist: 'Ada Sol', category: 'textile',
    media: 'Handwoven cotton & recycled thread',
    statement: 'A quiet interference pattern built one thread at a time. Small irregularities turn a repeating grid into something human.',
    image: photo('photo-1558618666-fcd25c85cd64'), avatar: portraits[2], year: 2026,
  },
  {
    id: 'a-pattern-for-wandering', title: 'A Pattern for Wandering', artist: 'Eli Rook', category: 'textile',
    media: 'Screen print on linen',
    statement: 'Fragments of street markings become a print without a fixed beginning. Each repeat offers another route through the same city.',
    image: photo('photo-1452860606245-08befc0ff44b'), avatar: portraits[3], year: 2026,
  },
  {
    id: 'form-no-07', title: 'Form No. 07', artist: 'Jules Arden', category: 'design',
    media: 'Cotton twill, metal & pattern cutting',
    statement: 'A practical uniform interrupted by one unexpected fold. Structure gives way to the body instead of asking the body to comply.',
    image: photo('photo-1490481651871-ab68de25d43d'), avatar: portraits[4], year: 2026,
  },
  {
    id: 'unfastened', title: 'Unfastened', artist: 'Ren Mori', category: 'design',
    media: 'Deadstock wool & modular fastenings',
    statement: 'An adaptable garment assembled around the idea of change. Its pieces can be rearranged as the day takes a different shape.',
    image: photo('photo-1551232864-3f0890e580d9'), avatar: portraits[5], year: 2026,
  },
  {
    id: 'the-third-act', title: 'The Third Act', artist: 'Mira Vale', category: 'costume',
    media: 'Silk organza, tulle & hand beading',
    statement: 'A character is revealed through layers that catch and release the light. The costume holds the pause before a decisive entrance.',
    image: photo('photo-1566206091558-7f218b696731'), avatar: portraits[0], year: 2026,
  },
  {
    id: 'midnight-rehearsal', title: 'Midnight Rehearsal', artist: 'Noah Lin', category: 'costume',
    media: 'Velvet, pleated satin & costume studies',
    statement: 'An imagined stage wardrobe for a city that never quite sleeps. Familiar evening shapes acquire an exaggerated theatrical edge.',
    image: photo('photo-1595777457583-95e059d581b8'), avatar: portraits[1], year: 2026,
  },
  {
    id: 'body-without-body', title: 'Body / Without Body', artist: 'Ada Sol', category: 'sculpture',
    media: 'Folded fabric & stainless-steel armature',
    statement: 'A garment remembers an absent body. Its folds remain suspended between a useful object and an independent form.',
    image: photo('photo-1578749556568-bc2c40e68b61'), avatar: portraits[2], year: 2026,
  },
  {
    id: 'held-in-a-fold', title: 'Held in a Fold', artist: 'Eli Rook', category: 'sculpture',
    media: 'Reclaimed metal & coated canvas',
    statement: 'A permanent crease turns an everyday material into a monument. Weight and softness exchange their usual roles.',
    image: photo('photo-1579783902614-a3fb3927b6a5'), avatar: portraits[3], year: 2026,
  },
  {
    id: 'room-for-a-garment', title: 'Room for a Garment', artist: 'Jules Arden', category: 'installation',
    media: 'Hanging textiles, light & spatial sound',
    statement: 'Visitors move through a wardrobe expanded to architectural scale. Every hanging surface changes the way the room is heard and felt.',
    image: photo('photo-1577083552431-6e5fd01aa342'), avatar: portraits[4], year: 2026,
  },
  {
    id: 'the-fitting-room', title: 'The Fitting Room', artist: 'Ren Mori', category: 'installation',
    media: 'Mirrors, muslin & found clothing rails',
    statement: 'A familiar private ritual becomes a shared environment. Reflections ask how much of a garment belongs to the person looking at it.',
    image: photo('photo-1441986300917-64674bd600d8'), avatar: portraits[5], year: 2026,
  },
  {
    id: 'cut-copy-wear', title: 'Cut / Copy / Wear', artist: 'Mira Vale', category: 'collage',
    media: 'Magazine fragments, tape & ink',
    statement: 'An impossible outfit made from the residue of fashion imagery. Visible seams celebrate the act of piecing an identity together.',
    image: photo('photo-1483985988355-763728e1935b'), avatar: portraits[0], year: 2026,
  },
  {
    id: 'paper-skin', title: 'Paper Skin', artist: 'Noah Lin', category: 'collage',
    media: 'Torn paper, fabric scraps & acrylic',
    statement: 'Paper and fabric share a surface, each carrying traces of a previous life. The figure emerges only where their edges meet.',
    image: photo('photo-1547826039-bfc35e0f1ea8'), avatar: portraits[1], year: 2026,
  },
  {
    id: 'rendered-in-motion', title: 'Rendered in Motion', artist: 'Ada Sol', category: 'digital',
    media: 'Digital painting & 3D garment study',
    statement: 'A silhouette is captured between two possible states. Digital tools make the fabric behave like a thought still being formed.',
    image: photo('photo-1536924940846-227afb31e2a5'), avatar: portraits[2], year: 2026,
  },
  {
    id: 'pixel-tailoring', title: 'Pixel Tailoring', artist: 'Eli Rook', category: 'digital',
    media: 'Vector drawing & procedural textures',
    statement: 'Tailoring is translated into grids, curves and deliberate errors. Each digital seam keeps the evidence of its construction visible.',
    image: photo('photo-1550745165-9bc0b252726f'), avatar: portraits[3], year: 2026,
  },
  {
    id: 'wear-another-world', title: 'Wear Another World', artist: 'Jules Arden', category: 'virtual',
    media: 'Virtual garment & real-time environment',
    statement: 'A wearable landscape designed for a body without gravity. The garment changes its horizon as the viewer moves around it.',
    image: photo('photo-1634017839464-5c339ebe3cb4'), avatar: portraits[4], year: 2026,
  },
  {
    id: 'ghost-in-the-wardrobe', title: 'Ghost in the Wardrobe', artist: 'Ren Mori', category: 'virtual',
    media: '3D simulation & avatar styling',
    statement: 'A virtual wardrobe preserves the feeling of clothes after their physical limits disappear. Translucent layers shift between presence and possibility.',
    image: photo('photo-1617791160536-598cf32026fb'), avatar: portraits[5], year: 2026,
  },
];

const paths = {
  illustration: '<path d="m14 3 7 7-9 9-7 2 2-7 7-11Z"/><path d="m14 3 1 6 6 1M7 14l5 5m-7 2 6-6"/><circle cx="12" cy="12" r="1.5"/>',
  textile: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M8 2v20m4-20v20m4-20v20M2 8h20M2 12h20M2 16h20"/>',
  design: '<path d="m9 3-1 4 2 4-5 9h14l-5-9 2-4-1-4M9 3h6M8 7h8m-6 4h4M8 15h8"/>',
  costume: '<path d="M3 7s4 2 9 2 9-2 9-2v5c0 5-5 8-9 10-4-2-9-5-9-10V7Z"/><path d="m6 12 3 1m6 0 3-1m-9 5c2-1 4-1 6 0M6 3l2 5m4-7v8m6-6-2 5"/>',
  sculpture: '<path d="m12 3 6 8-3 7H9l-3-7 6-8Zm0 0v15M6 11h12m-9 7-3 3h12l-3-3"/>',
  installation: '<path d="M3 21V7l9-4 9 4v14M3 7l9 5 9-5M12 12v9M6 19l6-3 6 3"/><path d="M7 9v5m10-5v5"/>',
  collage: '<path d="m4 4 11-1 1 8-9 2-3-9Z"/><path d="m11 9 9 1 1 11-12-1 2-11Z"/><path d="m3 14 5 1-1 6-5-1 1-6Zm10-1 4 4m-4 0 4-4"/>',
  digital: '<rect x="3" y="3" width="18" height="14" rx="1"/><path d="M8 21h8m-4-4v4M6 7h4v4H6zm8 3h4v4h-4z"/>',
  virtual: '<path d="M4 7h16l2 9-4 2-4-4h-4l-4 4-4-2 2-9Z"/><path d="M6 10h3v3H6zm9 0h3v3h-3zM7 4l5-2 5 2"/>',
  'arrow-up-right': '<path d="M5 19 19 5M5 5h14v14"/>',
  'arrow-right': '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  'arrow-left': '<path d="M20 12H4m6-6-6 6 6 6"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  upload: '<path d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
  pause: '<path d="M8 4v16M16 4v16"/>',
  play: '<path d="m7 4 13 8-13 8V4Z"/>',
};

export function icon(name, size = 24) {
  const dimension = Number.isFinite(Number(size)) ? Math.min(128, Math.max(8, Number(size))) : 24;
  const drawing = Object.prototype.hasOwnProperty.call(paths, name) ? paths[name] : paths['arrow-up-right'];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${dimension}" height="${dimension}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${drawing}</svg>`;
}
