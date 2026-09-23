import { useEffect, useState } from 'react'

function EventManagement({ onStatsChange }) {
  // still hardcoded, swap for GET /api/events later
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Pottery Workshop',
      description: 'A hands-on pottery workshop.',
      date: '2026-09-20',
      time: '14:00',
      capacity: 20,
      spotsRemaining: 7,
      location: 'Workshop Room 1'
    },
    {
      id: 2,
      title: 'Local History Talk',
      description: 'A talk about local history.',
      date: '2026-10-10',
      time: '11:00',
      capacity: 40,
      spotsRemaining: 25,
      location: 'Main Hall'
    }
  ])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [capacity, setCapacity] = useState('')
  const [location, setLocation] = useState('')
  const [editingId, setEditingId] = useState(null)

useEffect(function () {
  let totalCapacity = 0
  let availableSpots = 0

  for (let i = 0; i < events.length; i++) {
    totalCapacity = totalCapacity + events[i].capacity
    availableSpots = availableSpots + events[i].spotsRemaining
  }

  onStatsChange({
    totalEvents: events.length,
    totalCapacity: totalCapacity,
    availableSpots: availableSpots
  })
}, [events, onStatsChange])

  function saveEvent(e) {
    e.preventDefault()

    if (
      title === '' ||
      date === '' ||
      time === '' ||
      capacity === '' ||
      location === ''
    ) {
      alert('Please complete all required event fields.')
      return
    }

    if (editingId !== null) {
      // build the list again, with the edited event swapped in
      let newList = []

      for (let i = 0; i < events.length; i++) {
        if (events[i].id === editingId) {
          let edited = {
            id: events[i].id,
            title: title,
            description: description,
            date: date,
            time: time,
            capacity: Number(capacity),
            spotsRemaining: events[i].spotsRemaining,
            location: location
          }

          newList.push(edited)
        } else {
          newList.push(events[i])
        }
      }

      setEvents(newList)
      setEditingId(null)
    } else {
      let newEvent = {
        id: Date.now(),
        title: title,
        description: description,
        date: date,
        time: time,
        capacity: Number(capacity),
        // a new event starts with all its spots free
        spotsRemaining: Number(capacity),
        location: location
      }

      let newList = events.slice()
      newList.push(newEvent)
      setEvents(newList)
    }

    // clear the form
    setTitle('')
    setDescription('')
    setDate('')
    setTime('')
    setCapacity('')
    setLocation('')
  }

  function startEdit(ev) {
    setTitle(ev.title)
    setDescription(ev.description)
    setDate(ev.date)
    setTime(ev.time)
    setCapacity(ev.capacity)
    setLocation(ev.location)
    setEditingId(ev.id)
  }

  function deleteEvent(id) {
    let newList = []

    for (let i = 0; i < events.length; i++) {
      if (events[i].id !== id) {
        newList.push(events[i])
      }
    }

    setEvents(newList)
  }

  return (
    <section className="management-section">
      <h2>Event Management</h2>

      <form onSubmit={saveEvent}>
        <h3>{editingId === null ? 'Add Event' : 'Edit Event'}</h3>

        <input
          type="text"
          placeholder="Event name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Event description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <input
          type="number"
          min="1"
          placeholder="Capacity"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <button type="submit">
          {editingId === null ? 'Add Event' : 'Save Changes'}
        </button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Date</th>
            <th>Time</th>
            <th>Capacity</th>
            <th>Spots Remaining</th>
            <th>Location</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {events.map(function (ev) {
            return (
              <tr key={ev.id}>
                <td>{ev.title}</td>
                <td>{ev.date}</td>
                <td>{ev.time}</td>
                <td>{ev.capacity}</td>
                <td>{ev.spotsRemaining}</td>
                <td>{ev.location}</td>
                <td>{ev.description}</td>
                <td>
                  <button onClick={() => startEdit(ev)}>Edit</button>
                  <button onClick={() => deleteEvent(ev.id)}>Delete</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}

export default EventManagement
