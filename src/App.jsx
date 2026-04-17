import React, { useState, useEffect, useCallback } from 'react';
import BulbDigit   from './components/BulbDigit';
import AdminModal  from './components/AdminModal';
import './App.css';

// ─── Marquee border ──────────────────────────────────────────────────────────
// The sign has a fixed pixel size so we can place individual bulb dots around
// the perimeter with staggered CSS animation delays, creating a chase effect.
const SIGN_W    = 680;
const SIGN_H    = 460;
const MQ_SPACE  = 34;   // px between bulb centres
const MQ_MARGIN = 14;   // px from sign edge to bulb centre

function buildMarqueeBulbs() {
  const bulbs = [];
  let idx = 0;
  const push = (x, y) => bulbs.push({ x, y, idx: idx++ });

  // Top: left → right
  for (let x = MQ_MARGIN; x <= SIGN_W - MQ_MARGIN; x += MQ_SPACE) push(x, MQ_MARGIN);
  // Right: top → bottom (skip already-placed top-right corner)
  for (let y = MQ_MARGIN + MQ_SPACE; y <= SIGN_H - MQ_MARGIN; y += MQ_SPACE) push(SIGN_W - MQ_MARGIN, y);
  // Bottom: right → left (skip corners)
  for (let x = SIGN_W - MQ_MARGIN - MQ_SPACE; x >= MQ_MARGIN; x -= MQ_SPACE) push(x, SIGN_H - MQ_MARGIN);
  // Left: bottom → top (skip corners)
  for (let y = SIGN_H - MQ_MARGIN - MQ_SPACE; y > MQ_MARGIN; y -= MQ_SPACE) push(MQ_MARGIN, y);

  return bulbs;
}

const MARQUEE_BULBS = buildMarqueeBulbs();
const MARQUEE_CYCLE = 1.4; // seconds for one full chase cycle

function MarqueeBorder() {
  const total = MARQUEE_BULBS.length;
  return (
    <div className="marquee-border" aria-hidden="true">
      {MARQUEE_BULBS.map(({ x, y, idx }) => (
        <span
          key={idx}
          className="marquee-bulb"
          style={{
            left: x,
            top:  y,
            // negative delay so all bulbs are "mid-animation" on first paint
            animationDelay: `${-((idx / total) * MARQUEE_CYCLE).toFixed(3)}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Main app ────────────────────────────────────────────────────────────────
export default function App() {
  const [days,      setDays]      = useState(null);
  const [error,     setError]     = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

  const fetchDays = useCallback(async () => {
    try {
      const res = await fetch('/api/counter');
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      setDays(data.days);
      setError(null);
    } catch {
      setError('CONNECTION\nERROR');
    }
  }, []);

  useEffect(() => {
    fetchDays();
    const id = setInterval(fetchDays, 60_000); // re-check every minute
    return () => clearInterval(id);
  }, [fetchDays]);

  // Display up to 99; show overflow note above if more
  const display  = Math.min(days ?? 0, 99);
  const tens     = Math.floor(display / 10);
  const units    = display % 10;
  const overflow = days !== null && days > 99;

  return (
    <div className="app">
      {/* Ambient radial glow behind the sign */}
      <div className="bg-glow" aria-hidden="true" />

      <div className="sign">
        <MarqueeBorder />

        <div className="sign-content">
          <p className="sign-eyebrow">OFFICIAL RECORD · EST. TODAY</p>

          <h1 className="sign-title">
            DAYS SINCE<br />MY LAST DUMB
          </h1>

          <div className="digit-display">
            {error ? (
              <p className="status-text">{error}</p>
            ) : days === null ? (
              <p className="status-text">LOADING…</p>
            ) : (
              <>
                <div className="digit-wrapper">
                  <BulbDigit digit={tens}  index={0} />
                </div>
                <div className="digit-separator" />
                <div className="digit-wrapper">
                  <BulbDigit digit={units} index={1} />
                </div>
              </>
            )}
          </div>

          {overflow && (
            <p className="overflow-note">ACTUALLY {days} DAYS — IMPRESSIVE</p>
          )}

          <p className="sign-tagline">NO DUMBS RECORDED IN THIS ESTABLISHMENT</p>
        </div>
      </div>

      {/* Subtle lock icon in the corner — not labelled to avoid curiosity */}
      <button
        className="admin-btn"
        onClick={() => setShowAdmin(true)}
        aria-label="Admin"
        title="Admin"
      >
        🔒
      </button>

      {showAdmin && (
        <AdminModal
          onClose={() => setShowAdmin(false)}
          onReset={() => {
            setShowAdmin(false);
            fetchDays();
          }}
        />
      )}
    </div>
  );
}
