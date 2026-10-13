export type CardDetails = {
  cardholder: string
  number: string
  expiry: string
  securityCode: string
}

export type PaymentSummary = {
  brand: string
  lastFour: string
}

// Only the returned summary may be stored with an order.
export function paymentSummary(
  card: CardDetails,
  now = new Date(),
): PaymentSummary {
  if (!card || !card.cardholder.trim()) {
    throw new Error('Please enter the name on your card.')
  }
  const number = card.number.replace(/[\s-]/g, '')
  if (!/^\d{13,19}$/.test(number) || /^0+$/.test(number)) {
    throw new Error('Please enter a valid card number.')
  }
  let total = 0
  for (
    let i = number.length - 1, double = false;
    i >= 0;
    i--, double = !double
  ) {
    let digit = Number(number[i])
    if (double) digit = digit * 2 > 9 ? digit * 2 - 9 : digit * 2
    total += digit
  }
  if (total % 10 !== 0) throw new Error('Please check your card number.')
  const expiry = /^(\d{2})\s*\/\s*(\d{2})$/.exec(card.expiry.trim())
  const month = Number(expiry?.[1])
  const year = 2000 + Number(expiry?.[2])
  if (!expiry || month < 1 || month > 12) {
    throw new Error('Enter the expiry date as MM/YY.')
  }
  if (
    year < now.getFullYear() ||
    (year === now.getFullYear() && month < now.getMonth() + 1)
  ) {
    throw new Error('Your card has expired. Please use another card.')
  }
  if (!/^\d{3,4}$/.test(card.securityCode)) {
    throw new Error('Please enter a valid security code.')
  }
  return {
    brand: /^4/.test(number)
      ? 'Visa'
      : /^(5[1-5]|2[2-7])/.test(number)
        ? 'Mastercard'
        : /^3[47]/.test(number)
          ? 'American Express'
          : 'Card',
    lastFour: number.slice(-4),
  }
}
