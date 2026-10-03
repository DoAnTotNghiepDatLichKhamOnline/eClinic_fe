import type { ReactNode } from 'react'
import styles from './Container.module.css'

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className ? `${styles.wrap} ${className}` : styles.wrap}>{children}</div>
}
