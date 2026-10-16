# P5 module — test cases and results

**Scope under test:** the parts of the site owned by P5 — events (display and
registration), facilities and the floor map, accessibility information.
Recommendations and the language switcher are covered in the passes listed under
"Covered in other passes".

**How these were executed.** Every action below was performed by driving the
real UI in Chrome: real mouse events (`Input.dispatchMouseEvent` at the element's
centre, which hit-tests, so it fails if a control is covered) and real text input
(`Input.insertText`, which fires the same events a keyboard does). Code was used
only for navigation, assertions and screenshots — no API call performs any step of
a test. The single non-UI step is the database read at the end, which exists to
prove the UI action really persisted.

**Environment:** `main` merged into `Jason_P5`, commit `8ae63a6` plus the
uncommitted working tree; Vite 8.3.0 serving the frontend on `localhost:5173`,
the TypeScript backend on `localhost:5001` against MongoDB Atlas; Chrome headless,
viewport 1280x1000; Windows 11.

**Reproduce:**

    # backend
    cd backend && npm install && npm run dev
    # frontend, in a second shell
    cd frontend && npm install && npm run dev
    # Chrome with a debugging port, in a third shell
    chrome --headless=new --remote-debugging-port=9222 --user-data-dir=/tmp/p5 about:blank
    # run the suite from the repository root
    node tests/p5-ui-tests.mjs

The suite registers a real visitor against the live database and then deletes
that registration and returns the places it took, so it is safe to re-run. Use a
throwaway database if you would rather it never touched real data.

## Summary

| ID | Test case | Area | Result |
| --- | --- | --- | --- |
| TC-01 | Event list renders and a card opens its detail page | Events display | Pass |
| TC-02 | Detail shows time and remaining places, and reaches registration | Events display | Pass |
| TC-03 | Registration submits and confirms with a reference | Event registration | Pass |
| TC-04 | Remaining places decrease after registering | Event registration | Pass |
| TC-05 | A malformed email is rejected | Event registration | Pass |
| TC-06 | More guests than places left is rejected | Event registration | Pass |
| TC-07 | The floor map rooms are clickable | Facilities | Pass |
| TC-08 | Accessibility points of interest are clickable | Accessibility | Pass |

8 of 8 passed. Total elapsed for the suite: about 40 seconds.

---

## TC-01 — Event list renders and a card opens its detail page

**Precondition:** at least one event exists in the database.
**Steps:** open `/events`; count the cards; read the first card's title; click
"Discover event" on the first card; wait for the route to change.
**Expected:** cards render; the URL becomes `/events/:id`; the detail heading
matches the card title that was clicked.

**Actual:** 2 cards rendered. The click landed on `A.discover-link` ("Discover
event →"). URL became `/events/6ad1eca1c97fabc8c16ac161`. Detail heading
"RELAX" matched the clicked card's "RELAX".

**Result: Pass.**

## TC-02 — Detail shows time and remaining places, and reaches registration

**Precondition:** an event exists with places remaining.
**Steps:** on the event detail page, read the details panel; click
"Register for this event"; wait for the registration form.
**Expected:** the panel shows Type, Date, Time, Location and Availability; the
click opens `/events/:id/register` with the form rendered.

**Actual:** the panel read
`Type talk · Date Start: Saturday 17 October 2026, End: Sunday 18 October 2026 ·
Time 10:30 · Location Room A · Availability 12 of 21 spots left`. The click hit
`A.primary-button`; the URL became
`/events/6ad1eca1c97fabc8c16ac161/register` and the form rendered.

**Result: Pass.**

## TC-03 — Registration submits and confirms with a reference

**Precondition:** the registration form is open on an event with places left.
**Steps:** type a name and an email (leaving the guest count at its default of
1); click "Confirm Registration"; wait for the confirmation.
**Expected:** a confirmation screen appears showing a reference.

**Actual:** "Registration Confirmed" appeared with reference `FCDCDE` and
`Places left 11`. A direct database read afterwards found exactly one new
registration — `P5 UI Check <p5-ui-check@example.org>`, `guests=1`, against
`6ad1eca1c97fabc8c16ac161` — which was then deleted and its place returned.

**Result: Pass.**

## TC-04 — Remaining places decrease after registering

**Precondition:** TC-03 has just registered one guest.
**Steps:** navigate back to the event detail page; read Availability.
**Expected:** Availability is one lower than before the registration.

**Actual:** 12 before, 11 after.

**Result: Pass.**

## TC-05 — A malformed email is rejected

**Precondition:** the registration form is open.
**Steps:** type a name and `not-an-email`; click "Confirm Registration".
**Expected:** no registration is created and the field is reported as invalid.

**Actual:** the confirmation screen never appeared and no row was written to the
database. The browser reported the field invalid with
`Please include an '@' in the email address. 'not-an-email' is missing an '@'.`

**Result: Pass.**

**Observation 1:** the component's own message ("Please enter a valid email")
never appears. `<input type="email">` fails the browser's constraint validation,
which runs *before* the `submit` event, so `onSubmit` and therefore `validate()`
never run. The guard is real, but it lives in the markup rather than in the
component's code. Either add `noValidate` to the form so the component's message
is the one users see, or delete the unreachable branches — see Observations.

## TC-06 — More guests than places left is rejected

**Precondition:** the registration form is open on an event with 11 places left.
**Steps:** set the guest count above the number of places remaining; click
"Confirm Registration".
**Expected:** no registration is created and the value is reported as invalid.

**Actual:** the confirmation screen never appeared and no row was written. The
browser reported `rangeOverflow` on the field with
`Value must be less than or equal to 11.`

**Result: Pass.**

**Observation 1** applies here too: the component's "Only N place(s) left"
message is unreachable for the same reason. The server-side guard was verified
independently through the API — a request exceeding the remaining places returns
`409` with `Only 10 places left for this event`.

## TC-07 — The floor map rooms are clickable

**Precondition:** the facilities page is reachable.
**Steps:** open `/facilities`; count the rooms on the map; click "Gallery A";
read the selection panel.
**Expected:** the map holds 9 rooms and clicking one shows that space's details.

**Actual:** 9 rooms
(`Gallery A`, `Gallery C`, `Café`, `Gift Shop`, `Lobby`, `Gallery B`,
`Gallery D`, `Restrooms`, `Cloakroom`). The click landed on the room's SVG
`rect`. The panel then read
`Gallery A — 3 exhibitions on display in this space: Ancient Pottery of the
Mediterranean …`

**Result: Pass.**

## TC-08 — Accessibility points of interest are clickable

**Precondition:** the accessibility page is reachable.
**Steps:** open `/accessibility`; count the points of interest; click
"Wheelchair Loan"; read the selection panel.
**Expected:** four points of interest are offered, clicking one shows its
details, and the accessibility commitment block is present.

**Actual:** four points of interest. The click landed on the marker. The panel
read `Wheelchair Loan — Complimentary wheelchairs available at the front desk in
the l…`. The commitment block was present.

**Result: Pass.**

---

## Observations from this run

1. **The browser's own validation runs before the component's.** Both
   `validate()` branches in `EventRegister.jsx` that produce a message about the
   email or the guest count are unreachable while the form has no `noValidate`
   attribute, because `type="email"` and `max={remaining}` stop the submit event
   first. Nothing is broken — submission is blocked and the server enforces
   capacity as well — but the duplicated checks suggest the guard is in the
   component when it is not. Decide one way: add `noValidate` and keep the
   custom messages, or remove the dead branches and let the browser speak.

2. **The guest count field cannot be cleared by typing.** Its handler is
   `parseInt(value) || 1`, so emptying the field immediately writes `1` back.
   A visitor who clears the field and then types `5` gets `15`. Only visible
   from reading the code and from driving the field; not reproduced with a real
   user. Worth fixing if the form will be used with a keyboard.

## Covered in other passes

* **Responsive navigation** — 17 assertions over real clicks at 1400/1000/700 px:
  the toggle's visibility, the panel opening and closing, `aria-expanded`, no
  horizontal overflow at any width, and the panel closing itself after a
  navigation.
* **Language switcher** — the 13-language menu and the `includedLanguages` set in
  `index.html` were checked against each other; selecting a language sets the
  translation cookie.
* **Recommendations** — the four-item rule (tag matches first, then ascending
  `id` to fill, never the current exhibition) was verified with assertions
  against `GET /api/recommendations`. The block has not been exercised through
  the UI.

## Not covered — suggested next tests

* Keyboard-only operation of the floor map and the points of interest. The rooms
  are focusable and keyboard-activated in the markup, but no key-press test has
  been run, and the points of interest are markers rather than buttons.
* Screen-reader walkthrough of the map, the selection panels and the
  registration confirmation.
* The recommendations block as rendered on an exhibition detail page.
* Concurrent registration for the last remaining place. The server reserves the
  place with a single conditional update so two requests cannot both take it,
  but the case has not been exercised.
