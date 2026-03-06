import { useState, useEffect, useRef, useCallback } from 'react';
import { channels, categories } from './channels';
import type { Channel } from './channels';
import Player from './Player';
import './App.css';

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
  Sports: '⚽',
  'South Africa': '🇿🇦',
  Congo: '🇨🇩',
  Zambia: '🇿🇲',
};

function loadFavorites(): Set<string> {
  try {
    const saved = localStorage.getItem('ibktv-favorites');
    return new Set(saved ? JSON.parse(saved) : []);
  } catch {
    return new Set();
  }
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
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [search, setSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  // 'grid' = D-pad controls channel cards | 'cat' = D-pad controls category bar
  const [zone, setZone] = useState<'grid' | 'cat'>('grid');
  const [focusedCat, setFocusedCat] = useState(0);
  const [clock, setClock] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(loadFavorites);
  const [catOrder, setCatOrder] = useState<string[]>(loadCatOrder);
  const [catMoving, setCatMoving] = useState(false);
  const [showPrayer, setShowPrayer] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const dragCat = useRef<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const catRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const gridRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
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

  const filtered = channels.filter((ch) => {
    const matchCat =
      activeCategory === 'All'
        ? true
        : activeCategory === 'Favorites'
        ? favorites.has(ch.id)
        : ch.category === activeCategory;
    const matchSearch =
      ch.name.toLowerCase().includes(search.toLowerCase()) ||
      ch.country.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedChannel) return;
      if (document.activeElement === searchRef.current) return;

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
            // First row → go up to category bar
            setZone('cat');
            setFocusedCat(Math.max(catOrder.indexOf(activeCategory), 0));
          } else {
            setFocusedIndex((i) => Math.max(i - cols, 0));
          }
          break;
        case 'Enter':
          if (filtered[focusedIndex]) setSelectedChannel(filtered[focusedIndex]);
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
  }, [filtered, focusedIndex, focusedCat, zone, selectedChannel, activeCategory, getGridCols, catOrder, catMoving]);

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
        {zone === 'cat' && !catMoving && <span className="search-label"> · <em>←→ navigate · Enter to select · M to move</em></span>}
        {zone === 'cat' && catMoving && <span className="search-label"> · <em>←→ to move · Enter/M to confirm</em></span>}
      </div>

      <main className="grid" ref={gridRef}>
        {filtered.length === 0 && (
          <div className="empty">
            {activeCategory === 'Favorites' ? 'No favorites yet — press ❤️ on any channel.' : 'No channels found.'}
          </div>
        )}
        {filtered.map((ch, idx) => (
          <div
            key={ch.id}
            className={`channel-card ${idx === focusedIndex && zone === 'grid' ? 'focused' : ''}`}
            onClick={() => setSelectedChannel(ch)}
            onMouseEnter={() => { setFocusedIndex(idx); setZone('grid'); }}
            tabIndex={0}
          >
            <div className="live-badge">● LIVE</div>
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
        IBK-TV · ↑ to category bar · Enter to watch · F to favorite · M to reorder categories
      </footer>

      <Player channel={selectedChannel} onClose={() => window.history.back()} />

      {showPrayer && (
        <div className="prayer-overlay">
          <div className="prayer-box">
            <div className="prayer-flag" />
            <p className="prayer-text">🙏 Please pray for Mali for Peace 🙏</p>
          </div>
        </div>
      )}
    </div>
  );
}
