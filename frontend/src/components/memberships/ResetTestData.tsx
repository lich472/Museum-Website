import { useState } from 'react'
import { resetTestData } from './membershipService'

export default function ResetTestData() {
  const [error, setError] = useState('')
  return (
    <div className="test-reset">
      <button
        type="button"
        className="member-secondary"
        onClick={() => {
          try {
            resetTestData()
            window.location.assign('/membership')
          } catch {
            setError(
              'Unable to clear saved data. Please allow browser storage and try again.',
            )
          }
        }}
      >
        Reset test data
      </button>
      <p className="field-help">
        Start a new test: clear saved accounts, orders and forms, then restore
        the preset member.
      </p>
      {error && (
        <p className="booking-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
