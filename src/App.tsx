import { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { channels, categories, proxyUrl } from './channels';
import type { Channel } from './channels';
import './App.css';

const Player = lazy(() => import('./Player'));

const categoryIcons: Record<string, string> = {
  All: '📺',
  Favorites: '❤️',
  US: '🇺🇸',
  Mali: '🇲🇱',
  "Côte d'Ivoire": '🇨🇮',
  Niger: '🇳🇪',
  Sénégal: '🇸🇳',
  Guinée: '🇬🇳',
  Morocco: '🇲🇦',
  France: '🇫🇷',
  News: '📰',
  Animals: '🦁',
  Kids: '🧒',
  Congo: '🇨🇩',
  'Burkina Faso': '🇧🇫',
  Cameroun: '🇨🇲',
  Benin: '🇧🇯',
  Togo: '🇹🇬',
  Arabic: '🕌',
  Canada: '🇨🇦',
  Sports: '⚽',
  Ghana: '🇬🇭',
  Nigeria: '🇳🇬',
  Gambia: '🇬🇲',
  'Guinea-Bissau': '🇬🇼',
  'Sierra Leone': '🇸🇱',
  Kenya: '🇰🇪',
  Ethiopia: '🇪🇹',
  Tanzania: '🇹🇿',
  Egypt: '🇪🇬',
  Tunisia: '🇹🇳',
};

function loadFavorites(): Set<string> {
  try {
    const saved = localStorage.getItem('ibktv-favorites');
    return new Set(saved ? JSON.parse(saved) : []);
  } catch {
    return new Set();
  }
}

function loadRecent(): Channel[] {
  try {
    const saved = localStorage.getItem('ibktv-recent');
    const ids: string[] = saved ? JSON.parse(saved) : [];
    return ids.map(id => channels.find(c => c.id === id)).filter(Boolean) as Channel[];
  } catch {
    return [];
  }
}

function saveRecent(channel: Channel): Channel[] {
  try {
    const saved = localStorage.getItem('ibktv-recent');
    const ids: string[] = saved ? JSON.parse(saved) : [];
    const next = [channel.id, ...ids.filter(id => id !== channel.id)].slice(0, 10);
    localStorage.setItem('ibktv-recent', JSON.stringify(next));
    return next.map(id => channels.find(c => c.id === id)).filter(Boolean) as Channel[];
  } catch { return [channel]; }
}

function loadCatOrder(): string[] {
  try {
    const saved = localStorage.getItem('ibktv-cat-order');
    if (saved) {
      const parsed: string[] = JSON.parse(saved);
      const extras = categories.filter((c) => !parsed.includes(c));
      return [...parsed, ...extras];
    }
  } catch { /* ignore */ }
  return [...categories];
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [gridReady, setGridReady] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(() => {
    const id = new URLSearchParams(window.location.search).get('ch');
    return id ? (channels.find(c => c.id === id) ?? null) : null;
  });
  const [search, setSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [zone, setZone] = useState<'grid' | 'cat'>('grid');
  const [focusedCat, setFocusedCat] = useState(0);
  const [clock, setClock] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(loadFavorites);
  const [recent, setRecent] = useState<Channel[]>(loadRecent);
  const [catOrder, setCatOrder] = useState<string[]>(loadCatOrder);
  const [catMoving, setCatMoving] = useState(false);
  const [showPrayer, setShowPrayer] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [brokenIds, setBrokenIds] = useState<Set<string>>(() => {
    try {
      const WEEK = 7 * 24 * 60 * 60 * 1000;
      const raw = JSON.parse(localStorage.getItem('ibktv-broken') || '{}');
      // Support both legacy array and new {id: timestamp} formats
      if (Array.isArray(raw)) return new Set<string>(raw);
      const now = Date.now();
      const valid = Object.entries(raw as Record<string, number>)
        .filter(([, ts]) => now - ts < WEEK)
        .map(([id]) => id);
      return new Set<string>(valid);
    } catch { return new Set(); }
  });
  const [favToast, setFavToast] = useState('');
  const [cardMenuOpen, setCardMenuOpen] = useState(false);
  const [cardMenuChoice, setCardMenuChoice] = useState<'watch' | 'fav'>('watch');
  const [dragOver, setDragOver] = useState<string | null>(null);

  // Row-based nav (home view)
  const [focusedRow, setFocusedRow] = useState(0);
  const [focusedItemInRow, setFocusedItemInRow] = useState(0);

  const favToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragCat = useRef<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const catRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rowCardRefs = useRef<(HTMLDivElement | null)[][]>([]);
  const gridRef = useRef<HTMLElement>(null);

  // ── Derived: is the home feed visible (Netflix rows) ────────────
  const isHomeView = activeCategory === 'All' && !search;

  // ── Home rows: one row per category ─────────────────────────────
  const homeRows = useMemo(() => {
    const rows: { id: string; channels: Channel[] }[] = [];
    if (recent.length > 0) rows.push({ id: '__recent__', channels: recent });
    for (const cat of catOrder) {
      if (cat === 'All' || cat === 'Favorites') continue;
      const chs = channels.filter(c => c.category === cat);
      if (chs.length > 0) rows.push({ id: cat, channels: chs });
    }
    return rows;
  }, [recent, catOrder]);


  // ── Channel currently focused in home-row view ───────────────────
  const focusedHomeChannel = useMemo(() => {
    if (!isHomeView || !homeRows.length) return null;
    const row = homeRows[Math.min(focusedRow, homeRows.length - 1)];
    if (!row) return null;
    return row.channels[Math.min(focusedItemInRow, row.channels.length - 1)] || null;
  }, [isHomeView, homeRows, focusedRow, focusedItemInRow]);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setGridReady(true), 50);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' }));
    tick();
    const msUntilNextMinute = 60_000 - (Date.now() % 60_000);
    let recurId: ReturnType<typeof setTimeout>;
    const schedule = () => { tick(); recurId = setTimeout(schedule, 60_000); };
    const initialId = setTimeout(schedule, msUntilNextMinute);
    return () => { clearTimeout(initialId); clearTimeout(recurId!); };
  }, []);

  const onCatDragStart = useCallback((e: React.DragEvent) => {
    dragCat.current = (e.currentTarget as HTMLElement).dataset.cat ?? null;
  }, []);
  const onCatDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver((e.currentTarget as HTMLElement).dataset.cat ?? null);
  }, []);
  const onCatDrop = useCallback((e: React.DragEvent) => {
    const target = (e.currentTarget as HTMLElement).dataset.cat;
    const from = dragCat.current;
    setDragOver(null); dragCat.current = null;
    if (!from || !target || from === target) return;
    setCatOrder((prev) => {
      const next = [...prev];
      const fromIdx = next.indexOf(from);
      const toIdx = next.indexOf(target);
      next.splice(fromIdx, 1); next.splice(toIdx, 0, from);
      localStorage.setItem('ibktv-cat-order', JSON.stringify(next));
      return next;
    });
  }, []);
  const onCatDragEnd = useCallback(() => { setDragOver(null); dragCat.current = null; }, []);

  const showFavToast = useCallback((id: string, adding: boolean) => {
    const ch = channels.find(c => c.id === id);
    if (!ch) return;
    setFavToast(adding ? `❤ ${ch.name} added` : `💔 ${ch.name} removed`);
    if (favToastTimer.current) clearTimeout(favToastTimer.current);
    favToastTimer.current = setTimeout(() => setFavToast(''), 2500);
  }, []);

  const toggleFavorite = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const adding = !favorites.has(id);
    setFavorites((prev) => {
      const next = new Set(prev);
      if (adding) next.add(id); else next.delete(id);
      localStorage.setItem('ibktv-favorites', JSON.stringify([...next]));
      return next;
    });
    showFavToast(id, adding);
  }, [favorites, showFavToast]);

  const playChannel = useCallback((ch: Channel) => {
    setRecent(saveRecent(ch));
    setSelectedChannel(ch);
  }, []);

  const clearRecent = useCallback(() => {
    try { localStorage.removeItem('ibktv-recent'); } catch {}
    setRecent([]);
  }, []);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ch of channels) counts[ch.category] = (counts[ch.category] || 0) + 1;
    return counts;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return channels.filter((ch) => {
      const matchCat =
        activeCategory === 'All' ? true
        : activeCategory === 'Favorites' ? favorites.has(ch.id)
        : ch.category === activeCategory;
      return matchCat && (ch.name.toLowerCase().includes(q) || ch.country.toLowerCase().includes(q));
    });
  }, [activeCategory, favorites, search]);

  const selectedIdx = useMemo(
    () => selectedChannel ? filtered.findIndex(c => c.id === selectedChannel.id) : -1,
    [selectedChannel, filtered]
  );

  const onPrev = useCallback(() => {
    if (selectedIdx > 0) {
      const ch = filtered[selectedIdx - 1];
      setRecent(saveRecent(ch)); setSelectedChannel(ch);
    }
  }, [selectedIdx, filtered]);

  const onNext = useCallback(() => {
    if (selectedIdx < filtered.length - 1) {
      const ch = filtered[selectedIdx + 1];
      setRecent(saveRecent(ch)); setSelectedChannel(ch);
    }
  }, [selectedIdx, filtered]);

  const getGridCols = useCallback(() => {
    if (gridRef.current) {
      const cols = window.getComputedStyle(gridRef.current)
        .getPropertyValue('grid-template-columns').split(' ').length;
      if (cols > 0) return cols;
    }
    return Math.max(Math.floor(window.innerWidth / 165), 2);
  }, []);

  useEffect(() => {
    if (!selectedChannel) {
      try {
        const WEEK = 7 * 24 * 60 * 60 * 1000;
        const raw = JSON.parse(localStorage.getItem('ibktv-broken') || '{}');
        if (Array.isArray(raw)) { setBrokenIds(new Set<string>(raw)); return; }
        const now = Date.now();
        const valid = Object.entries(raw as Record<string, number>)
          .filter(([, ts]) => now - ts < WEEK).map(([id]) => id);
        setBrokenIds(new Set<string>(valid));
      } catch { /* ignore */ }
    }
  }, [selectedChannel]);

  // ── Keyboard navigation ──────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedChannel) return;
      if (document.activeElement === searchRef.current) {
        if (e.key === 'Escape') {
          e.preventDefault();
          if (search) { setSearch(''); } // first Escape: clear text
          else { searchRef.current?.blur(); setZone('cat'); } // second Escape: leave search
          return;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault(); searchRef.current?.blur(); setZone('cat');
        }
        return;
      }
      if (e.key === '?' || e.key === '/') { e.preventDefault(); setShowShortcuts(v => !v); return; }
      if (e.key === 'Escape') { if (showShortcuts) { setShowShortcuts(false); return; } }

      // Category bar
      if (zone === 'cat') {
        if (catMoving) {
          switch (e.key) {
            case 'ArrowRight':
              e.preventDefault();
              setCatOrder((prev) => {
                if (focusedCat >= prev.length - 1) return prev;
                const next = [...prev]; [next[focusedCat], next[focusedCat+1]] = [next[focusedCat+1], next[focusedCat]];
                localStorage.setItem('ibktv-cat-order', JSON.stringify(next)); return next;
              });
              setFocusedCat(i => Math.min(i+1, catOrder.length-1)); break;
            case 'ArrowLeft':
              e.preventDefault();
              setCatOrder((prev) => {
                if (focusedCat <= 0) return prev;
                const next = [...prev]; [next[focusedCat], next[focusedCat-1]] = [next[focusedCat-1], next[focusedCat]];
                localStorage.setItem('ibktv-cat-order', JSON.stringify(next)); return next;
              });
              setFocusedCat(i => Math.max(i-1, 0)); break;
            case 'Enter': case 'm': case 'Escape': e.preventDefault(); setCatMoving(false); break;
          }
          return;
        }
        switch (e.key) {
          case 'ArrowRight': e.preventDefault(); setFocusedCat(i => Math.min(i+1, catOrder.length-1)); break;
          case 'ArrowLeft':  e.preventDefault(); setFocusedCat(i => Math.max(i-1, 0)); break;
          case 'm':          e.preventDefault(); setCatMoving(true); break;
          case 'Enter':
            e.preventDefault();
            setActiveCategory(catOrder[focusedCat] === activeCategory ? 'All' : catOrder[focusedCat]);
            setZone('grid'); setFocusedIndex(0); setFocusedRow(0); setFocusedItemInRow(0); break;
          case 'ArrowDown':  e.preventDefault(); setZone('grid'); setFocusedIndex(0); break;
          case 'ArrowUp':    e.preventDefault(); searchRef.current?.focus(); break;
        }
        return;
      }

      // Home view: row-based D-pad
      if (isHomeView) {
        switch (e.key) {
          case 'ArrowRight':
            e.preventDefault();
            setFocusedItemInRow(i => {
              const row = homeRows[focusedRow];
              return row ? Math.min(i + 1, row.channels.length - 1) : i;
            });
            break;
          case 'ArrowLeft':
            e.preventDefault();
            setFocusedItemInRow(i => {
              // On __recent__ row, allow going to -1 to focus the Clear button
              const min = homeRows[focusedRow]?.id === '__recent__' ? -1 : 0;
              return Math.max(i - 1, min);
            });
            break;
          case 'ArrowDown': {
            e.preventDefault();
            const nextRowIdx = Math.min(focusedRow+1, homeRows.length-1);
            setFocusedRow(nextRowIdx);
            const nextRow = homeRows[nextRowIdx];
            if (nextRow) setFocusedItemInRow(i => Math.min(Math.max(i, 0), nextRow.channels.length-1));
            break;
          }
          case 'ArrowUp':
            e.preventDefault();
            if (focusedRow === 0) { setZone('cat'); }
            else {
              const prevRowIdx = Math.max(focusedRow-1, 0);
              setFocusedRow(prevRowIdx);
              const prevRow = homeRows[prevRowIdx];
              if (prevRow) setFocusedItemInRow(i => Math.min(Math.max(i, 0), prevRow.channels.length-1));
            }
            break;
          case 'Delete': case 'Backspace':
            e.preventDefault();
            if (homeRows[focusedRow]?.id === '__recent__') clearRecent();
            break;
          case 'Enter':
            e.preventDefault();
            if (e.repeat) break;
            // Clear button focused (index -1 on __recent__ row)
            if (focusedItemInRow === -1 && homeRows[focusedRow]?.id === '__recent__') { clearRecent(); break; }
            if (focusedHomeChannel) playChannel(focusedHomeChannel);
            break;
          case 'f': case 'F':
            e.preventDefault();
            if (focusedHomeChannel) {
              const id = focusedHomeChannel.id;
              const adding = !favorites.has(id);
              setFavorites((prev) => {
                const next = new Set(prev);
                if (adding) next.add(id); else next.delete(id);
                localStorage.setItem('ibktv-favorites', JSON.stringify([...next]));
                return next;
              });
              showFavToast(id, adding);
            }
            break;
          case 'c': case 'C':
            e.preventDefault();
            if (homeRows[focusedRow]?.id === '__recent__') clearRecent();
            break;
        }
        return;
      }

      // Grid view (category/search)
      if (filtered.length === 0) return;

      if (cardMenuOpen) {
        e.preventDefault();
        const ch = filtered[focusedIndex];
        switch (e.key) {
          case 'ArrowLeft': case 'ArrowRight':
            setCardMenuChoice(c => c === 'watch' ? 'fav' : 'watch'); break;
          case 'Enter':
            if (!e.repeat) {
              if (cardMenuChoice === 'watch' && ch) { playChannel(ch); }
              else if (ch) {
                const adding = !favorites.has(ch.id);
                setFavorites((prev) => {
                  const next = new Set(prev);
                  if (adding) next.add(ch.id); else next.delete(ch.id);
                  localStorage.setItem('ibktv-favorites', JSON.stringify([...next])); return next;
                });
                setFavToast(adding ? `❤ ${ch.name} added` : `💔 ${ch.name} removed`);
                if (favToastTimer.current) clearTimeout(favToastTimer.current);
                favToastTimer.current = setTimeout(() => setFavToast(''), 2500);
              }
              setCardMenuOpen(false);
            }
            break;
          case 'ArrowUp': case 'ArrowDown': case 'Escape': setCardMenuOpen(false); break;
        }
        return;
      }

      const cols = getGridCols();
      switch (e.key) {
        case 'ArrowRight': e.preventDefault(); setFocusedIndex(i => Math.min(i+1, filtered.length-1)); break;
        case 'ArrowLeft':  e.preventDefault(); setFocusedIndex(i => Math.max(i-1, 0)); break;
        case 'ArrowDown':  e.preventDefault(); setFocusedIndex(i => Math.min(i+cols, filtered.length-1)); break;
        case 'ArrowUp':
          e.preventDefault();
          if (focusedIndex < cols) { setZone('cat'); setFocusedCat(Math.max(catOrder.indexOf(activeCategory), 0)); }
          else setFocusedIndex(i => Math.max(i-cols, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (!e.repeat && filtered[focusedIndex]) { setCardMenuChoice('watch'); setCardMenuOpen(true); }
          break;
        case 'f': case 'F':
          e.preventDefault();
          if (filtered[focusedIndex]) {
            const id = filtered[focusedIndex].id;
            const adding = !favorites.has(id);
            setFavorites((prev) => {
              const next = new Set(prev);
              if (adding) next.add(id); else next.delete(id);
              localStorage.setItem('ibktv-favorites', JSON.stringify([...next])); return next;
            });
            showFavToast(id, adding);
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [
    filtered, focusedIndex, focusedCat, zone, selectedChannel, activeCategory,
    getGridCols, catOrder, catMoving, showShortcuts, cardMenuOpen, cardMenuChoice,
    favorites, isHomeView, homeRows, focusedRow, focusedItemInRow, focusedHomeChannel,
    playChannel, showFavToast, clearRecent,
  ]);

  useEffect(() => { setCardMenuOpen(false); }, [focusedIndex, activeCategory, search, selectedChannel]);
  useEffect(() => { setFocusedIndex(0); setFocusedRow(0); setFocusedItemInRow(0); }, [activeCategory, search]);

  useEffect(() => {
    if (zone === 'cat') catRefs.current[focusedCat]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [focusedCat, zone]);

  useEffect(() => {
    if (!isHomeView && zone === 'grid') {
      cardRefs.current[focusedIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [focusedIndex, zone, isHomeView]);

  // Scroll focused home row card into view
  useEffect(() => {
    if (isHomeView && zone === 'grid') {
      rowCardRefs.current[focusedRow]?.[focusedItemInRow]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [focusedRow, focusedItemInRow, isHomeView, zone]);

  useEffect(() => {
    if (selectedChannel && !sessionStorage.getItem('ibktv-prayer-shown')) {
      sessionStorage.setItem('ibktv-prayer-shown', '1');
      setShowPrayer(true);
      const t = setTimeout(() => setShowPrayer(false), 3000);
      return () => clearTimeout(t);
    }
  }, [selectedChannel]);

  useEffect(() => {
    if (!selectedChannel) return;
    const t = setTimeout(() => {
      const idx = filtered.findIndex(c => c.id === selectedChannel.id);
      const adjacent = [
        idx > 0 ? filtered[idx - 1] : null,
        idx < filtered.length - 1 ? filtered[idx + 1] : null,
      ].filter(Boolean) as Channel[];
      adjacent.forEach(ch => {
        fetch(proxyUrl(ch.streamUrl, ch.referer, ch.direct), { priority: 'low' } as RequestInit).catch(() => {});
      });
    }, 800);
    return () => clearTimeout(t);
  }, [selectedChannel, filtered]);

  useEffect(() => {
    if (selectedChannel) window.history.pushState({ ibktv: 'player' }, '');
  }, [selectedChannel]);

  useEffect(() => {
    const onPop = () => setSelectedChannel(null);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <div className="app">

      {/* ── Sticky top: header + category bar ────────────────────── */}
      <div className="sticky-top">
        <header className="header">
          <div className="brand">
            <div className="brand-flag" aria-label="Mali flag" />
            <div className="brand-text">
              <span className="brand-ibk">IBK</span>
              <span className="brand-tv">TV</span>
            </div>
          </div>
          <div className="search-wrap">
            <input
              ref={searchRef}
              className="search"
              type="text"
              tabIndex={0}
              placeholder="🔍  Search channels..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onMouseDown={(e) => { e.preventDefault(); setSearch(''); searchRef.current?.focus(); }} aria-label="Clear search">✕</button>
            )}
          </div>
          <div className="header-right">
            <div className="clock">{clock} <span className="clock-tz">ET</span></div>
            <button className="shortcuts-hint" onClick={() => setShowShortcuts(true)} title="Keyboard shortcuts (?)">?</button>
          </div>
        </header>

        <div className="categories-wrap">
          <nav className="categories">
            {catOrder.map((cat, idx) => (
              <button
                key={cat}
                ref={(el) => { catRefs.current[idx] = el; }}
                className={`cat-btn ${activeCategory === cat ? 'active' : ''} ${zone === 'cat' && focusedCat === idx ? 'cat-focused' : ''} ${zone === 'cat' && focusedCat === idx && catMoving ? 'cat-btn--moving' : ''} ${dragOver === cat ? 'cat-btn--dragover' : ''}`}
                draggable
                data-cat={cat}
                onDragStart={onCatDragStart}
                onDragOver={onCatDragOver}
                onDrop={onCatDrop}
                onDragEnd={onCatDragEnd}
                onClick={() => {
                  setActiveCategory(activeCategory === cat && cat !== 'All' ? 'All' : cat);
                  setZone('grid');
                }}
              >
                {categoryIcons[cat] || '📺'} {cat}
                {cat !== 'All' && cat !== 'Favorites' && (
                  <span className="cat-count">{catCounts[cat] || 0}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Offline banner ───────────────────────────────────────── */}
      {!isOnline && (
        <div className="no-internet">
          <div className="no-internet-icon">📡</div>
          <div className="no-internet-title">No Internet Connection</div>
          <div className="no-internet-sub">Check your Wi-Fi or cable and try again.</div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          HOME VIEW — Hero + Netflix-style rows
      ══════════════════════════════════════════════════════════ */}
      {isHomeView && (
        <>
          {/* Category rows */}
          <div className="rows-wrap">
            {homeRows.map((row, rowIdx) => (
              <section key={row.id} className="row-section">
                <div className="row-header">
                  <span className="row-title">
                    {row.id === '__recent__'
                      ? '🕐 Recently Watched'
                      : `${categoryIcons[row.id] || '📺'} ${row.id}`}
                  </span>
                  {row.id === '__recent__' ? (
                    <button
                      className={`row-clear ${zone === 'grid' && focusedRow === rowIdx ? 'row-clear--tv-hint' : ''} ${zone === 'grid' && focusedRow === rowIdx && focusedItemInRow === -1 ? 'row-clear--tv-focus' : ''}`}
                      onClick={clearRecent}
                    >
                      🗑 Clear {zone === 'grid' && focusedRow === rowIdx ? <span className="row-clear-hint">(press C / ←)</span> : null}
                    </button>
                  ) : (
                    <button
                      className="row-see-all"
                      onClick={() => { setActiveCategory(row.id); setZone('grid'); }}
                    >
                      See all →
                    </button>
                  )}
                </div>
                <div className="row-scroll">
                  {row.channels.map((ch, itemIdx) => {
                    const isFocused = zone === 'grid' && focusedRow === rowIdx && focusedItemInRow === itemIdx;
                    return (
                      <div
                        key={ch.id}
                        ref={(el) => {
                          if (!rowCardRefs.current[rowIdx]) rowCardRefs.current[rowIdx] = [];
                          rowCardRefs.current[rowIdx][itemIdx] = el;
                        }}
                        className={`row-card ${brokenIds.has(ch.id) ? 'row-card--broken' : ''} ${isFocused ? 'row-card--focused' : ''}`}
                        onClick={() => playChannel(ch)}
                        onMouseEnter={() => { setFocusedRow(rowIdx); setFocusedItemInRow(itemIdx); setZone('grid'); }}
                      >
                        {/* D-pad action menu */}
                        {isFocused && cardMenuOpen && (
                          <div className="card-menu">
                            <div className={`card-menu-opt ${cardMenuChoice === 'watch' ? 'card-menu-opt--active' : ''}`}>▶ Watch</div>
                            <div className={`card-menu-opt ${cardMenuChoice === 'fav' ? 'card-menu-opt--active' : ''}`}>
                              {favorites.has(ch.id) ? '💔 Unfav' : '❤ Fav'}
                            </div>
                          </div>
                        )}
                        <div className="row-card-art">
                          <img src={ch.logo} alt={ch.name} loading="lazy" decoding="async"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        </div>
                        <div className="row-card-overlay" />
                        <div className="row-live-badge">● LIVE</div>
                        <div className="row-card-info">
                          <div className="row-card-name">{ch.name}</div>
                          <div className="row-card-country">{ch.country}</div>
                        </div>
                        <button
                          className={`fav-btn ${favorites.has(ch.id) ? 'fav-btn--active' : ''}`}
                          onClick={(e) => toggleFavorite(ch.id, e)}
                          aria-label={favorites.has(ch.id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          {favorites.has(ch.id) ? '❤️' : '🤍'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}

            {homeRows.length === 0 && (
              <div className="empty" style={{ padding: '5rem 2rem' }}>
                No channels — add some favorites to get started.
              </div>
            )}
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════
          GRID VIEW — category selected or search results
      ══════════════════════════════════════════════════════════ */}
      {!isHomeView && (
        <>
          <div className="grid-header">
            {activeCategory !== 'All' && (
              <button className="back-chip" onClick={() => { setActiveCategory('All'); setZone('grid'); }}>
                ← All
              </button>
            )}
            <span className="grid-header-title">
              {search
                ? <>Results for "<em>{search}</em>"</>
                : <>{categoryIcons[activeCategory] || ''} {activeCategory}</>
              }
            </span>
            <span className="grid-header-count">{filtered.length} channel{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          <main className="grid" ref={gridRef}>
            {!gridReady && Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="channel-card skeleton-card">
                <div className="skeleton skeleton-logo" />
                <div className="skeleton-info">
                  <div className="skeleton skeleton-name" />
                  <div className="skeleton skeleton-meta" />
                </div>
              </div>
            ))}
            {gridReady && filtered.length === 0 && (
              <div className="empty">
                {activeCategory === 'Favorites' ? 'No favorites yet — press ❤️ on any channel.' : 'No channels found.'}
              </div>
            )}
            {gridReady && filtered.map((ch, idx) => (
              <div
                key={ch.id}
                ref={(el) => { cardRefs.current[idx] = el; }}
                className={`channel-card ${idx === focusedIndex && zone === 'grid' ? 'focused' : ''} ${brokenIds.has(ch.id) ? 'channel-card--broken' : ''}`}
                onClick={() => playChannel(ch)}
                onMouseEnter={() => { setFocusedIndex(idx); setZone('grid'); }}
                tabIndex={0}
              >
                <div className="live-badge">● LIVE</div>
                {idx === focusedIndex && zone === 'grid' && cardMenuOpen && (
                  <div className="card-menu">
                    <div className={`card-menu-opt ${cardMenuChoice === 'watch' ? 'card-menu-opt--active' : ''}`}>▶ Watch</div>
                    <div className={`card-menu-opt ${cardMenuChoice === 'fav' ? 'card-menu-opt--active' : ''}`}>
                      {favorites.has(ch.id) ? '💔 Unfav' : '❤ Fav'}
                    </div>
                  </div>
                )}
                <button
                  className={`fav-btn ${favorites.has(ch.id) ? 'fav-btn--active' : ''}`}
                  onClick={(e) => toggleFavorite(ch.id, e)}
                  aria-label={favorites.has(ch.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {favorites.has(ch.id) ? '❤️' : '🤍'}
                </button>
                <div className="card-logo-wrap">
                  <img
                    src={ch.logo}
                    alt={ch.name}
                    className="card-logo"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
                <div className="card-info">
                  <div className="card-name">{ch.name}</div>
                  <div className="card-meta">
                    <span className="cat-tag">{categoryIcons[ch.category] || ''} {ch.category}</span>
                  </div>
                  <div className="card-country">{ch.country}</div>
                </div>
              </div>
            ))}
          </main>
        </>
      )}

      {/* ── Player overlay ────────────────────────────────────────── */}
      <Suspense fallback={null}>
        <Player
          channel={selectedChannel}
          onClose={() => { setSelectedChannel(null); window.history.back(); }}
          hasPrev={selectedIdx > 0}
          hasNext={selectedIdx < filtered.length - 1}
          onPrev={onPrev}
          onNext={onNext}
        />
      </Suspense>

      {/* ── Prayer popup ──────────────────────────────────────────── */}
      {showPrayer && (
        <div className="prayer-overlay">
          <div className="prayer-box">
            <div className="prayer-flag" />
            <p className="prayer-text">🙏 Please pray for Mali for Peace 🙏</p>
          </div>
        </div>
      )}

      {/* ── Fav toast ─────────────────────────────────────────────── */}
      {favToast && <div className="fav-toast">{favToast}</div>}

      {/* ── Shortcuts modal ───────────────────────────────────────── */}
      {showShortcuts && (
        <div className="shortcuts-overlay" onClick={() => setShowShortcuts(false)}>
          <div className="shortcuts-box" onClick={(e) => e.stopPropagation()}>
            <div className="shortcuts-title">⌨️ Keyboard Shortcuts</div>
            <table className="shortcuts-table">
              <tbody>
                <tr><td>↑ ↓ ← →</td><td>Navigate channels / categories</td></tr>
                <tr><td>Enter</td><td>Watch channel</td></tr>
                <tr><td>F</td><td>Toggle favorite</td></tr>
                <tr><td>C</td><td>Clear recently watched</td></tr>
                <tr><td>M</td><td>Reorder categories (hold ← →)</td></tr>
                <tr><td>? or /</td><td>Show / hide this panel</td></tr>
                <tr className="shortcuts-divider"><td colSpan={2}>— In Player —</td></tr>
                <tr><td>Escape</td><td>Close player</td></tr>
                <tr><td>← →</td><td>Previous / Next channel</td></tr>
                <tr><td>↑ ↓</td><td>Volume up / down (±10%)</td></tr>
                <tr><td>Space</td><td>Play / Pause</td></tr>
                <tr><td>M</td><td>Mute / Unmute</td></tr>
                <tr><td>F</td><td>Toggle fullscreen</td></tr>
                <tr><td>⎘ Share</td><td>Copy channel link to clipboard</td></tr>
              </tbody>
            </table>
            <button className="shortcuts-close" onClick={() => setShowShortcuts(false)}>✕ Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
