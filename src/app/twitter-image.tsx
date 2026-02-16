import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Cognify - AI-Powered Learning Platform'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
          position: 'relative',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
          }}
        />
        
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 24,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 24,
            }}
          >
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.2" fill="none" />
              <path d="M9 12c0-1.66 1.34-3 3-3s3 1.34 3 3" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M7 10c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="12" cy="14" r="1.5" fill="white" />
              <path d="M12 15.5v3" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Cognify
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 36,
            color: '#ffffff',
            textAlign: 'center',
            maxWidth: 800,
            lineHeight: 1.4,
            marginBottom: 24,
          }}
        >
          Turn PDFs into Interactive Study Experiences
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: 40,
            marginTop: 20,
          }}
        >
          {['AI Summaries', 'Smart Quizzes', 'Audio Learning'].map((feature) => (
            <div
              key={feature}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                background: 'rgba(99, 102, 241, 0.2)',
                borderRadius: 50,
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              <span style={{ color: '#a5b4fc', fontSize: 20 }}>✓</span>
              <span style={{ color: '#e2e8f0', fontSize: 20 }}>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
