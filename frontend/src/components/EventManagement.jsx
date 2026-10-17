import { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';

export default function EventManagement({ onStatsChange }) {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [spotRemaining, setSpotRemaining] = useState('');
  const [type, setType] = useState('');
  const [capacity, setCapacity] = useState('');
  const [location, setLocation] = useState('');
  const [editingId, setEditingId] = useState(null);

  function reportStats(list) {
    const totalCapacity = list.reduce((sum, e) => sum + (Number(e.capacity) || 0), 0);
    const availableSpots = list.reduce((sum, e) => sum + (Number(e.spotRemaining) || 0), 0);
    onStatsChange?.({
      totalEvents: list.length,
      totalCapacity,
      availableSpots,
    });
  }

  function resetForm() {
    setTitle('');
    setDescription('');
    setImageUrl('');
    setStartDate('');
    setEndDate('');
    setSpotRemaining('');
    setType('');
    setCapacity('');
    setLocation('');
    setEditingId(null);
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const res = await axios.get('/events');
      const fetchedList = res.data?.events || [];
      setEvents(fetchedList);
      reportStats(fetchedList);
    } catch (err) {
      console.error(err.response?.status, err.response?.data);
      toast.error('Failed to load events');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || !startDate || !type || !description || !imageUrl || !location || capacity === '') {
      toast.error('Please fill in name, start date, type, description, image URL, location and capacity.');
      return;
    }

    const payload = {
      title,
      description,
      imageUrl,
      startDate,
      endDate: endDate || startDate,
      type,
      location,
      capacity: capacity === '' ? undefined : Number(capacity),
      spotRemaining: spotRemaining === '' ? undefined : Number(spotRemaining),
    };

    try {
      if (editingId !== null) {
        const res = await axios.put(`/events/${editingId}`, payload);
        const saved = res.data?.event ?? res.data;
        const updatedList = events.map(item => (item._id === editingId ? saved : item));
        setEvents(updatedList);
        reportStats(updatedList);
        toast.success('Event updated successfully');
      } else {
        const res = await axios.post('/events', payload);
        const saved = res.data?.event ?? res.data;
        const updatedList = [...events, saved];
        setEvents(updatedList);
        reportStats(updatedList);
        toast.success('Event created successfully');
      }
      resetForm();
    } catch (err) {
      console.error(err.response?.status, err.response?.data);
      toast.error(err.response?.data?.message || 'Failed to save event');
    }
  }

  function startEdit(item) {
    setTitle(item.title);
    setStartDate(item.startDate ? item.startDate.split('T')[0] : '');
    setEndDate(item.endDate ? item.endDate.split('T')[0] : '');
    setDescription(item.description || '');
    setImageUrl(item.imageUrl || '');
    setType(item.type || '');
    setLocation(item.location || '');
    setCapacity(item.capacity ?? '');
    setSpotRemaining(item.spotRemaining ?? '');
    setEditingId(item._id);
  }

  async function deleteEvent(id) {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await axios.delete(`/events/${id}`);
      const updatedList = events.filter(item => item._id !== id);
      setEvents(updatedList);
      reportStats(updatedList);
      toast.success('Event removed successfully');
    } catch (err) {
      toast.error('Failed to delete event');
    }
  }

  return (
    <section className="management-section" style={{ marginBottom: '3rem' }}>
      <h2>Event Management</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '500px', marginBottom: '2rem' }}>
        <h3>{editingId === null ? 'Add Event' : 'Edit Event'}</h3>
        <input type="text" placeholder="Event name" value={title} onChange={(e) => setTitle(e.target.value)} />

        <label style={{ fontSize: '0.85rem' }}>Start Date</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

        <label style={{ fontSize: '0.85rem' }}>End Date</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Select type</option>
          <option value="workshop">Workshop</option>
          <option value="talk">Talk</option>
          <option value="tour">Tour</option>
        </select>

        <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <input type="number" placeholder="Capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
        <input type="number" placeholder="Spots remaining" value={spotRemaining} onChange={(e) => setSpotRemaining(e.target.value)} />

        <textarea placeholder="Event description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input type="text" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        <button type="submit">{editingId === null ? 'Add Event' : 'Save Changes'}</button>
        {editingId !== null && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
            <th>Name</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Type</th>
            <th>Description</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((item) => (
            <tr key={item._id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{item.title}</td>
              <td>{item.startDate ? item.startDate.split('T')[0] : ''}</td>
              <td>{item.endDate ? item.endDate.split('T')[0] : ''}</td>
              <td>{item.type}</td>
              <td>{item.description}</td>
              <td>
                {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="event-image" style={{ width: '50px', height: 'auto' }} />}
              </td>
              <td>
                <button type="button" onClick={() => startEdit(item)} style={{ marginRight: '0.5rem' }}>Edit</button>
                <button type="button" onClick={() => deleteEvent(item._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}