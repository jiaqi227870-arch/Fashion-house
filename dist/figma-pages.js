/* Pure page templates. Event wiring and persistent state remain in app.js. */
const safeText = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

function pageMarquee(icon) {
  const phrase = '<span>★ FASHION HOUSE ★ ART MEETS COUTURE ★ UPLOAD YOUR VISION ★ BROWSE THE ARCHIVE ★ DIGITAL COUTURE ★ Y2K FOREVER ★&nbsp;</span>';
  return `<div class="marquee figma-page-marquee" aria-label="Fashion House. Art meets couture. Upload your vision. Browse the archive."><div class="marquee-track" aria-hidden="true"><div class="marquee-set">${phrase}${phrase}</div><div class="marquee-set">${phrase}${phrase}</div></div><button class="marquee-control" type="button" aria-label="Pause marquee" aria-pressed="false">${icon('pause', 12)}</button></div>`;
}

export function collectionMarkup({ selected, categories = [], header, footer, button, icon, demoNote = '', esc = safeText }) {
  const categoryQuery = selected ? `?category=${encodeURIComponent(selected.id)}` : '';
  return `${header('collection')}
    <main id="main" tabindex="-1" class="collection-page">
      <section class="figma-collection-hero" aria-labelledby="collection-title">
        <p class="figma-category-kicker" data-reveal>${selected ? icon(selected.icon || selected.id, 15) : icon('grid', 15)}<span>CATEGORY / ${selected ? esc(selected.shortName || selected.name).toUpperCase() : 'ALL DISCIPLINES'}</span></p>
        <h1 id="collection-title" data-reveal style="--reveal-delay:60ms">${selected ? esc(selected.name) : 'All Artworks'}</h1>
        <p class="figma-collection-description" data-reveal style="--reveal-delay:110ms">${selected ? esc(selected.description) : 'Explore every form of fashion art. Discover new perspectives and find the work that speaks to you.'}</p>
        <div class="figma-collection-actions" data-reveal style="--reveal-delay:160ms">
          ${button('Upload Your Artwork', `#/upload${categoryQuery}`, 'figma-upload-button', 'upload')}
          ${button('Browse All Works', '#/collection', 'figma-browse-button', 'arrow-right')}
        </div>
      </section>
      ${pageMarquee(icon)}
      <section class="figma-collection-body collection-content" aria-labelledby="submissions-title">
        <div class="figma-submissions-heading">
          <div class="figma-submissions-title"><h2 id="submissions-title">Artist Submissions</h2><span id="result-count" role="status" aria-live="polite"></span></div>
          <div class="browse-modes" role="group" aria-label="Browse artworks">
            <button class="browse-mode" type="button" data-mode="curated" aria-pressed="true">ALL</button>
            <button class="browse-mode" type="button" data-mode="newest" aria-pressed="false">RECENT</button>
            <button class="browse-mode" type="button" data-mode="popular" aria-pressed="false">POPULAR</button>
          </div>
        </div>
        <div class="figma-collection-controls">
          <nav class="category-tabs" aria-label="Filter by art category">
            <a class="category-tab ${!selected ? 'active' : ''}" href="#/collection" ${!selected ? 'aria-current="page"' : ''}>All disciplines</a>
            ${categories.map(category => `<a class="category-tab ${selected?.id === category.id ? 'active' : ''}" href="#/collection?category=${encodeURIComponent(category.id)}" ${selected?.id === category.id ? 'aria-current="page"' : ''}>${esc(category.shortName || category.name)}</a>`).join('')}
          </nav>
          <div class="figma-search-sort">
            <label class="search-box">${icon('search', 15)}<input type="search" id="art-search" placeholder="Search artwork or artists" aria-label="Search artwork"></label>
            <select class="sort-select" id="art-sort" aria-label="Sort artwork"><option value="curated">Curated order</option><option value="newest">Recent</option><option value="popular">Popular here</option><option value="saved">Saved works</option><option value="title">Title: A–Z</option><option value="artist">Artist: A–Z</option></select>
            <button class="browse-mode figma-saved-mode" type="button" data-mode="saved" aria-pressed="false">SAVED</button>
          </div>
        </div>
        <p class="mode-help">POPULAR AND SAVED REFLECT THIS BROWSER</p>
        <div class="art-grid" id="collection-grid"></div>
        <p class="demo-note">${esc(demoNote)} Your uploads are saved in this browser.</p>
      </section>
    </main>${footer()}`;
}

export function uploadMarkup({ selected, categories = [], header, footer, icon, esc = safeText, lastCollection = '#/collection' }) {
  const selectedId = categories.some(category => category.id === selected?.id) ? selected.id : '';
  const imageIcon = '<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><rect x="5" y="5" width="38" height="38" rx="2"/><circle cx="16" cy="16" r="4"/><path d="m6 36 12-12 8 8 7-7 10 11"/></svg>';
  return `${header('upload')}
    <main id="main" tabindex="-1" class="upload-page">
      <section class="figma-upload-hero" aria-labelledby="upload-title">
        <a class="upload-return" href="${esc(lastCollection)}">${icon('arrow-left', 15)} Back to Gallery</a>
        <h1 id="upload-title" data-reveal><span>Upload</span><span>Your Work</span></h1>
        <p data-reveal style="--reveal-delay:80ms">Share your fashion art with the house. All artwork fields required.</p>
      </section>
      <div class="figma-upload-body">
        <form id="upload-form" class="upload-layout figma-upload-form">
          <div class="figma-upload-artwork" data-reveal>
            <label class="drop-zone" id="drop-zone" for="art-file">
              <input type="file" class="file-input" id="art-file" accept="image/jpeg,image/png,image/webp" aria-describedby="file-error file-storage-note">
              <div class="drop-zone-content"><span class="figma-image-icon">${imageIcon}</span><h2>Drop Image Here</h2><p class="file-spec">PNG, JPG, WEBP · MAX 20 MB</p><span class="figma-file-choice">CHOOSE FILE ${icon('arrow-up-right', 14)}</span></div>
            </label>
            <p id="file-error" class="form-error" role="alert"></p>
            <p class="figma-storage-note" id="file-storage-note">Saved in this browser only. Your artwork stays on this device and is not publicly published.</p>
            <p class="figma-image-guidance">Use a clear image of work you created or have permission to share. Gallery previews use a square crop; the artwork view keeps your original.</p>
          </div>
          <div class="figma-upload-fields" data-reveal style="--reveal-delay:100ms">
            <label class="field figma-field-title"><span class="field-label">TITLE OF ARTWORK *</span><input type="text" name="title" placeholder="Give your work a title" required maxlength="80"></label>
            <label class="field figma-field-artist"><span class="field-label">ARTIST NAME *</span><input type="text" name="artist" placeholder="Your name or creative alias" autocomplete="name" required maxlength="60"></label>
            <label class="field figma-field-media"><span class="field-label">MEDIA / TECHNIQUE *</span><input type="text" name="media" placeholder="e.g. Ink, silk, digital illustration" required maxlength="100"></label>
            <label class="field figma-field-statement"><span class="field-label">ARTIST STATEMENT * <span class="counter"><span id="statement-count">0</span> / 500</span></span><textarea name="statement" placeholder="Tell us about your inspiration, process, and the story behind your artwork…" maxlength="500" required rows="5"></textarea></label>
            <label class="field figma-field-category"><span class="field-label">CATEGORY *</span><select name="category" required><option value="" disabled ${!selectedId ? 'selected' : ''}>Select a category</option>${categories.map(category => `<option value="${esc(category.id)}" ${category.id === selectedId ? 'selected' : ''}>${esc(category.name)}</option>`).join('')}</select></label>
            <div class="artist-photo-field"><label class="photo-placeholder" for="artist-photo" id="avatar-preview">${icon('plus', 18)}</label><label for="artist-photo"><strong>Add your artist photo</strong><span>OPTIONAL · JPG, PNG, WEBP · MAX 2 MB</span><input id="artist-photo" class="file-input" type="file" accept="image/jpeg,image/png,image/webp"></label></div>
            <p class="form-error" id="form-error" role="alert"></p>
            <div class="form-actions"><button type="submit" class="button figma-submit-button" data-magnetic><span class="button-label">SUBMIT ARTWORK</span>${icon('arrow-right', 20)}</button><p>Added to your collection on this device.</p></div>
          </div>
        </form>
      </div>
    </main>${footer()}`;
}
