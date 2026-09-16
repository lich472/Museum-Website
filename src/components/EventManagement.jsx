import { useState } from 'react'

function EventManagement() {
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

function saveEvent(event) {
  event.preventDefault()

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
    const updatedEvents = events.map(function (currentEvent) {
      if (currentEvent.id === editingId) {
        return {
          id: currentEvent.id,
          title: title,
          description: description,
          date: date,
          time: time,
          capacity: Number(capacity),
          spotsRemaining: currentEvent.spotsRemaining,
          location: location
        }
      }

      return currentEvent
    })

    setEvents(updatedEvents)
    setEditingId(null)
  } else {
    const newEvent = {
      id: Date.now(),
      title: title,
      description: description,
      date: date,
      time: time,
      capacity: Number(capacity),
      spotsRemaining: Number(capacity),
      location: location
    }

    setEvents(events.concat(newEvent))
  }

  setTitle('')
  setDescription('')
  setDate('')
  setTime('')
  setCapacity('')
  setLocation('')
}

function startEdit(currentEvent) {
  setTitle(currentEvent.title)
  setDescription(currentEvent.description)
  setDate(currentEvent.date)
  setTime(currentEvent.time)
  setCapacity(currentEvent.capacity)
  setLocation(currentEvent.location)
  setEditingId(currentEvent.id)
}

function deleteEvent(id) {
  const updatedEvents = events.filter(function (currentEvent) {
    return currentEvent.id !== id
  })

  setEvents(updatedEvents)
}

  return (
    <section className="management-section">
      <h2>Event Management</h2>

<form onSubmit={saveEvent}>
  <h3>
    {editingId === null ? 'Add Event' : 'Edit Event'}
  </h3>

  <input
    type="text"
    placeholder="Event name"
    value={title}
    onChange={(event) => setTitle(event.target.value)}
  />

  <textarea
    placeholder="Event description"
    value={description}
    onChange={(event) => setDescription(event.target.value)}
  />

  <input
    type="date"
    value={date}
    onChange={(event) => setDate(event.target.value)}
  />

  <input
    type="time"
    value={time}
    onChange={(event) => setTime(event.target.value)}
  />

  <input
    type="number"
    min="1"
    placeholder="Capacity"
    value={capacity}
    onChange={(event) => setCapacity(event.target.value)}
  />

  <input
    type="text"
    placeholder="Location"
    value={location}
    onChange={(event) => setLocation(event.target.value)}
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
          {events.map(function (event) {
            return (
              <tr key={event.id}>
                <td>{event.title}</td>
                <td>{event.date}</td>
                <td>{event.time}</td>
                <td>{event.capacity}</td>
                <td>{event.spotsRemaining}</td>
                <td>{event.location}</td>
                <td>{event.description}</td>
                <td>
                  <button onClick={() => startEdit(event)}>Edit</button>
                  <button onClick={() => deleteEvent(event.id)}>Delete</button>
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