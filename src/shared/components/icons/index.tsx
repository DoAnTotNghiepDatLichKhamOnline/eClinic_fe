import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const stroke = {
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function IconLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 42 42" width="42" height="42" {...props}>
      <path d="M21 4 11 9v10c0 7.7 4.1 14.2 10 18 5.9-3.8 10-10.3 10-18V9L21 4Z" fill="none" stroke="#fff" strokeWidth="2.2" />
      <path d="M14.5 18.2h13M17 14.2h8" stroke="#f0a04f" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M21 21.5v8.2M17.2 25.4h7.6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function IconHeart(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M12 20s-7.2-4.6-9.7-9C.6 7.7 2.4 4 6 4c2.1 0 3.6 1.1 4.4 2.3M12 20s7.2-4.6 9.7-9c1.7-3.3-.1-7-3.7-7-2.1 0-3.6 1.1-4.4 2.3" />
      <path d="M4.5 11h3l1.5-3 2 6 1.5-3h5" />
    </svg>
  )
}

export function IconBaby(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <circle cx="12" cy="9" r="4.5" />
      <path d="M8 19c0-3 2-4.5 4-4.5s4 1.5 4 4.5" />
    </svg>
  )
}

export function IconDrop(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M12 3c-2.4 4-6 8.2-6 12a6 6 0 0 0 12 0c0-3.8-3.6-8-6-12Z" />
    </svg>
  )
}

export function IconBone(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M5 14.5a2.3 2.3 0 1 1 3.2 3.2l6.1-6.1a2.3 2.3 0 1 1 3.2-3.2 2.3 2.3 0 1 1-3.2-3.2l-6.1 6.1A2.3 2.3 0 1 1 5 14.5Z" />
    </svg>
  )
}

export function IconEye(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  )
}

export function IconBrain(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M9 4.5c-2 0-3.3 1.5-3.3 3.1 0 .5.1.9.3 1.3C4.7 9.4 4 10.6 4 12c0 1.2.5 2.2 1.3 2.9-.2.4-.3.9-.3 1.4 0 1.9 1.6 3.2 3.4 3.2M15 4.5c2 0 3.3 1.5 3.3 3.1 0 .5-.1.9-.3 1.3 1.3.5 2 1.7 2 3.1 0 1.2-.5 2.2-1.3 2.9.2.4.3.9.3 1.4 0 1.9-1.6 3.2-3.4 3.2" />
    </svg>
  )
}

export function IconStethoscope(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M5 3v6a4 4 0 0 0 8 0V3" />
      <path d="M11 9v2a6 6 0 0 0 12 0v-1.5" transform="translate(-2)" />
      <circle cx="9" cy="19.5" r="2.5" />
    </svg>
  )
}

export function IconVideo(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <rect x="2.5" y="6" width="13" height="12" rx="2" />
      <path d="M15.5 10.5l6-3.3v9.6l-6-3.3" />
    </svg>
  )
}

export function IconPhone(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M6.5 3.5h2.8l1.2 3.6-1.9 1.5a10.8 10.8 0 0 0 4.8 4.8l1.5-1.9 3.6 1.2v2.8c0 1.1-1 1.9-2 1.7-3.7-.7-7.1-2.6-9.8-5.3-2.7-2.7-4.6-6.1-5.3-9.8-.2-1 .6-2 1.7-2Z" />
    </svg>
  )
}

export function IconMapPin(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M12 21s7-6.4 7-12a7 7 0 1 0-14 0c0 5.6 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.4" />
    </svg>
  )
}

export function IconCalendar(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.2" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3v3.5M16 3v3.5" />
      <path d="M8.5 13.2h2M13.5 13.2h2M8.5 16.6h2" />
    </svg>
  )
}

export function IconClock(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}
