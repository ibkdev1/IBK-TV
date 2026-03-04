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
  const [status, setStatus] = useState<'loading' | 'playing' | 'error'>('loading');
  const [errMsg, setErrMsg] = useState('');
  const [retryKey, setRetryKey] = useState(0); // incrementing forces stream restart

  const startStream = useCallback(() => {
    if (!channel || !videoRef.current) return;

    setStatus('loading');
    setErrMsg('');

    // Destroy any existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const video = videoRef.current;
    video.src = '';

    const src = proxyUrl(channel.streamUrl, channel.referer);

    if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: false,
        maxBufferLength: 20,
        maxMaxBufferLength: 40,
        fragLoadingTimeOut: 30000,
        manifestLoadingTimeOut: 30000,
        levelLoadingTimeOut: 30000,
        fragLoadingMaxRetry: 3,
        manifestLoadingMaxRetry: 3,
        levelLoadingMaxRetry: 3,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
        setStatus('playing');
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          const msg = `${data.type}: ${data.details}`;
          setErrMsg(msg);
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

  // Start stream when channel changes or retry is triggered
  useEffect(() => {
    startStream();
    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [startStream]);

  // Keyboard: Escape to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Backspace') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!channel) return null;

  return (
    <div className="player-overlay" onClick={onClose}>
      <div className="player-container" onClick={(e) => e.stopPropagation()}>

        <div className="player-header">
          <img
            src={channel.logo}
            alt={channel.name}
            className="player-logo"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
          <div className="player-info">
            <h2>{channel.name}</h2>
            <span>{channel.country} · {channel.language}</span>
          </div>
          <div className="player-live-badge">● LIVE</div>
          <button className="close-btn" onClick={onClose} title="Close (Esc)">✕</button>
        </div>

        <div className="video-wrapper">
          {status === 'loading' && (
            <div className="overlay-message">
              <div className="spinner" />
              <p>Connecting to stream...</p>
              <small>{channel.name} · {channel.country}</small>
            </div>
          )}

          {status === 'error' && (
            <div className="overlay-message error">
              <p>⚠ Stream unavailable</p>
              <small>
                {errMsg.includes('manifestLoad')
                  ? 'Could not connect to the stream server. It may be offline or geo-restricted.'
                  : errMsg.includes('levelLoad')
                  ? 'Stream loaded but segments failed. Check your connection.'
                  : errMsg || 'This channel may be temporarily offline.'}
              </small>
              <button
                className="retry-btn"
                onClick={() => setRetryKey((k) => k + 1)}
              >
                ↺ Retry
              </button>
            </div>
          )}

          <video
            ref={videoRef}
            className="video-player"
            controls
            autoPlay
            playsInline
            style={{ display: status === 'error' ? 'none' : 'block' }}
          />
        </div>

      </div>
    </div>
  );
}
