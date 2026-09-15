import test from 'node:test'
import assert from 'node:assert/strict'
import {
  emptyDraft,
  latestBookingDate,
  detailErrors,
  validTickets,
  totalCents,
  todayInAdelaide,
} from '../src/features/bookings/bookingModel.ts'

test('mixed ticket quantities calculate in cents and require a valid single date without a time', () => {
  const draft = emptyDraft()
  assert.equal('time' in draft, false)
  assert.equal(validTickets(draft), false)
  draft.date = todayInAdelaide()
  draft.quantities = { adult: 2, child: 1, concession: 1, infant: 1 }
  assert.equal(validTickets(draft), true)
  assert.equal(totalCents(draft), 6500)
  draft.quantities.adult = -1
  assert.equal(validTickets(draft), false)
  draft.quantities.adult = 1.5
  assert.equal(validTickets(draft), false)
  draft.quantities.adult = 1
  draft.date = '2027-02-30'
  assert.equal(validTickets(draft), false)
  draft.date = '2020-01-01'
  assert.equal(validTickets(draft), false)
})

test('details validate matching email, Australian postcode, phone and explicit terms', () => {
  const details = {
    ...emptyDraft().details,
    firstName: 'Test',
    lastName: 'Visitor',
    email: 'visitor@example.com',
    confirmEmail: 'visitor@example.com',
    phone: '0412 345 678',
    postcode: '0800',
    acceptedTerms: true,
  }
  assert.deepEqual(detailErrors(details), {})
  assert.ok(
    detailErrors({ ...details, confirmEmail: 'other@example.com' })
      .confirmEmail,
  )
  assert.ok(detailErrors({ ...details, acceptedTerms: false }).acceptedTerms)
  assert.ok(detailErrors({ ...details, postcode: '500' }).postcode)
  assert.ok(detailErrors({ ...details, phone: '123' }).phone)
  assert.equal(
    detailErrors({ ...details, australianResident: false, postcode: '' })
      .postcode,
    undefined,
  )
})

test('six-month limit handles year rollover, month ends and leap years', () => {
  assert.equal(latestBookingDate('2026-09-15'), '2027-03-15')
  assert.equal(latestBookingDate('2026-08-31'), '2027-02-28')
  assert.equal(latestBookingDate('2023-08-31'), '2024-02-29')
  const draft = emptyDraft()
  draft.quantities.adult = 1
  draft.date = latestBookingDate()
  assert.equal(validTickets(draft), true)
  const nextDay = new Date(`${draft.date}T12:00:00Z`)
  nextDay.setUTCDate(nextDay.getUTCDate() + 1)
  draft.date = nextDay.toISOString().slice(0, 10)
  assert.equal(validTickets(draft), false)
})
