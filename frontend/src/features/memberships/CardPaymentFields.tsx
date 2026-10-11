import { useRef } from 'react'

export default function CardPaymentFields({ disabled }: { disabled: boolean }) {
  const fields = useRef<HTMLFieldSetElement>(null)
  function autofill() {
    const values = {
      cardholder: 'Zelda Lin',
      cardNumber: '4242 4242 4242 4242',
      cardExpiry: `12/${String(new Date().getFullYear() + 2).slice(-2)}`,
      securityCode: '123',
    }
    for (const [name, value] of Object.entries(values)) {
      const input = fields.current?.querySelector<HTMLInputElement>(
        `[name="${name}"]`,
      )
      if (input) input.value = value
    }
  }
  return (
    <fieldset ref={fields} className="member-card-fields" disabled={disabled}>
      <legend>Pay by card</legend>
      <button type="button" className="test-fill" onClick={autofill}>
        Autofill payment details
      </button>
      <div className="booking-field">
        <label htmlFor="cardholder">Name on card</label>
        <input
          id="cardholder"
          name="cardholder"
          autoComplete="cc-name"
          required
        />
      </div>
      <div className="booking-field">
        <label htmlFor="cardNumber">Card number</label>
        <input
          id="cardNumber"
          name="cardNumber"
          inputMode="numeric"
          autoComplete="cc-number"
          maxLength={23}
          required
        />
      </div>
      <div className="member-form-row">
        <div className="booking-field">
          <label htmlFor="cardExpiry">Expiry date (MM/YY)</label>
          <input
            id="cardExpiry"
            name="cardExpiry"
            placeholder="MM/YY"
            autoComplete="cc-exp"
            inputMode="numeric"
            maxLength={7}
            required
          />
        </div>
        <div className="booking-field">
          <label htmlFor="securityCode">Security code</label>
          <input
            id="securityCode"
            name="securityCode"
            type="text"
            autoComplete="cc-csc"
            inputMode="numeric"
            maxLength={4}
            required
          />
        </div>
      </div>
      <p className="field-help">
        Only the card type and last four digits appear on your receipt.
      </p>
    </fieldset>
  )
}
