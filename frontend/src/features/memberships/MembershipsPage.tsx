import { Link } from 'react-router'
import { useMembership } from './useMembership'
import { annualPlan, isMember, money } from './membershipService'

const benefits = [
  ['Single-day museum entry', true, false, true],
  ['Unlimited museum entry for 12 months', false, false, true],
  ['Save personal details for your next visit', false, true, true],
  ['Manage your personal details', false, true, true],
  ['Register for museum activities', true, true, true],
  ['Priority booking for selected events', false, false, true],
  ['Member news and invitations', false, false, true],
] as const

export default function MembershipsPage() {
  const { account } = useMembership()

  return (
    <section className="membership-page">
      <div className="member-intro">
        <span className="eyebrow">YOUR MUSEUM, ALL YEAR ROUND</span>
        <h1>
          One visit. One connection.
        </h1>
        <p>If you plan to visit any of our museums two times or more in the next year
           <br />it's cheaper to become a member.
        </p>
      </div>
      <p className="comparison-scroll-hint">
        Swipe across to compare all three options →
      </p>
      <div
        className="comparison-wrap"
        role="region"
        aria-label="Compare tickets, accounts and membership"
        tabIndex={0}
      >
        <table className="member-comparison">
          <caption className="visually-hidden">
            Compare ways to visit and join the museum
          </caption>
          <thead>
            <tr>
              <th scope="col">
                <span className="eyebrow">FIND YOUR WAY IN</span>
                <h2>More to discover</h2>
              </th>
              <th scope="col">
                <span className="comparison-label">Single visit</span>
                <span className="comparison-price">$20</span>
                <span className="comparison-unit">per adult visit</span>
                <Link className="member-secondary comparison-action" to="/tickets">
                  Book a visit →
                </Link>
              </th>
              <th scope="col">
                <span className="comparison-label">Stay connected with us</span>
                <span className="comparison-price">Free</span>
                <span className="comparison-unit">
                  entry purchased separately
                </span>
                <Link
                  className="member-secondary comparison-action"
                  to={account ? '/account' : '/register'}
                >
                  {account ? 'My account' : 'Create an account'} →
                </Link>
              </th>
              <th scope="col" className="member-highlight">
                <span className="comparison-label">
                  A year of possibilities
                </span>
                <span className="comparison-price">
                  {money(annualPlan.cents)}
                </span>
                <span className="comparison-unit">per adult / 12 months</span>
                <Link
                  className="booking-button comparison-action"
                  to="/membership/plan"
                >
                  {isMember(account) ? 'Renew membership' : 'Become a member'} →
                </Link>
              </th>
            </tr>
          </thead>
          <tbody>
            {benefits.map(([label, ...values]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                {values.map((value, i) => (
                  <td key={i} className={i === 2 ? 'member-highlight' : ''}>
                    <span
                      className={value ? 'benefit-yes' : 'benefit-no'}
                      role="img"
                      aria-label={value ? 'Included' : 'Not included'}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        focusable="false"
                      >
                        {value ? (
                          <path d="M5 12l4 4L19 6" />
                        ) : (
                          <path d="M6 6l12 12M18 6L6 18" />
                        )}
                      </svg>
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="member-footnote">
        All prices in AUD. Membership is for one adult and lasts 12 months.
        Special exhibitions and selected events may be ticketed separately.
      </p>
    </section>
  )
}
