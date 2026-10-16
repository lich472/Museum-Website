import { useState, useEffect } from 'react';
import axios from '../lib/axios'; // Targets your custom axiosInstance
import { toast } from 'react-hot-toast';

export default function ExhibitionManagement({ onCountChange }) {
  const [exhibitions, setExhibitions] = useState([]);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('Upcoming');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Fetch all exhibitions on component mount
  useEffect(() => {
    fetchExhibitions();
  }, []);

  async function fetchExhibitions() {
    try {
      const res = await axios.get('/exhibitions');
      const fetchedList = res.data?.exhibitions || [];
      setExhibitions(fetchedList);
      onCountChange(fetchedList.length);
    } catch (err) {
      console.error(err.response?.status, err.response?.data);
      toast.error(err.response?.data?.message || 'Failed to load exhibitions');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || !startDate) {
      toast.error('Please enter the exhibition name and start date.');
      return;
    }

    const payload = { 
      title, 
      description, 
      imageUrl, 
      startDate, 
      endDate: endDate || startDate, 
      status 
    };

    try {
      if (editingId !== null) {
        const res = await axios.put(`/exhibitions/${editingId}`, payload);
        const saved = res.data?.exhibition ?? res.data;

        if (saved && typeof saved === 'object' && saved._id) {
          setExhibitions(exhibitions.map(item => item._id === editingId ? saved : item));
        } else {
          // 2xx but no saved record in the body: reload the server's truth
          // rather than guessing.
          await fetchExhibitions();
        }
        toast.success('Exhibition updated successfully');
      } else {
        const res = await axios.post('/exhibitions', payload);
        const saved = res.data?.exhibition ?? res.data;

        if (saved && typeof saved === 'object' && saved._id) {
          const updatedList = [...exhibitions, saved];
          setExhibitions(updatedList);
          onCountChange(updatedList.length);
        } else {
          await fetchExhibitions();
        }
        toast.success('Exhibition created successfully');
      }

      setTitle('');
      setStartDate('');
      setEndDate('');
      setStatus('Upcoming');
      setDescription('');
      setImageUrl('');
    } catch (err) {
      // A rejected request is a failure: reload the real rows from the database
      // and say so, rather than claiming the change was saved.
      console.error('Failed to save exhibition:', err.response?.status, err.response?.data);
      await fetchExhibitions();
      toast.error(err.response?.data?.message || 'Failed to save exhibition');
    } finally {
      setEditingId(null);
    }
  }


  function startEdit(item) {
    setTitle(item.title);
    setStartDate(item.startDate ? item.startDate.split('T')[0] : '');
    setEndDate(item.endDate ? item.endDate.split('T')[0] : '');
    setStatus(item.status);
    setDescription(item.description || '');
    setImageUrl(item.imageUrl || '');
    setEditingId(item._id); // MongoDB uses _id instead of id
  }

  async function deleteExhibition(id) {
    if (!window.confirm('Are you sure you want to delete this exhibition?')) return;
    try {
      await axios.delete(`/exhibitions/${id}`);
      const updatedList = exhibitions.filter(item => item._id !== id);
      setExhibitions(updatedList);
      onCountChange(updatedList.length);
      toast.success('Exhibition removed successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete exhibition');
    }
  }

  return (
    <section className="management-section" style={{ marginBottom: '3rem' }}>
      <h2>Exhibition Management</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '500px', marginBottom: '2rem' }}>
        <h3>{editingId === null ? 'Add Exhibition' : 'Edit Exhibition'}</h3>
        <input type="text" placeholder="Exhibition name" value={title} onChange={(e) => setTitle(e.target.value)} />
        
        <label style={{ fontSize: '0.85rem' }}>Start Date</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        
        <label style={{ fontSize: '0.85rem' }}>End Date</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        
        <textarea placeholder="Exhibition description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input type="text" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Upcoming">Upcoming</option>
          <option value="Live">Live</option>
          <option value="Archived">Archived</option>
        </select>
        <button type="submit">{editingId === null ? 'Add Exhibition' : 'Save Changes'}</button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <caption className="visually-hidden">
          Exhibitions, with start and end dates, status and row actions
        </caption>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
            <th scope="col">Name</th>
            <th scope="col">Start Date</th>
            <th scope="col">End Date</th>
            <th scope="col">Status</th>
            <th scope="col">Description</th>
            <th scope="col">Image</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {exhibitions.map((item) => (
            <tr key={item._id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{item.title}</td>
              <td>{item.startDate ? item.startDate.split('T')[0] : ''}</td>
              <td>{item.endDate ? item.endDate.split('T')[0] : ''}</td>
              <td>{item.status}</td>
              <td>{item.description}</td>
              <td>
                {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="exhibition-image" style={{ width: '50px', height: 'auto' }} />}
              </td>
              <td>
                <button type="button" onClick={() => startEdit(item)} aria-label={`Edit ${item.title}`} style={{ marginRight: '0.5rem' }}>Edit</button>
                <button type="button" onClick={() => deleteExhibition(item._id)} aria-label={`Delete ${item.title}`}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
