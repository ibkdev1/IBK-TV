import { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { channels, categories } from './channels';
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

function saveRecent(channel: Channel) {
  try {
    const saved = localStorage.getItem('ibktv-recent');
    const ids: string[] = saved ? JSON.parse(saved) : [];
    const next = [channel.id, ...ids.filter(id => id !== channel.id)].slice(0, 10);
    localStorage.setItem('ibktv-recent', JSON.stringify(next));
  } catch { /* ignore */ }
}

function loadCatOrder(): string[] {
  try {
    const saved = localStorage.getItem('ibktv-cat-order');
    if (saved) {
      const parsed: string[] = JSON.parse(saved);
      // Append any new categories not in the saved order
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
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [search, setSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  // 'grid' = D-pad controls channel cards | 'cat' = D-pad controls category bar
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
    try { return new Set(JSON.parse(localStorage.getItem('ibktv-broken') || '[]')); } catch { return new Set(); }
  });
  const [favToast, setFavToast] = useState('');
  const [cardMenuOpen, setCardMenuOpen] = useState(false);
  const [cardMenuChoice, setCardMenuChoice] = useState<'watch' | 'fav'>('watch');
  const [dragOver, setDragOver] = useState<string | null>(null);
  const dragCat = useRef<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const catRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const gridRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, []);

  // Defer grid render by one tick so the skeleton shows first
  useEffect(() => {
    const id = setTimeout(() => setGridReady(true), 300);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' }));
    tick();
    // Update only when the minute changes — avoids 60 re-renders/min
    const msUntilNextMinute = 60_000 - (Date.now() % 60_000);
    let recurId: ReturnType<typeof setTimeout>;
    const schedule = () => { tick(); recurId = setTimeout(schedule, 60_000); };
    const initialId = setTimeout(schedule, msUntilNextMinute);
    return () => { clearTimeout(initialId); clearTimeout(recurId!); };
  }, []);

  const onCatDragStart = useCallback((cat: string) => {
    dragCat.current = cat;
  }, []);

  const onCatDragOver = useCallback((e: React.DragEvent, cat: string) => {
    e.preventDefault();
    setDragOver(cat);
  }, []);

  const onCatDrop = useCallback((target: string) => {
    const from = dragCat.current;
    setDragOver(null);
    dragCat.current = null;
    if (!from || from === target) return;
    setCatOrder((prev) => {
      const next = [...prev];
      const fromIdx = next.indexOf(from);
      const toIdx = next.indexOf(target);
      next.splice(fromIdx, 1);
      next.splice(toIdx, 0, from);
      localStorage.setItem('ibktv-cat-order', JSON.stringify(next));
      return next;
    });
  }, []);

  const onCatDragEnd = useCallback(() => {
    setDragOver(null);
    dragCat.current = null;
  }, []);

  const toggleFavorite = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('ibktv-favorites', JSON.stringify([...next]));
      return next;
    });
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

  // Get actual rendered column count from the CSS grid
  const getGridCols = useCallback(() => {
    if (gridRef.current) {
      const cols = window.getComputedStyle(gridRef.current)
        .getPropertyValue('grid-template-columns')
        .split(' ').length;
      if (cols > 0) return cols;
    }
    return Math.max(Math.floor(window.innerWidth / 165), 2);
  }, []);

  // Refresh broken IDs when player closes (after user may have reported a channel)
  useEffect(() => {
    if (!selectedChannel) {
      try { setBrokenIds(new Set(JSON.parse(localStorage.getItem('ibktv-broken') || '[]'))); } catch { /* ignore */ }
    }
  }, [selectedChannel]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedChannel) return;
      if (document.activeElement === searchRef.current) return;

      if (e.key === '?' || e.key === '/') {
        e.preventDefault();
        setShowShortcuts((v) => !v);
        return;
      }
      if (e.key === 'Escape') {
        if (showShortcuts) { setShowShortcuts(false); return; }
      }

      if (zone === 'cat') {
        if (catMoving) {
          // Move mode: left/right shifts the category in the list
          switch (e.key) {
            case 'ArrowRight':
              e.preventDefault();
              setCatOrder((prev) => {
                if (focusedCat >= prev.length - 1) return prev;
                const next = [...prev];
                [next[focusedCat], next[focusedCat + 1]] = [next[focusedCat + 1], next[focusedCat]];
                localStorage.setItem('ibktv-cat-order', JSON.stringify(next));
                return next;
              });
              setFocusedCat((i) => Math.min(i + 1, catOrder.length - 1));
              break;
            case 'ArrowLeft':
              e.preventDefault();
              setCatOrder((prev) => {
                if (focusedCat <= 0) return prev;
                const next = [...prev];
                [next[focusedCat], next[focusedCat - 1]] = [next[focusedCat - 1], next[focusedCat]];
                localStorage.setItem('ibktv-cat-order', JSON.stringify(next));
                return next;
              });
              setFocusedCat((i) => Math.max(i - 1, 0));
              break;
            case 'Enter':
            case 'm':
            case 'Escape':
              e.preventDefault();
              setCatMoving(false);
              break;
          }
          return;
        }

        switch (e.key) {
          case 'ArrowRight':
            e.preventDefault();
            setFocusedCat((i) => Math.min(i + 1, catOrder.length - 1));
            break;
          case 'ArrowLeft':
            e.preventDefault();
            setFocusedCat((i) => Math.max(i - 1, 0));
            break;
          case 'm':
            e.preventDefault();
            setCatMoving(true);
            break;
          case 'Enter':
            e.preventDefault();
            if (catOrder[focusedCat] === activeCategory) {
              setActiveCategory('All');
            } else {
              setActiveCategory(catOrder[focusedCat]);
            }
            setZone('grid');
            setFocusedIndex(0);
            break;
          case 'ArrowDown':
            e.preventDefault();
            setZone('grid');
            setFocusedIndex(0);
            break;
          case 'ArrowUp':
            e.preventDefault();
            break;
        }
        return;
      }

      // zone === 'grid'
      if (filtered.length === 0) return;

      // If card action menu is open, intercept all keys
      if (cardMenuOpen) {
        e.preventDefault();
        const ch = filtered[focusedIndex];
        switch (e.key) {
          case 'ArrowLeft':
          case 'ArrowRight':
            setCardMenuChoice((c) => c === 'watch' ? 'fav' : 'watch');
            break;
          case 'Enter':
            if (!e.repeat) {
              if (cardMenuChoice === 'watch' && ch) {
                saveRecent(ch); setRecent(loadRecent()); setSelectedChannel(ch);
              } else if (ch) {
                const adding = !favorites.has(ch.id);
                setFavorites((prev) => {
                  const next = new Set(prev);
                  if (adding) next.add(ch.id); else next.delete(ch.id);
                  localStorage.setItem('ibktv-favorites', JSON.stringify([...next]));
                  return next;
                });
                setFavToast(adding ? `❤ ${ch.name} added` : `💔 ${ch.name} removed`);
                setTimeout(() => setFavToast(''), 2500);
              }
              setCardMenuOpen(false);
            }
            break;
          case 'ArrowUp':
          case 'ArrowDown':
          case 'Escape':
            setCardMenuOpen(false);
            break;
        }
        return;
      }

      const cols = getGridCols();

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex((i) => Math.min(i + 1, filtered.length - 1));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((i) => Math.min(i + cols, filtered.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (focusedIndex < cols) {
            setZone('cat');
            setFocusedCat(Math.max(catOrder.indexOf(activeCategory), 0));
          } else {
            setFocusedIndex((i) => Math.max(i - cols, 0));
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (!e.repeat && filtered[focusedIndex]) {
            setCardMenuChoice('watch');
            setCardMenuOpen(true);
          }
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          if (filtered[focusedIndex]) {
            const id = filtered[focusedIndex].id;
            setFavorites((prev) => {
              const next = new Set(prev);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              localStorage.setItem('ibktv-favorites', JSON.stringify([...next]));
              return next;
            });
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [filtered, focusedIndex, focusedCat, zone, selectedChannel, activeCategory, getGridCols, catOrder, catMoving, showShortcuts, cardMenuOpen, cardMenuChoice, favorites]);

  // Close card menu when focus moves away
  useEffect(() => { setCardMenuOpen(false); }, [focusedIndex, activeCategory, search, selectedChannel]);

  useEffect(() => { setFocusedIndex(0); }, [activeCategory, search]);

  // Auto-scroll focused category button into view when navigating with D-pad
  useEffect(() => {
    if (zone === 'cat') {
      catRefs.current[focusedCat]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [focusedCat, zone]);

  // Show prayer popup for 3s whenever a channel is opened
  useEffect(() => {
    if (selectedChannel) {
      setShowPrayer(true);
      const t = setTimeout(() => setShowPrayer(false), 3000);
      return () => clearTimeout(t);
    }
  }, [selectedChannel]);

  // Push a history entry when player opens so the TV remote Back button
  // pops it (instead of exiting the app entirely)
  useEffect(() => {
    if (selectedChannel) {
      window.history.pushState({ ibktv: 'player' }, '');
    }
  }, [selectedChannel]);

  useEffect(() => {
    const onPop = () => setSelectedChannel(null);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <div className="app">
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
            placeholder="🔍  Search channels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="clock">{clock}</div>
      </header>

      <div className="categories-wrap">
      <nav className="categories">
        {catOrder.map((cat, idx) => (
          <button
            key={cat}
            ref={(el) => { catRefs.current[idx] = el; }}
            className={`cat-btn ${activeCategory === cat ? 'active' : ''} ${zone === 'cat' && focusedCat === idx ? 'cat-focused' : ''} ${zone === 'cat' && focusedCat === idx && catMoving ? 'cat-btn--moving' : ''} ${dragOver === cat ? 'cat-btn--dragover' : ''}`}
            draggable
            onDragStart={() => onCatDragStart(cat)}
            onDragOver={(e) => onCatDragOver(e, cat)}
            onDrop={() => onCatDrop(cat)}
            onDragEnd={onCatDragEnd}
            onClick={() => {
              if (activeCategory === cat && cat !== 'All') {
                setActiveCategory('All');
              } else {
                setActiveCategory(cat);
              }
              setZone('grid');
            }}
          >
            {categoryIcons[cat]} {cat}
            {cat !== 'All' && cat !== 'Favorites' && (
              <span className="cat-count">
                {channels.filter(c => c.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </nav>
      </div>

      <div className="count-bar">
        {activeCategory !== 'All' && (
          <button className="back-chip" onClick={() => { setActiveCategory('All'); setZone('grid'); }}>
            ← All Channels
          </button>
        )}
        <span>{filtered.length} channel{filtered.length !== 1 ? 's' : ''}</span>
        {search && <span className="search-label"> · "<em>{search}</em>"</span>}
        {zone === 'grid' && !cardMenuOpen && <span className="search-label"> · <em>↵ = Watch/❤ menu</em></span>}
        {zone === 'grid' && cardMenuOpen && <span className="search-label"> · <em>← → to choose · ↵ confirm · ↑↓ cancel</em></span>}
        {zone === 'cat' && !catMoving && <span className="search-label"> · <em>←→ navigate · Enter to select · M to move</em></span>}
        {zone === 'cat' && catMoving && <span className="search-label"> · <em>←→ to move · Enter/M to confirm</em></span>}
      </div>

      {recent.length > 0 && activeCategory === 'All' && !search && (
        <div className="recent-wrap">
          <div className="recent-title">🕐 Recently Watched</div>
          <div className="recent-row">
            {recent.map(ch => (
              <div key={ch.id} className="recent-chip" onClick={() => { saveRecent(ch); setRecent(loadRecent()); setSelectedChannel(ch); }}>
                <img src={ch.logo} alt={ch.name} className="recent-logo" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <span>{ch.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isOnline && (
        <div className="no-internet">
          <div className="no-internet-icon">📡</div>
          <div className="no-internet-title">No Internet Connection</div>
          <div className="no-internet-sub">Check your Wi-Fi or cable and try again.</div>
        </div>
      )}

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
            className={`channel-card ${idx === focusedIndex && zone === 'grid' ? 'focused' : ''} ${brokenIds.has(ch.id) ? 'channel-card--broken' : ''}`}
            onClick={() => { saveRecent(ch); setRecent(loadRecent()); setSelectedChannel(ch); }}
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
              <div className="card-logo-fallback">{ch.name.slice(0, 3).toUpperCase()}</div>
            </div>
            <div className="card-info">
              <div className="card-name">{ch.name}</div>
              <div className="card-meta">
                <span className="cat-tag">{categoryIcons[ch.category]} {ch.category}</span>
              </div>
              <div className="card-country">{ch.country}</div>
            </div>
          </div>
        ))}
      </main>

      <footer className="footer">
        IBK-TV · ↑ to category bar · ↵ = Watch/❤ menu · M to reorder · <button className="shortcuts-hint" onClick={() => setShowShortcuts(true)}>? Shortcuts</button>
      </footer>

      {favToast && <div className="fav-toast">{favToast}</div>}

      <Suspense fallback={null}>
        <Player
          channel={selectedChannel}
          onClose={() => { setSelectedChannel(null); window.history.back(); }}
          hasPrev={selectedChannel ? filtered.findIndex(c => c.id === selectedChannel.id) > 0 : false}
          hasNext={selectedChannel ? filtered.findIndex(c => c.id === selectedChannel.id) < filtered.length - 1 : false}
          onPrev={() => {
            if (!selectedChannel) return;
            const idx = filtered.findIndex(c => c.id === selectedChannel.id);
            if (idx > 0) { const ch = filtered[idx - 1]; saveRecent(ch); setRecent(loadRecent()); setSelectedChannel(ch); }
          }}
          onNext={() => {
            if (!selectedChannel) return;
            const idx = filtered.findIndex(c => c.id === selectedChannel.id);
            if (idx < filtered.length - 1) { const ch = filtered[idx + 1]; saveRecent(ch); setRecent(loadRecent()); setSelectedChannel(ch); }
          }}
        />
      </Suspense>

      {showPrayer && (
        <div className="prayer-overlay">
          <div className="prayer-box">
            <div className="prayer-flag" />
            <p className="prayer-text">🙏 Please pray for Mali for Peace 🙏</p>
          </div>
        </div>
      )}

      {showShortcuts && (
        <div className="shortcuts-overlay" onClick={() => setShowShortcuts(false)}>
          <div className="shortcuts-box" onClick={(e) => e.stopPropagation()}>
            <div className="shortcuts-title">⌨️ Keyboard Shortcuts</div>
            <table className="shortcuts-table">
              <tbody>
                <tr><td>↑ ↓ ← →</td><td>Navigate channels / categories</td></tr>
                <tr><td>Enter</td><td>Watch channel</td></tr>
                <tr><td>F</td><td>Toggle favorite</td></tr>
                <tr><td>M</td><td>Reorder categories (hold ← →)</td></tr>
                <tr><td>? or /</td><td>Show / hide this panel</td></tr>
                <tr className="shortcuts-divider"><td colSpan={2}>— In Player —</td></tr>
                <tr><td>Escape</td><td>Close player / exit fullscreen</td></tr>
                <tr><td>← →</td><td>Previous / Next channel</td></tr>
                <tr><td>Space</td><td>Play / Pause</td></tr>
              </tbody>
            </table>
            <button className="shortcuts-close" onClick={() => setShowShortcuts(false)}>✕ Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
