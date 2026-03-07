'use client'

import { useEffect, useRef } from 'react'
import { Activity, Lock, Fingerprint } from 'lucide-react'
import './ReflectiveCard.css'

interface ReflectiveCardProps {
  name: string
  role: string
  phone: string
  profileImageSrc?: string
  blurStrength?: number
  color?: string
  metalness?: number
  roughness?: number
  overlayColor?: string
  displacementStrength?: number
  noiseScale?: number
  specularConstant?: number
  grayscale?: number
  glassDistortion?: number
  className?: string
  style?: React.CSSProperties
}

const ReflectiveCard = ({
  name,
  role,
  phone,
  profileImageSrc,
  blurStrength = 12,
  color = 'white',
  metalness = 1,
  roughness = 0.4,
  overlayColor = 'rgba(0, 0, 0, 0.2)',
  displacementStrength = 20,
  noiseScale = 1,
  specularConstant = 1.2,
  grayscale = 1,
  glassDistortion = 0,
  className = '',
  style = {},
}: ReflectiveCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let stream: MediaStream | null = null

    const startWebcam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        console.error('Error accessing webcam:', err)
      }
    }

    startWebcam()

    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop())
    }
  }, [])

  const baseFrequency = 0.03 / Math.max(0.1, noiseScale)
  const saturation = 1 - Math.max(0, Math.min(1, grayscale))

  const cssVariables = {
    '--blur-strength': `${blurStrength}px`,
    '--metalness': metalness,
    '--roughness': roughness,
    '--overlay-color': overlayColor,
    '--text-color': color,
    '--saturation': saturation,
  } as React.CSSProperties

  return (
    <div className={`reflective-card-container ${className}`} style={{ ...style, ...cssVariables }}>
      <svg className="reflective-svg-filters" aria-hidden="true">
        <defs>
          <filter id="metallic-displacement" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="turbulence" baseFrequency={baseFrequency} numOctaves={2} result="noise" />
            <feColorMatrix in="noise" type="luminanceToAlpha" result="noiseAlpha" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={displacementStrength}
              xChannelSelector="R"
              yChannelSelector="G"
              result="rippled"
            />
            <feSpecularLighting
              in="noiseAlpha"
              surfaceScale={displacementStrength}
              specularConstant={specularConstant}
              specularExponent={20}
              lightingColor="#ffffff"
              result="light"
            >
              <fePointLight x="0" y="0" z="300" />
            </feSpecularLighting>
            <feComposite in="light" in2="rippled" operator="in" result="light-effect" />
            <feBlend in="light-effect" in2="rippled" mode="screen" result="metallic-result" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="solidAlpha"
            />
            <feMorphology in="solidAlpha" operator="erode" radius={45} result="erodedAlpha" />
            <feGaussianBlur in="erodedAlpha" stdDeviation={10} result="blurredMap" />
            <feComponentTransfer in="blurredMap" result="glassMap">
              <feFuncA type="linear" slope={0.5} intercept={0} />
            </feComponentTransfer>
            <feDisplacementMap
              in="metallic-result"
              in2="glassMap"
              scale={glassDistortion}
              xChannelSelector="A"
              yChannelSelector="A"
              result="final"
            />
          </filter>
        </defs>
      </svg>

      <video ref={videoRef} autoPlay playsInline muted className="reflective-video" />

      <div className="reflective-noise" />
      <div className="reflective-sheen" />
      <div className="reflective-border" />

      <div className="reflective-content">
        <div className="profile-header">
          <div className="profile-badge">
            <Lock size={10} className="profile-badge-icon" />
            <span>Identity</span>
          </div>
          <Activity size={16} className="profile-status-icon" />
        </div>

        <div className="profile-body">
          <div className="profile-avatar">
            {profileImageSrc ? (
              <img src={profileImageSrc} alt={name} />
            ) : (
              'PHOTO'
            )}
          </div>
          <p className="profile-name">{name}</p>
          <p className="profile-role">{role}</p>
        </div>

        <div className="profile-footer">
          <div className="profile-contact">
            <span className="profile-label">Contact</span>
            <span className="profile-value">{phone}</span>
          </div>
          <Fingerprint size={28} className="profile-fp-icon" />
        </div>
      </div>
    </div>
  )
}

export default ReflectiveCard
