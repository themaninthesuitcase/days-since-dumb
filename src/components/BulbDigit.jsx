import React, { useId } from 'react';

// ─── Layout constants ───────────────────────────────────────────────────────
const CELL = 24;      // px per grid cell
const R    = 7.5;     // bulb radius
const W    = 5 * CELL; // 120px
const H    = 9 * CELL; // 216px

// ─── Segment → grid positions (col, row) in a 5×9 grid ──────────────────────
//
//   col:  0   1   2   3   4
//   row:
//    0        a   a   a
//    1    f               b
//    2    f               b
//    3    f               b
//    4        g   g   g
//    5    e               c
//    6    e               c
//    7    e               c
//    8        d   d   d
//
const SEGS = {
  a: [[1,0],[2,0],[3,0]],
  b: [[4,1],[4,2],[4,3]],
  c: [[4,5],[4,6],[4,7]],
  d: [[1,8],[2,8],[3,8]],
  e: [[0,5],[0,6],[0,7]],
  f: [[0,1],[0,2],[0,3]],
  g: [[1,4],[2,4],[3,4]],
};

const DIGITS = {
  0: 'abcdef',
  1: 'bc',
  2: 'abdeg',
  3: 'abcdg',
  4: 'bcfg',
  5: 'acdfg',
  6: 'acdefg',
  7: 'abc',
  8: 'abcdefg',
  9: 'abcdfg',
};

export default function BulbDigit({ digit, index = 0 }) {
  // useId gives a stable, unique string per component instance
  const raw = useId();
  const uid = `bd${index}-${raw.replace(/:/g, '')}`;

  const litSet = new Set(DIGITS[digit] ?? '');

  const bulbs = Object.entries(SEGS).flatMap(([seg, coords]) =>
    coords.map(([col, row]) => ({
      id:  `${col}-${row}`,
      cx:  col * CELL + CELL / 2,
      cy:  row * CELL + CELL / 2,
      lit: litSet.has(seg),
    }))
  );

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: 'block', overflow: 'visible' }}
      aria-hidden="true"
    >
      <defs>
        {/* Lit bulb: warm white centre fading to deep amber */}
        <radialGradient id={`g-lit-${uid}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%"   stopColor="#ffffe8" />
          <stop offset="30%"  stopColor="#ffe033" />
          <stop offset="100%" stopColor="#ff7700" />
        </radialGradient>

        {/* Unlit bulb: very dark warm brown */}
        <radialGradient id={`g-dim-${uid}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%"   stopColor="#2e1a06" />
          <stop offset="100%" stopColor="#130900" />
        </radialGradient>

        {/* Glow blur applied only to lit bulbs */}
        <filter id={`f-glow-${uid}`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {bulbs.map(({ id, cx, cy, lit }) => (
        <g key={id}>
          {/* Socket recess */}
          <circle cx={cx} cy={cy} r={R + 3}   fill="#080400" />
          <circle cx={cx} cy={cy} r={R + 3}   fill="none" stroke="#201008" strokeWidth="1.5" />

          {/* Warm halo behind lit bulbs */}
          {lit && (
            <circle cx={cx} cy={cy} r={R + 8}  fill="#ff9900" opacity="0.18" />
          )}

          {/* The glass bulb */}
          <circle
            cx={cx} cy={cy} r={R}
            fill={lit ? `url(#g-lit-${uid})` : `url(#g-dim-${uid})`}
            filter={lit ? `url(#f-glow-${uid})` : undefined}
          />

          {/* Specular highlight (only when lit) */}
          {lit && (
            <ellipse
              cx={cx - R * 0.28}
              cy={cy - R * 0.3}
              rx={R * 0.32}
              ry={R * 0.22}
              fill="rgba(255,255,255,0.65)"
            />
          )}
        </g>
      ))}
    </svg>
  );
}
