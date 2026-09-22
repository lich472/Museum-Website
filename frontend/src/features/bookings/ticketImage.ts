import QRCode from 'qrcode'
import type { Booking } from './bookingModel'
import { formatDate, money, ticketTypes } from './bookingModel'

// Booking reference payload: contains no contact details and is not an admission credential.
// Replace with the backend-issued admission payload when the API is connected.

export function bookingQrPayload(booking: Booking) {
  return `museum-booking:v1:${booking.requestId}`
}

export async function createTicketImage(booking: Booking) {
  const qr = document.createElement('canvas')
  await QRCode.toCanvas(qr, bookingQrPayload(booking), {
    errorCorrectionLevel: 'M',
    width: 480,
    margin: 4,
    color: { dark: '#000000', light: '#ffffff' },
  })
  const canvas = document.createElement('canvas')
  canvas.width = 900
  canvas.height = 1260
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Your browser cannot create ticket images.')
  ctx.fillStyle = '#faf7f0'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#a34f35'
  ctx.fillRect(0, 0, 900, 12)
  ctx.textAlign = 'center'
  ctx.fillStyle = '#34332f'
  ctx.font = 'bold 32px Arial'
  ctx.fillText('South Australia Regional Museum', 450, 80, 800)
  ctx.font = '24px Arial'
  ctx.fillText('BOOKING SUMMARY · NOT VALID FOR ADMISSION', 450, 127)
  ctx.font = 'bold 34px Arial'
  ctx.fillText(booking.reference, 450, 191, 790)
  ctx.font = '24px Arial'
  ctx.fillText(formatDate(booking.date), 450, 237, 790)
  ctx.drawImage(qr, 210, 275)
  ctx.font = '22px Arial'
  ctx.fillText('Keep this image with your booking reference.', 450, 792)
  let y = 860
  for (const ticket of ticketTypes) {
    const count = booking.quantities[ticket.id]
    if (!count) continue
    ctx.textAlign = 'left'
    ctx.fillText(`${count} × ${ticket.label}`, 70, y, 570)
    ctx.textAlign = 'right'
    ctx.fillText(money(ticket.cents * count), 830, y)
    y += 45
  }
  ctx.fillStyle = '#d7ccbd'
  ctx.fillRect(70, y, 760, 2)
  ctx.fillStyle = '#34332f'
  ctx.font = 'bold 26px Arial'
  ctx.textAlign = 'left'
  ctx.fillText(
    `Visitors: ${Object.values(booking.quantities).reduce((sum, n) => sum + n, 0)}`,
    70,
    y + 50,
  )
  ctx.textAlign = 'right'
  ctx.fillText(`Total: ${money(booking.totalCents)} AUD`, 830, y + 50)
  ctx.textAlign = 'center'
  ctx.font = '20px Arial'
  ctx.fillText('Sample prices. No payment or email has been issued.', 450, 1180)
  ctx.fillText('One booking · One visit date · Arrive together', 450, 1217)
  return {
    qrUrl: qr.toDataURL('image/png'),
    ticketUrl: canvas.toDataURL('image/png'),
  }
}
