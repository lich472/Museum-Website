import StatusIcon from '../../components/StatusIcon'
import { Link } from 'react-router'
import { useMembership } from './useMembership'
import { annualPlan } from './membershipService'
import { money } from '../../extraBooking/bookingModel'
import PageHeader from "../PageHeader";

const benefits = [
  ['Single-day museum entry', true, false, true],
  ['Unlimited museum entry for 12 months', false, false, true],
  ['Save personal details for your next visit', false, true, true],
  ['Manage your personal details', false, true, true],
  ['Register for museum activities', true, true, true],
  ['Priority booking for selected events', false, false, true],
  ['Member news and invitations', false, false, true],
] as const

const cell = 'px-3.5 py-5 md:px-[22px]'
const rule = 'border-b border-[var(--color-border)]'
const labelCls = 'block min-h-7 text-[11px] uppercase tracking-[1px] text-[#6d655a]'
const priceCls =
  'block py-[9px] font-serif text-[44px] font-normal text-[var(--color-primary)]'
const unitCls = 'block text-xs font-normal'

export default function MembershipsPage() {
  const { user, isMember } = useMembership()

  return (
    <section>
      <PageHeader
              eyebrow="YOUR MUSEUM, ALL YEAR ROUND"
              title="One visit. One connection."
              description="If you plan to visit any of our museums two times or more in the next
          year. it's cheaper to become a member."
              image="images/membership_bg.jpg"
      />

      <p className="block text-right text-xs text-[#6d655a] min-[826px]:hidden">
        Swipe across to compare all three options →
      </p>

      <div
        className="overflow-auto rounded-[20px] border border-[var(--color-border)] bg-white"
        role="region"
        aria-label="Compare tickets, accounts and membership"
        tabIndex={0}
      >
        <table className="w-full min-w-[710px] table-fixed border-separate border-spacing-0 md:min-w-[760px]">
          <caption className="sr-only">
            Compare ways to visit and join the museum
          </caption>
          <thead>
            <tr>
              <th scope="col" className={`${cell} ${rule} w-[28%] pt-8 text-left align-top`}>
                <span className="eyebrow">FIND YOUR WAY IN</span>
                <h2 className="mb-1.5 mt-4 text-[25px]">More to discover</h2>
              </th>
              <th scope="col" className={`${cell} ${rule} pt-8 text-center align-top`}>
                <span className={labelCls}>Single visit</span>
                <span className={priceCls}>$20</span>
                <span className={unitCls}>per adult visit</span>
                <Link
                  className="mt-6 inline-flex min-h-[52px] items-center justify-center rounded-md border border-[#c9bda9] bg-transparent px-4 py-3.5 text-center text-sm font-medium no-underline transition-colors hover:bg-black/5"
                  to="/tickets"
                >
                  Book a visit →
                </Link>
              </th>
              <th scope="col" className={`${cell} ${rule} pt-8 text-center align-top`}>
                <span className={labelCls}>Stay connected with us</span>
                <span className={priceCls}>Free</span>
                <span className={unitCls}>entry purchased separately</span>
                <Link
                  className="mt-6 inline-flex min-h-[52px] items-center justify-center rounded-md border border-[#c9bda9] bg-transparent px-4 py-3.5 text-center text-sm font-medium no-underline transition-colors hover:bg-black/5"
                  to={user ? '/account' : '/signup'}
                >
                  {user ? 'My account' : 'Create an account'} →
                </Link>
              </th>
              <th
                scope="col"
                className={`${cell} ${rule} bg-[#e5edf0] pt-8 text-center align-top`}
              >
                <span className={labelCls}>A year of possibilities</span>
                <span className={priceCls}>{money(annualPlan.cents)}</span>
                <span className={unitCls}>per adult / 12 months</span>
                <Link
                  className="mt-6 inline-flex min-h-[52px] items-center justify-center rounded-md border border-[var(--color-primary)] bg-[var(--color-primary)] px-4 py-3.5 text-center text-sm font-medium text-white no-underline transition-colors hover:border-[#87412c] hover:bg-[#f56c31] hover:text-white"
                  to="/membership/plan"
                >
                  {isMember ? 'Renew membership' : 'Become a member'} →
                </Link>
              </th>
            </tr>
          </thead>
          <tbody>
            {benefits.map(([rowLabel, ...values], r) => {
              const edge = r === benefits.length - 1 ? '' : rule
              return (
                <tr key={rowLabel}>
                  <th
                    scope="row"
                    className={`${cell} ${edge} text-left text-sm font-medium leading-normal`}
                  >
                    {rowLabel}
                  </th>
                  {values.map((value, i) => (
                    <td
                      key={i}
                      className={`${cell} ${edge} text-center ${i === 2 ? 'bg-[#e5edf0]' : ''}`}
                    >
                      <span
                        className={`inline-flex items-center justify-center align-middle ${
                          value ? 'text-[#426458]' : 'text-[#918b82]'
                        }`}
                        role="img"
                        aria-label={value ? 'Included' : 'Not included'}
                      >
                        <StatusIcon included={value} />
                      </span>
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-[22px] text-center text-xs text-[#6d655a]">
        All prices in AUD. Membership is for one adult and lasts 12 months.
        Special exhibitions and selected events may be ticketed separately.
      </p>
    </section>
  )
}