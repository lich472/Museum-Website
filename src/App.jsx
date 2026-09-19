import { useState } from 'react'
import './App.css'
import EventManagement from './components/EventManagement'
import VisitorInfoEditor from './components/VisitorInfoEditor'
import DashboardOverview from './components/DashboardOverview'

function App() {
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
        const [title, setTitle] = useState('')
        const [date, setDate] = useState('')
        const [status, setStatus] = useState('Upcoming')
        const [description, setDescription] = useState('')
        const [imageUrl, setImageUrl] = useState('')
        const [editingId, setEditingId] = useState(null)
    function deleteExhibition(id) {
    const updatedExhibitions = exhibitions.filter(function (exhibition) {
      return exhibition.id !== id
    })

    setExhibitions(updatedExhibitions)
  }
  function startEdit(exhibition) {
  setTitle(exhibition.title)
  setDate(exhibition.date)
  setStatus(exhibition.status)
  setDescription(exhibition.description)
  setImageUrl(exhibition.imageUrl)
  setEditingId(exhibition.id)
}
 function addExhibition(event) {
  event.preventDefault()

  if (title === '' || date === '') {
    alert('Please enter the exhibition name and date.')
    return
  }

  if (editingId !== null) {
    const updatedExhibitions = exhibitions.map(function (exhibition) {
      if (exhibition.id === editingId) {
        return {
          id: exhibition.id,
          title: title,
          date: date,
          status: status,
          description: description,
          imageUrl: imageUrl
}
      }

      return exhibition
    })

    setExhibitions(updatedExhibitions)
    setEditingId(null)
  } else {
    const newExhibition = {
      id: Date.now(),
      title: title,
      date: date,
      status: status,
      description: description,
      imageUrl: imageUrl
    }

    const updatedExhibitions = exhibitions.concat(newExhibition)
    setExhibitions(updatedExhibitions)
  }

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
      
      <DashboardOverview />
      
      <h2>Exhibition Management</h2>
<form onSubmit={addExhibition}>
  <h3>
  {editingId === null ? 'Add Exhibition' : 'Edit Exhibition'}
</h3>

  <input
    type="text"
    placeholder="Exhibition name"
    value={title}
    onChange={(event) => setTitle(event.target.value)}
  />

  <input
    type="date"
    value={date}
    onChange={(event) => setDate(event.target.value)}
  />
  <textarea
    placeholder="Exhibition description"
    value={description}
    onChange={(event) => setDescription(event.target.value)}
  />
  <input
    type="text"
    placeholder="Image URL"
    value={imageUrl}
    onChange={(event) => setImageUrl(event.target.value)}
  />
  <select
    value={status}
    onChange={(event) => setStatus(event.target.value)}
  >
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
          {exhibitions.map(function (exhibition) {
            return (
              <tr key={exhibition.id}>
                <td>{exhibition.title}</td>
                <td>{exhibition.date}</td>
                <td>{exhibition.status}</td>
                <td>{exhibition.description}</td>
                <td>
                 <img
                  src={exhibition.imageUrl}
                  alt={exhibition.title}
                  className="exhibition-image"
                 />
                </td>
                <td>
                  <button onClick={() => startEdit(exhibition)}>
  Edit
</button>
                  <button onClick={() => deleteExhibition(exhibition.id)}>
  Delete
</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <EventManagement />
      <VisitorInfoEditor />
    </div>
  )
}

export default App