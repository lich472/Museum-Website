import test from 'node:test'
import assert from 'node:assert/strict'
import {
  emptyDraft,
  detailErrors,
  validTickets,
  totalCents,
  todayInAdelaide,
} from '../src/features/bookings/bookingModel.ts'

test('mixed ticket quantities calculate in cents and require a valid single date and time', () => {
  const draft = emptyDraft()
  assert.equal(validTickets(draft), false)
  draft.date = todayInAdelaide()
  draft.time = '11:30'
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
