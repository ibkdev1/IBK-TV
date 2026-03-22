import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import type { Channel } from './channels';
import { proxyUrl } from './channels';

interface PlayerProps {
  channel: Channel | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

const SLEEP_OPTIONS = [30, 60, 90] as const;
const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

export default function Player({ channel, onClose, onPrev, onNext, hasPrev, hasNext }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sleepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoRetryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stallRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTimeRef = useRef<number>(0);
  const stallCountRef = useRef<number>(0);
  const usingBackupRef = useRef(false);
  // True once playback has started at least once — used to show mini vs full loading overlay
  const hasStartedRef = useRef(false);

  const [status, setStatus] = useState<'loading' | 'playing' | 'error'>('loading');
  const [errMsg, setErrMsg] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [showBar, setShowBar] = useState(true);
  const [isFs, setIsFs] = useState(!!document.fullscreenElement);
  const [reported, setReported] = useState(false);
  // Load volume from last session; default 1
  const [volume, setVolume] = useState<number>(() => {
    try { return parseFloat(localStorage.getItem('ibktv-volume') || '1'); } catch { return 1; }
  });
  const [muted, setMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sleepMins, setSleepMins] = useState<number | null>(null);
  const [sleepRemaining, setSleepRemaining] = useState<number>(0);
  const [showSleepPicker, setShowSleepPicker] = useState(false);
  const [isPip, setIsPip] = useState(false);
  const BROADCAST_MESSAGES = [
    '🇲🇱 Support Mali & the AES Alliance — Unity is Strength!',
    '📺 Enjoying IBK TV? Share it with friends and family!',
    '🌍 IBK TV — Free African & World TV, always live!',
  ];
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState(0);
  const broadcastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const broadcastIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const broadcastMsgIndexRef = useRef(0);

  // Show rotating broadcast messages: first at 30s, then every 15 minutes, shows for 20 seconds
  useEffect(() => {
    if (!channel) return;
    setShowBroadcast(false);
    broadcastMsgIndexRef.current = 0;
    if (broadcastTimerRef.current) clearTimeout(broadcastTimerRef.current);
    if (broadcastIntervalRef.current) clearInterval(broadcastIntervalRef.current);
    const show = () => {
      setBroadcastMsg(broadcastMsgIndexRef.current % BROADCAST_MESSAGES.length);
      broadcastMsgIndexRef.current += 1;
      setShowBroadcast(true);
      setTimeout(() => setShowBroadcast(false), 20_000);
    };
    broadcastTimerRef.current = setTimeout(() => {
      show();
      broadcastIntervalRef.current = setInterval(show, 5 * 60 * 1000);
    }, 30_000);
    return () => {
      if (broadcastTimerRef.current) clearTimeout(broadcastTimerRef.current);
      if (broadcastIntervalRef.current) clearInterval(broadcastIntervalRef.current);
    };
  }, [channel]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset state when channel changes
  useEffect(() => {
    setReported(false);
    usingBackupRef.current = false;
    hasStartedRef.current = false;
    setIsPaused(false);
  }, [channel]);

  // Show the top bar and restart the 4-second hide timer
  const bumpBar = useCallback(() => {
    setShowBar(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowBar(false), 4000);
  }, []);

  // Show the bar only on first load and first play.
  // Skip during stall recoveries (loading OR playing when hasStarted is already true)
  // so frequent stalls don't keep the hide timer from ever firing.
  useEffect(() => {
    if (status === 'error') return;
    if (hasStartedRef.current) return; // stall recovery — don't touch the timer
    bumpBar();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [status, bumpBar]);

  const enterIOSFullscreen = useCallback(() => {
    const el = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (el?.webkitEnterFullscreen) el.webkitEnterFullscreen();
  }, []);

  const startStream = useCallback(() => {
    if (!channel || !videoRef.current) return;
    setStatus('loading');
    setErrMsg('');

    if (stallRef.current) { clearInterval(stallRef.current); stallRef.current = null; }
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    const video = videoRef.current;
    video.src = '';
    video.volume = volume;
    video.muted = muted;
    lastTimeRef.current = 0;
    stallCountRef.current = 0;

    const src = (usingBackupRef.current && channel.backupUrl)
      ? proxyUrl(channel.backupUrl, channel.referer, channel.direct)
      : proxyUrl(channel.streamUrl, channel.referer, channel.direct);

    if (Hls.isSupported()) {
      const hls = new Hls({
        // ── Worker thread — offload parsing from main thread ──────────────
        enableWorker: true,

        // ── Buffer — small target so playback starts fast ─────────────────
        maxBufferLength:       10,
        maxMaxBufferLength:    20,
        backBufferLength:       5,
        maxBufferHole:         0.5,
        highBufferWatchdogPeriod: 0.5,

        // ── Start downloading next fragment before current one ends ───────
        startFragPrefetch: true,
        lowLatencyMode:    false,

        // ── Live stream — stay close to live edge ─────────────────────────
        liveSyncDurationCount:       2,
        liveMaxLatencyDurationCount: 4,

        // ── Fragment loading — fast retries ───────────────────────────────
        fragLoadingTimeOut:        12000,
        fragLoadingMaxRetry:       10,
        fragLoadingRetryDelay:     300,
        fragLoadingMaxRetryTimeout: 20000,

        // ── Manifest & level — retry aggressively ────────────────────────
        manifestLoadingTimeOut:  8000,
        manifestLoadingMaxRetry: 6,
        manifestLoadingRetryDelay: 300,
        levelLoadingTimeOut:     8000,
        levelLoadingMaxRetry:    6,
        levelLoadingRetryDelay:  300,

        // ── Stall recovery ────────────────────────────────────────────────
        nudgeOffset:         0.5,
        nudgeMaxRetry:       8,
        maxStarvationDelay:  2,
        maxLoadingDelay:     2,

        // ── ABR ───────────────────────────────────────────────────────────
        abrEwmaDefaultEstimate: 2_000_000,
        abrEwmaFastLive:        2,
        abrEwmaSlowLive:        6,
        abrBandWidthFactor:     0.90,
        abrBandWidthUpFactor:   0.80,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().then(() => {
          if (isIOS) enterIOSFullscreen();
          hasStartedRef.current = true;
        }).catch(() => {});
        setStatus('playing');
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            hlsRef.current = null;
            if (channel.backupUrl && !usingBackupRef.current) {
              usingBackupRef.current = true;
              setRetryKey((k) => k + 1);
            } else {
              setErrMsg(`${data.type}: ${data.details}`);
              setStatus('error');
              if (autoRetryRef.current) clearTimeout(autoRetryRef.current);
              autoRetryRef.current = setTimeout(() => setRetryKey((k) => k + 1), 5000);
            }
          }
        }
      });

      // Stall detector — nudge then reload
      stallRef.current = setInterval(() => {
        const v = videoRef.current;
        if (!v || v.paused || v.ended) return;
        if (v.currentTime === lastTimeRef.current) {
          stallCountRef.current += 1;
          if (stallCountRef.current >= 4) {
            setRetryKey((k) => k + 1);
            stallCountRef.current = 0;
          } else {
            v.currentTime += 0.5;
            v.play().catch(() => {});
          }
        } else {
          stallCountRef.current = 0;
        }
        lastTimeRef.current = v.currentTime;
      }, 3000);

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS (iOS Safari)
      video.src = src;
      video.onloadedmetadata = () => {
        video.play().then(() => {
          if (isIOS) enterIOSFullscreen();
          hasStartedRef.current = true;
        }).catch(() => {});
        setStatus('playing');
      };
      video.onerror = () => { setStatus('error'); setErrMsg('Stream unavailable'); };
    } else {
      setStatus('error');
      setErrMsg('HLS not supported in this browser');
    }
  }, [channel, retryKey, isIOS, enterIOSFullscreen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    startStream();
    return () => {
      if (stallRef.current) { clearInterval(stallRef.current); stallRef.current = null; }
      hlsRef.current?.destroy();
      hlsRef.current = null;
      if (autoRetryRef.current) clearTimeout(autoRetryRef.current);
    };
  }, [startStream]);

  // Sync volume/muted to video element
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = volume;
    v.muted = muted;
  }, [volume, muted]);

  // Persist volume across sessions
  useEffect(() => {
    try { localStorage.setItem('ibktv-volume', String(volume)); } catch {}
  }, [volume]);

  // Track play/pause state from the video element
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPause = () => setIsPaused(true);
    const onPlay  = () => setIsPaused(false);
    v.addEventListener('pause', onPause);
    v.addEventListener('play',  onPlay);
    return () => {
      v.removeEventListener('pause', onPause);
      v.removeEventListener('play',  onPlay);
    };
  }, []);

  // Sleep timer countdown
  useEffect(() => {
    if (sleepMins === null) {
      if (sleepIntervalRef.current) { clearInterval(sleepIntervalRef.current); sleepIntervalRef.current = null; }
      return;
    }
    const end = Date.now() + sleepMins * 60 * 1000;
    setSleepRemaining(sleepMins * 60);
    sleepIntervalRef.current = setInterval(() => {
      const left = Math.round((end - Date.now()) / 1000);
      if (left <= 0) {
        clearInterval(sleepIntervalRef.current!);
        sleepIntervalRef.current = null;
        setSleepMins(null);
        onClose();
      } else {
        setSleepRemaining(left);
      }
    }, 1000);
    return () => { if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current); };
  }, [sleepMins, onClose]);

  // PiP state sync
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onEnter = () => setIsPip(true);
    const onLeave = () => setIsPip(false);
    v.addEventListener('enterpictureinpicture', onEnter);
    v.addEventListener('leavepictureinpicture', onLeave);
    return () => {
      v.removeEventListener('enterpictureinpicture', onEnter);
      v.removeEventListener('leavepictureinpicture', onLeave);
    };
  }, []);

  const togglePip = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await v.requestPictureInPicture();
      }
    } catch { /* browser may block */ }
  }, []);

  const togglePlayPause = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
    bumpBar();
  }, [bumpBar]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    const container = playerRef.current;
    if (container?.requestFullscreen) {
      container.requestFullscreen();
    } else {
      const vid = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
      vid?.webkitEnterFullscreen?.();
    }
  }, []);

  // Track fullscreen state; restart hide timer on enter/exit
  useEffect(() => {
    const onChange = () => { setIsFs(!!document.fullscreenElement); bumpBar(); };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, [bumpBar]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!channel) return;
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onPrev?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNext?.();
          break;
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          setMuted((m) => !m);
          bumpBar();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'ArrowUp':
          e.preventDefault();
          bumpBar();
          break;
        case 'ArrowDown':
          e.preventDefault();
          bumpBar();
          break;
        case 'Enter':
          e.preventDefault();
          bumpBar();
          break;
        default:
          bumpBar();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [channel, onClose, onPrev, onNext, bumpBar, togglePlayPause, toggleFullscreen]);

  if (!channel) return null;

  // Only force the topbar visible on error (retry/back buttons must be reachable).
  const alwaysShow = status === 'error';

  const formatSleep = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div ref={playerRef} className="fs-player" onMouseMove={bumpBar} onClick={bumpBar} onTouchStart={bumpBar}>

      {/* Top info bar — auto-hides during playback */}
      <div className={`fs-topbar ${showBar || alwaysShow ? 'fs-topbar--visible' : ''}`}>
        <button tabIndex={0} className="fs-back" onClick={(e) => { e.stopPropagation(); onClose(); }}>‹ Back</button>

        {/* Prev / Next */}
        {hasPrev && (
          <button tabIndex={0} className="fs-nav-btn" onClick={(e) => { e.stopPropagation(); onPrev?.(); }} title="Previous channel (←)">⏮</button>
        )}
        {hasNext && (
          <button tabIndex={0} className="fs-nav-btn" onClick={(e) => { e.stopPropagation(); onNext?.(); }} title="Next channel (→)">⏭</button>
        )}

        {/* Play / Pause */}
        <button
          tabIndex={0}
          className="fs-playpause"
          onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
          title={isPaused ? 'Play (Space)' : 'Pause (Space)'}
        >
          {isPaused ? '▶' : '⏸'}
        </button>

        <img
          src={channel.logo}
          alt={channel.name}
          className="fs-ch-logo"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
        <div className="fs-ch-info">
          <div className="fs-ch-name">{channel.name}</div>
          <div className="fs-ch-sub">{channel.country} · {channel.language}</div>
        </div>
        <div className="fs-live-badge">● LIVE</div>

        {/* Sleep timer */}
        <div className="fs-sleep-wrap" onClick={(e) => e.stopPropagation()}>
          {sleepMins !== null ? (
            <button className="fs-sleep-btn fs-sleep-btn--active" onClick={() => setSleepMins(null)} title="Cancel sleep timer">
              ⏱ {formatSleep(sleepRemaining)}
            </button>
          ) : (
            <button
              className={`fs-sleep-btn ${showSleepPicker ? 'fs-sleep-btn--open' : ''}`}
              onClick={() => setShowSleepPicker((v) => !v)}
              title="Sleep timer"
            >
              ⏱
            </button>
          )}
          {showSleepPicker && sleepMins === null && (
            <div className="fs-sleep-picker">
              {SLEEP_OPTIONS.map((m) => (
                <button key={m} className="fs-sleep-option" onClick={() => { setSleepMins(m); setShowSleepPicker(false); }}>
                  {m} min
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Volume */}
        <div className="fs-vol-wrap" onClick={(e) => e.stopPropagation()}>
          <button className="fs-vol-icon" onClick={() => setMuted((m) => !m)} title={muted ? 'Unmute (M)' : 'Mute (M)'}>
            {muted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
          </button>
          <input
            type="range"
            className="fs-vol-slider"
            min={0} max={1} step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => { const v = parseFloat(e.target.value); setVolume(v); setMuted(v === 0); }}
          />
        </div>

        {/* PiP */}
        {document.pictureInPictureEnabled && (
          <button
            className={`fs-pip-btn ${isPip ? 'fs-pip-btn--active' : ''}`}
            onClick={(e) => { e.stopPropagation(); togglePip(); }}
            title="Picture in Picture"
          >
            ⧉
          </button>
        )}

        {/* Report broken */}
        <button
          className={`fs-report-btn ${reported ? 'fs-report-btn--done' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!reported && channel) {
              try {
                const broken: string[] = JSON.parse(localStorage.getItem('ibktv-broken') || '[]');
                if (!broken.includes(channel.id)) broken.push(channel.id);
                localStorage.setItem('ibktv-broken', JSON.stringify(broken));
              } catch { /* ignore */ }
              setReported(true);
            }
          }}
          title="Report this channel as broken"
        >
          {reported ? '✓ Reported' : '⚑ Broken?'}
        </button>

        {/* Fullscreen */}
        <button className="fs-fullscreen-btn" onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} aria-label="Toggle fullscreen (F)">
          {isFs ? '⤡' : '⤢'}
        </button>

        <div className="fs-brand"><span className="wm-ibk">IBK</span><span className="wm-tv">TV</span></div>
      </div>

      {/* Broadcast message banner */}
      {showBroadcast && (
        <div className="broadcast-banner">
          {BROADCAST_MESSAGES[broadcastMsg]}
        </div>
      )}

      {/* Persistent IBK TV watermark */}
      <div className="ibk-bug" aria-hidden="true">
        <span className="ibk-bug-ibk">IBK</span><span className="ibk-bug-tv">TV</span>
      </div>

      {/* Video */}
      <video
        ref={videoRef}
        className="fs-video"
        autoPlay
        playsInline={!isIOS}
        style={{ display: status === 'error' ? 'none' : 'block' }}
      />

      {/* First-load overlay — full screen spinner */}
      {status === 'loading' && !hasStartedRef.current && (
        <div className="fs-msg">
          <div className="spinner" />
          <p>Connecting to stream…</p>
          <small>{channel.name} · {channel.country}</small>
        </div>
      )}

      {/* Rebuffering indicator — small corner spinner, video stays visible */}
      {status === 'loading' && hasStartedRef.current && (
        <div className="fs-rebuf">
          <div className="spinner spinner--sm" />
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="fs-msg error">
          <p>⚠ Stream unavailable</p>
          <small>
            {errMsg.includes('manifestLoad')
              ? 'Could not connect to the stream. It may be offline or geo-restricted.'
              : errMsg.includes('levelLoad')
              ? 'Stream loaded but segments failed. Check your connection.'
              : errMsg || 'This channel may be temporarily offline.'}
          </small>
          <button tabIndex={0} className="retry-btn" onClick={() => setRetryKey((k) => k + 1)}>↺ Retry</button>
          <button tabIndex={0} className="retry-btn back-btn" onClick={onClose}>‹ Go Back</button>
        </div>
      )}

    </div>
  );
}
