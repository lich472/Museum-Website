import { useState } from 'react'
import './App.css'
import EventManagement from './components/EventManagement'
import VisitorInfoEditor from './components/VisitorInfoEditor'
import DashboardOverview from './components/DashboardOverview'

function App() {
  // fake data for now, will come from the API later
  const [exhibitions, setExhibitions] = useState([
    {
      id: 1,
      title: 'Dinosaur Exhibition',
      date: '2026-09-20',
      status: 'Live',
      description: 'Explore dinosaur fossils and prehistoric life.',
      imageUrl: '/favicon.svg'
    },
    {
      id: 2,
      title: 'Local History Exhibition',
      date: '2026-10-05',
      status: 'Upcoming',
      description: 'Learn about the history of the local community.',
      imageUrl: '/favicon.svg'
    }
  ])

const [eventStats, setEventStats] = useState({
  totalEvents: 2,
  totalCapacity: 60,
  availableSpots: 32
})

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [status, setStatus] = useState('Upcoming')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [editingId, setEditingId] = useState(null)

  function deleteExhibition(id) {
    // keep everything except the one we clicked delete on
    let newList = []

    for (let i = 0; i < exhibitions.length; i++) {
      if (exhibitions[i].id !== id) {
        newList.push(exhibitions[i])
      }
    }

    setExhibitions(newList)
  }

  function startEdit(item) {
    setTitle(item.title)
    setDate(item.date)
    setStatus(item.status)
    setDescription(item.description)
    setImageUrl(item.imageUrl)
    setEditingId(item.id)
  }

  function addExhibition(e) {
    e.preventDefault()

    // only the name + date are required
    if (title === '' || date === '') {
      alert('Please enter the exhibition name and date.')
      return
    }

    if (editingId !== null) {
      // put the edited values back into the list
      let newList = []

      for (let i = 0; i < exhibitions.length; i++) {
        if (exhibitions[i].id === editingId) {
          let edited = {
            id: exhibitions[i].id,
            title: title,
            date: date,
            status: status,
            description: description,
            imageUrl: imageUrl
          }

          newList.push(edited)
        } else {
          newList.push(exhibitions[i])
        }
      }

      setExhibitions(newList)
      setEditingId(null)
    } else {
      let newExhibition = {
        id: Date.now(),
        title: title,
        date: date,
        status: status,
        description: description,
        imageUrl: imageUrl
      }

      let newList = exhibitions.slice()
      newList.push(newExhibition)
      setExhibitions(newList)
    }

    // clear the form after saving
    setTitle('')
    setDate('')
    setStatus('Upcoming')
    setDescription('')
    setImageUrl('')
  }

  return (
    <div className="admin-page">
      <h1>Museum Admin Dashboard</h1>
      <p>Manage museum exhibitions and events.</p>

      <DashboardOverview
  totalExhibitions={exhibitions.length}
  totalEvents={eventStats.totalEvents}
  totalCapacity={eventStats.totalCapacity}
  availableSpots={eventStats.availableSpots}
/>

      <h2>Exhibition Management</h2>

      <form onSubmit={addExhibition}>
        <h3>{editingId === null ? 'Add Exhibition' : 'Edit Exhibition'}</h3>

        <input
          type="text"
          placeholder="Exhibition name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <textarea
          placeholder="Exhibition description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="text"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Upcoming">Upcoming</option>
          <option value="Live">Live</option>
          <option value="Archived">Archived</option>
        </select>

        <button type="submit">
          {editingId === null ? 'Add Exhibition' : 'Save Changes'}
        </button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Exhibition Name</th>
            <th>Date</th>
            <th>Status</th>
            <th>Description</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {exhibitions.map(function (item) {
            return (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.date}</td>
                <td>{item.status}</td>
                <td>{item.description}</td>
                <td>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="exhibition-image"
                  />
                </td>
                <td>
                  <button onClick={() => startEdit(item)}>Edit</button>
                  <button onClick={() => deleteExhibition(item.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <EventManagement onStatsChange={setEventStats} />
      <VisitorInfoEditor />
    </div>
  )
}

export default App
