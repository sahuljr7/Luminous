'use client';

export function AmbientOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {/* Top-left warm orb */}
      <div
        className="orb"
        style={{
          width: '600px',
          height: '600px',
          top: '-200px',
          left: '-200px',
          background: 'radial-gradient(circle, #f59e0b, transparent 70%)',
        }}
      />
      {/* Bottom-right sage orb */}
      <div
        className="orb"
        style={{
          width: '500px',
          height: '500px',
          bottom: '-150px',
          right: '-150px',
          background: 'radial-gradient(circle, #4d7d5e, transparent 70%)',
        }}
      />
      {/* Center subtle orb */}
      <div
        className="orb"
        style={{
          width: '400px',
          height: '400px',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, #b45309, transparent 70%)',
          opacity: 0.03,
        }}
      />
    </div>
  );
}
