import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import type { Channel } from './channels';
import { proxyUrl } from './channels';

interface PlayerProps {
  channel: Channel | null;
  onClose: () => void;
}

export default function Player({ channel, onClose }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<'loading' | 'playing' | 'error'>('loading');
  const [errMsg, setErrMsg] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [showBar, setShowBar] = useState(true);
  const [isFs, setIsFs] = useState(!!document.fullscreenElement);

  // Show the top bar and restart the 4-second hide timer
  const bumpBar = useCallback(() => {
    setShowBar(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowBar(false), 4000);
  }, []);

  // Start hiding once playing begins
  useEffect(() => {
    if (status === 'playing') bumpBar();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [status, bumpBar]);

  const startStream = useCallback(() => {
    if (!channel || !videoRef.current) return;
    setStatus('loading');
    setErrMsg('');

    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    const video = videoRef.current;
    video.src = '';

    const src = proxyUrl(channel.streamUrl, channel.referer);

    if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: false,
        maxBufferLength: 60,
        maxMaxBufferLength: 120,
        highBufferWatchdogPeriod: 5,
        fragLoadingTimeOut: 30000,
        manifestLoadingTimeOut: 30000,
        levelLoadingTimeOut: 30000,
        fragLoadingMaxRetry: 6,
        manifestLoadingMaxRetry: 4,
        levelLoadingMaxRetry: 4,
        fragLoadingRetryDelay: 1000,
        startFragPrefetch: true,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => {}); setStatus('playing'); });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setErrMsg(`${data.type}: ${data.details}`);
          setStatus('error');
          hls.destroy();
          hlsRef.current = null;
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.onloadedmetadata = () => { video.play().catch(() => {}); setStatus('playing'); };
      video.onerror = () => { setStatus('error'); setErrMsg('Stream unavailable'); };
    } else {
      setStatus('error');
      setErrMsg('HLS not supported in this browser');
    }
  }, [channel, retryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    startStream();
    return () => { hlsRef.current?.destroy(); hlsRef.current = null; };
  }, [startStream]);

  const toggleFullscreen = useCallback(() => {
    const el = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (el.webkitEnterFullscreen) {
      // iOS Safari: fullscreen on the video element itself
      el.webkitEnterFullscreen();
    } else {
      el.requestFullscreen?.();
    }
  }, []);

  // Track fullscreen state for the button icon
  useEffect(() => {
    const onChange = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Escape closes on desktop; TV remote Back is handled via popstate in App.tsx
  // Any keypress bumps the info bar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else {
        bumpBar();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, bumpBar]);

  if (!channel) return null;

  const alwaysShow = status !== 'playing';

  return (
    <div className="fs-player" onMouseMove={bumpBar} onClick={bumpBar} onTouchStart={bumpBar}>

      {/* Top info bar — auto-hides during playback */}
      <div className={`fs-topbar ${showBar || alwaysShow ? 'fs-topbar--visible' : ''}`}>
        <button className="fs-back" onClick={(e) => { e.stopPropagation(); onClose(); }}>‹ Back</button>
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
        <button className="fs-fullscreen-btn" onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} aria-label="Toggle fullscreen">
          {isFs ? '⤡' : '⤢'}
        </button>
        <div className="fs-brand"><span className="wm-ibk">IBK</span><span className="wm-tv">TV</span></div>
      </div>

      {/* Persistent IBK TV bug — always visible, survives native fullscreen */}
      <div className="ibk-bug" aria-hidden="true">
        <span className="ibk-bug-ibk">IBK</span><span className="ibk-bug-tv">TV</span>
      </div>

      {/* Video */}
      <video
        ref={videoRef}
        className="fs-video"
        controls
        autoPlay
        playsInline
        style={{ display: status === 'error' ? 'none' : 'block' }}
      />

      {/* Loading */}
      {status === 'loading' && (
        <div className="fs-msg">
          <div className="spinner" />
          <p>Connecting to stream…</p>
          <small>{channel.name} · {channel.country}</small>
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
          <button className="retry-btn" onClick={() => setRetryKey((k) => k + 1)}>↺ Retry</button>
          <button className="retry-btn back-btn" onClick={onClose}>‹ Go Back</button>
        </div>
      )}

    </div>
  );
}
