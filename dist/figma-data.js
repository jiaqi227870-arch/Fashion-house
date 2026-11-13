import { staticAsset } from './asset-url.js';

// Editorial reference fixtures transcribed from the accessible Figma Make preview.
// These are illustrative artist profiles, not verified author attributions.
const records = [
  ['velvet-horizon','Velvet Horizon','Mia Tanaka','illustration','Gouache on watercolor paper','An exploration of feminine silhouettes against the tension of industrial backdrops.','figma-velvet-horizon.jpg','figma-mia-avatar.jpg'],
  ['chrome-bloom','Chrome Bloom','Zara Osei','illustration','Digital illustration, Procreate',"Merging botanical forms with futurist chrome finishes to imagine tomorrow's couture.",'figma-chrome-bloom.jpg','avatar-3.jpg'],
  ['neon-weave-no-7','Neon Weave No.7','Léa Dubois','textile','Hand-woven polyester & LED thread','Textile as light source — every thread carries electricity and intention.','figma-neon-weave.jpg','avatar-1.jpg'],
  ['redux-couture','Redux Couture','Sam Reeves','design','Upcycled denim, hand embroidery','Deconstructing the archive to rebuild something entirely new from discarded fashion.','figma-redux-couture.jpg','avatar-2.jpg'],
  ['stage-right','Stage Right','Nora Patel','costume','Latex, steel boning, tulle','The costume speaks before the actor does. Silence as power.','figma-stage-right.jpg','avatar-3.jpg'],
  ['pixel-drape','Pixel Drape','Kai Nakamura','digital','Blender 3D, Substance Painter','When fabric has no weight — designing purely for the eye, freed from physics.','figma-pixel-drape.jpg','avatar-4.jpg'],
  ['wire-dress','Wire Dress','Elena Vasquez','sculpture','Galvanized wire, organza','Structural femininity — a dress that holds its own shape, independent of the body.','figma-wire-dress.jpg','avatar-1.jpg'],
  ['portal-room','Portal Room','James Okoro','installation','Mixed media installation, fabric, projections','Enter the room and become part of the garment. You are both viewer and material.','figma-portal-room.jpg','avatar-4.jpg'],
  ['cut-copy-wear','Cut / Copy / Wear','Mira Vale','collage','Magazine fragments, tape & ink','Fragments become a new visual language. A collage study of fashion, identity, and possibility.','fashion-collage.png','avatar-1.jpg'],
  ['wear-another-world','Wear Another World','Jules Arden','virtual','Virtual garment & real-time environment','A wearable landscape designed for a body without gravity. The garment changes its horizon as the viewer moves around it.','virtual-study.png','avatar-5.jpg'],
];
export const figmaArtworks = records.map(([id,title,artist,category,media,statement,image,avatar],i)=>({id,title,artist,category,media,statement,image:staticAsset(image),avatar:staticAsset(avatar),year:2026,createdAt:Date.UTC(2026,8,30-i),demo:true}));
export const artworkAliases = {'soft-rebellion':'velvet-horizon','woven-static':'neon-weave-no-7','form-no-07':'redux-couture','body-without-body':'wire-dress','the-third-act':'stage-right','room-for-a-garment':'portal-room','rendered-in-motion':'pixel-drape','after-the-last-show':'chrome-bloom'};
