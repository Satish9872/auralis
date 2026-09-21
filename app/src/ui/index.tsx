import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from 'react'

export const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ')

/* ---------- Button ---------- */
type BtnVariant = 'primary' | 'secondary' | 'tertiary' | 'danger'
type BtnSize = 'sm' | 'md' | 'lg' | 'xl'

const btnVariant: Record<BtnVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-hover',
  secondary: 'text-brand ring-[1.5px] ring-inset ring-brand hover:bg-brand-subtle',
  tertiary: 'text-ink-2 hover:bg-black/5',
  danger: 'text-bad ring-[1.5px] ring-inset ring-bad hover:bg-bad-subtle',
}
const btnSize: Record<BtnSize, string> = {
  sm: 'h-7 px-3 text-xs',
  md: 'h-8 px-4 text-sm',
  lg: 'h-10 px-6 text-sm',
  xl: 'h-12 px-8 text-base',
}

export function Button({
  variant = 'primary', size = 'md', className, children, ...p
}: { variant?: BtnVariant; size?: BtnSize } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap',
        'transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
        btnVariant[variant], btnSize[size], className,
      )}
      {...p}
    >{children}</button>
  )
}

/* ---------- Card ---------- */
export function Card({ className, children, onClick }: {
  className?: string; children: ReactNode; onClick?: () => void
}) {
  return (
    <div onClick={onClick}
      className={cx('bg-surface border border-line rounded-[8px]', onClick && 'cursor-pointer', className)}>
      {children}
    </div>
  )
}

export function CardHead({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 pt-4 pb-3">
      <div>
        <h3 className="text-base font-semibold leading-6">{title}</h3>
        {sub && <p className="text-xs text-ink-2 mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

/* ---------- Chips ---------- */
export type Tone = 'brand' | 'ok' | 'warn' | 'bad' | 'neutral' | 'eval' | 'live'
const toneCls: Record<Tone, string> = {
  brand: 'bg-brand-subtle text-brand',
  ok: 'bg-ok-subtle text-ok',
  warn: 'bg-warn-subtle text-warn',
  bad: 'bg-bad-subtle text-bad',
  neutral: 'bg-subtle text-ink-2',
  eval: 'bg-[#EFEBFF] text-[#7A5AF8]',
  live: 'bg-bad-subtle text-live',
}

export function Chip({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 h-5 px-2 rounded text-[11px] font-semibold', toneCls[tone])}>
      {tone === 'live' && <span className="live-dot w-1.5 h-1.5 rounded-full bg-live" />}
      {children}
    </span>
  )
}

/* Score 1-5 with numeral — never colour alone */
const scoreTone = (n: number) =>
  n >= 4.5 ? { bg: '#DFF5EA', fg: '#01754F' } :
  n >= 3.5 ? { bg: '#E6F4EC', fg: '#4B9B6E' } :
  n >= 2.5 ? { bg: '#E8F3FF', fg: '#0A66C2' } :
  n >= 1.5 ? { bg: '#FFF4E0', fg: '#915907' } :
             { bg: '#FDEDE8', fg: '#B24020' }

export function Score({ value, label }: { value: number | null; label?: string }) {
  if (value == null) {
    return <span className="inline-flex items-center h-6 px-2.5 rounded-full text-xs font-semibold bg-subtle text-ink-3">Not assessed</span>
  }
  const t = scoreTone(value)
  return (
    <span className="inline-flex items-center h-6 px-2.5 rounded-full text-xs font-semibold"
          style={{ background: t.bg, color: t.fg }}>
      {value.toFixed(1)}{label && <span className="ml-1.5 font-normal opacity-80">{label}</span>}
    </span>
  )
}

/* ---------- Avatar ---------- */
const AV = ['#0A66C2', '#01754F', '#915907', '#7A5AF8', '#B24020', '#1E4D8C']
export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-white font-semibold shrink-0"
      style={{ width: size, height: size, background: AV[hash % AV.length], fontSize: size * 0.38 }}
      aria-hidden
    >{initials}</span>
  )
}

/* ---------- Input ---------- */
export function Input({ className, ...p }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        'w-full h-9 px-3 text-sm bg-surface text-ink rounded border border-line-strong',
        'placeholder:text-ink-3 focus:border-brand focus:shadow-[inset_0_0_0_1px_var(--color-brand)]',
        'outline-none', className,
      )}
      {...p}
    />
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-ink-2 mb-1">{label}</span>
      {children}
    </label>
  )
}

/* ---------- Page header ---------- */
export function PageHead({ crumb, title, count, actions }: {
  crumb?: string; title: string; count?: number; actions?: ReactNode
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        {crumb && <p className="text-xs text-ink-3 mb-1">{crumb}</p>}
        <h1 className="text-2xl font-semibold leading-8 flex items-center gap-2">
          {title}
          {count != null && <span className="text-sm font-normal text-ink-2">{count}</span>}
        </h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

/* ---------- Table ---------- */
export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-subtle">
            {head.map(h => (
              <th key={h} className="text-left font-semibold text-[11px] uppercase tracking-wide text-ink-2 px-3 h-10 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
export const Tr = ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
  <tr onClick={onClick} className={cx('border-b border-line last:border-0', onClick && 'cursor-pointer hover:bg-black/[.03]')}>{children}</tr>
)
export const Td = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <td className={cx('px-3 py-3 align-middle', className)}>{children}</td>
)

/* ---------- Meter ---------- */
export function Meter({ used, limit, label }: { used: number; limit: number; label?: string }) {
  const pct = Math.min(100, (used / limit) * 100)
  const c = pct >= 95 ? 'var(--color-bad)' : pct >= 80 ? 'var(--color-warn)' : 'var(--color-brand)'
  return (
    <div>
      {label && <div className="flex justify-between text-xs mb-1"><span className="text-ink-2">{label}</span><span className="font-semibold">{used} / {limit}</span></div>}
      <div className="h-1.5 rounded-full bg-subtle overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: c }} />
      </div>
    </div>
  )
}

/* ---------- Empty ---------- */
export function Empty({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="text-center py-14 px-6">
      <p className="font-semibold">{title}</p>
      {body && <p className="text-sm text-ink-2 mt-1 max-w-md mx-auto">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/* ---------- Waveform: the interviewer's visual identity ---------- */
export function Waveform({ state, size = 240 }: {
  state: 'idle' | 'listening' | 'thinking' | 'speaking'; size?: number
}) {
  const bars = 32
  const color = state === 'thinking' ? '#1E4D8C' : state === 'idle' ? 'var(--color-ink-3)' : 'var(--color-brand)'
  return (
    <div className="flex items-center justify-center gap-[2px]" style={{ width: size, height: 40 }} aria-hidden>
      {Array.from({ length: bars }).map((_, i) => {
        const base = state === 'idle' ? 4
          : state === 'listening' ? 4 + Math.abs(Math.sin(i * 0.5)) * 8
          : state === 'thinking' ? 4 + Math.abs(Math.sin(i * 0.4)) * 6
          : 4 + Math.abs(Math.sin(i * 0.7)) * 20
        return (
          <span key={i} className="rounded-full transition-all duration-200"
            style={{
              width: 3, height: base, background: color,
              animation: state !== 'idle' ? `pulse-dot ${1.2 + (i % 5) * 0.12}s ease-in-out ${i * 0.03}s infinite` : undefined,
            }} />
        )
      })}
    </div>
  )
}
