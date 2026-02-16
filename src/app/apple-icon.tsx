import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '40px',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        }}
      >
        <svg
          width="120"
          height="120"
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
    ),
    {
      ...size,
    }
  )
}
