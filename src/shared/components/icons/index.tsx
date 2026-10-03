import type { SVGProps } from 'react'

export {
  Baby as IconBaby,
  Bone as IconBone,
  Brain as IconBrain,
  CalendarDays as IconCalendar,
  Clock3 as IconClock,
  Droplet as IconDrop,
  Eye as IconEye,
  HeartPulse as IconHeart,
  MapPin as IconMapPin,
  Phone as IconPhone,
  Stethoscope as IconStethoscope,
  Video as IconVideo,
} from 'lucide-react'

export function IconLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 42 42" width="42" height="42" {...props}>
      <path d="M21 4 11 9v10c0 7.7 4.1 14.2 10 18 5.9-3.8 10-10.3 10-18V9L21 4Z" fill="none" stroke="#fff" strokeWidth="2.2" />
      <path d="M14.5 18.2h13M17 14.2h8" stroke="#f0a04f" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M21 21.5v8.2M17.2 25.4h7.6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

