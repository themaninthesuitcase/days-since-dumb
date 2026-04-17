import React, { useState } from 'react';

export default function AdminModal({ onClose, onReset }) {
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const handleReset = async () => {
    if (!password) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.status === 401) {
        setError('WRONG PASSWORD, PAL.');
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error('server error');

      onReset();
    } catch {
      setError('SOMETHING WENT WRONG. TRY AGAIN.');
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter')  handleReset();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title">RESET COUNTER</h2>
        <p>Enter the admin password to set the days counter back to zero.</p>

        <input
          type="password"
          className="modal-input"
          placeholder="● ● ● ● ● ●"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKey}
          autoFocus
          autoComplete="current-password"
        />

        {error && <p className="modal-message modal-error">{error}</p>}

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose} disabled={loading}>
            CANCEL
          </button>
          <button
            className="btn-reset"
            onClick={handleReset}
            disabled={loading || !password}
          >
            {loading ? 'RESETTING…' : 'RESET'}
          </button>
        </div>
      </div>
    </div>
  );
}
