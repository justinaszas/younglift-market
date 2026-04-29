import { OrderStatus } from '@/types/database'

const STEPS = [
  { label: 'Ordered',    key: 'ordered'    },
  { label: 'Processing', key: 'processing' },
  { label: 'Shipped',    key: 'shipped'    },
  { label: 'Delivered',  key: 'delivered'  },
]

// Map DB status → step index (0-based). -1 = cancelled.
const STATUS_STEP: Record<OrderStatus, number> = {
  pending:   0,
  paid:      1,
  shipped:   2,
  completed: 3,
  cancelled: -1,
}

interface Props {
  status: OrderStatus
}

export function StatusStepper({ status }: Props) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 py-1">
        <div className="w-4 h-4 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0">
          <svg className="w-2.5 h-2.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <span className="text-xs text-red-400 font-semibold">Order cancelled</span>
      </div>
    )
  }

  const currentStep = STATUS_STEP[status]

  return (
    <div className="flex items-start gap-0 w-full">
      {STEPS.map((step, i) => {
        const done    = currentStep > i
        const current = currentStep === i
        const future  = currentStep < i

        return (
          <div key={step.key} className="flex-1 flex flex-col items-center relative">
            {/* Connector line left */}
            {i > 0 && (
              <div
                className={`absolute left-0 right-1/2 top-[11px] h-px ${
                  done || current ? 'bg-accent' : 'bg-divider'
                }`}
              />
            )}
            {/* Connector line right */}
            {i < STEPS.length - 1 && (
              <div
                className={`absolute left-1/2 right-0 top-[11px] h-px ${
                  done ? 'bg-accent' : 'bg-divider'
                }`}
              />
            )}

            {/* Circle */}
            <div
              className={`relative z-10 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                done
                  ? 'bg-accent border-accent'
                  : current
                  ? 'bg-accent/20 border-accent'
                  : 'bg-bg border-divider'
              }`}
            >
              {done ? (
                <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : current ? (
                <div className="w-2 h-2 rounded-full bg-accent" />
              ) : null}
            </div>

            {/* Label */}
            <span
              className={`mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-center leading-tight ${
                done || current ? 'text-accent' : 'text-muted'
              }`}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
