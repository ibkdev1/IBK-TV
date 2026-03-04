import { useState, useEffect, useRef } from 'react';
import { channels, categories } from './channels';
import type { Channel } from './channels';
import Player from './Player';
import './App.css';

const categoryIcons: Record<string, string> = {
  All: '📺',
  US: '🇺🇸',
  Mali: '🇲🇱',
  "Côte d'Ivoire": '🇨🇮',
  Niger: '🇳🇪',
  Sénégal: '🇸🇳',
  Guinée: '🇬🇳',
  Morocco: '🇲🇦',
  France: '🇫🇷',
  News: '📰',
};

export default function App() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [search, setSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [clock, setClock] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const filtered = channels.filter((ch) => {
    const matchCat = activeCategory === 'All' || ch.category === activeCategory;
    const matchSearch =
      ch.name.toLowerCase().includes(search.toLowerCase()) ||
      ch.country.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  useEffect(() => {
    const cols = Math.max(Math.floor(window.innerWidth / 220), 2);
    const handleKey = (e: KeyboardEvent) => {
      if (selectedChannel) return;
      if (document.activeElement === searchRef.current) return;
      switch (e.key) {
        case 'ArrowRight': setFocusedIndex((i) => Math.min(i + 1, filtered.length - 1)); break;
        case 'ArrowLeft': setFocusedIndex((i) => Math.max(i - 1, 0)); break;
        case 'ArrowDown': setFocusedIndex((i) => Math.min(i + cols, filtered.length - 1)); break;
        case 'ArrowUp': setFocusedIndex((i) => Math.max(i - cols, 0)); break;
        case 'Enter': if (filtered[focusedIndex]) setSelectedChannel(filtered[focusedIndex]); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [filtered, focusedIndex, selectedChannel]);

  useEffect(() => { setFocusedIndex(0); }, [activeCategory, search]);

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Flag_of_Mali.svg/80px-Flag_of_Mali.svg.png"
            alt="Mali flag"
            className="brand-flag"
          />
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

      <nav className="categories">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {categoryIcons[cat]} {cat}
          </button>
        ))}
      </nav>

      <div className="count-bar">
        <span>{filtered.length} channel{filtered.length !== 1 ? 's' : ''}</span>
        {search && <span className="search-label"> · results for "<em>{search}</em>"</span>}
      </div>

      <main className="grid">
        {filtered.length === 0 && <div className="empty">No channels found.</div>}
        {filtered.map((ch, idx) => (
          <div
            key={ch.id}
            className={`channel-card ${idx === focusedIndex ? 'focused' : ''}`}
            onClick={() => setSelectedChannel(ch)}
            onMouseEnter={() => setFocusedIndex(idx)}
            tabIndex={0}
          >
            <div className="live-badge">● LIVE</div>
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
        IBK-TV · Free Live Television · Use ↑↓←→ to navigate · Enter to watch
      </footer>

      <Player channel={selectedChannel} onClose={() => setSelectedChannel(null)} />
    </div>
  );
}
