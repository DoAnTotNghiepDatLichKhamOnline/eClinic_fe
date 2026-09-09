import type { ReactNode } from 'react'
import { cx } from '@/utils/cx'
import styles from './SectionHead.module.css'

export function SectionHead({
  title,
  description,
  tight,
}: {
  title: ReactNode
  description: ReactNode
  tight?: boolean
}) {
  return (
    <div className={cx(styles.head, tight && styles.tight)}>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  )
}
