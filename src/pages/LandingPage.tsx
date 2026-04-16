import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#161824',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#d4d8e8',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          background: '#22253a',
          border: '1px solid #2e3148',
          borderRadius: 8,
          color: '#d4d8e8',
          padding: '8px 16px',
          cursor: 'pointer',
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = '#2a2d45'
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#4a4f72'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = '#22253a'
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#2e3148'
        }}
      >
        ← Back
      </button>

      {/* Content */}
      <div
        style={{
          textAlign: 'center',
          maxWidth: 480,
          padding: '0 24px',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: '#22253a',
            border: '1px solid #2e3148',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: 32,
          }}
        >
          ⚡
        </div>

        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: 12,
          }}
        >
          Welcome to Skiode
        </h1>

        <p
          style={{
            fontSize: 15,
            color: '#6b7280',
            lineHeight: 1.6,
            marginBottom: 32,
          }}
        >
          You've landed on the landing page. This screen was triggered
          by clicking the component on the canvas.
        </p>

        <button
          onClick={() => navigate('/')}
          style={{
            background: '#5c5fef',
            border: 'none',
            borderRadius: 8,
            color: '#ffffff',
            padding: '12px 28px',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Go to Designer
        </button>
      </div>
    </div>
  )
}