import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '@/utils/cx'
import styles from './Button.module.css'

type Variant = 'primary' | 'accent' | 'outline' | 'ghostDark'
type Size = 'sm' | 'md' | 'lg'

interface SharedProps {
  variant?: Variant
  size?: Size
  children: ReactNode
  className?: string
}

function classesFor({ variant = 'primary', size = 'md', className }: SharedProps) {
  return cx(
    styles.btn,
    styles[variant],
    size !== 'md' && styles[size],
    className,
  )
}

type ButtonProps = SharedProps & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({ variant, size, children, className, ...rest }: ButtonProps) {
  return (
    <button className={classesFor({ variant, size, children, className })} {...rest}>
      {children}
    </button>
  )
}

type ButtonLinkProps = SharedProps & AnchorHTMLAttributes<HTMLAnchorElement>

export function ButtonLink({ variant, size, children, className, ...rest }: ButtonLinkProps) {
  return (
    <a className={classesFor({ variant, size, children, className })} {...rest}>
      {children}
    </a>
  )
}
