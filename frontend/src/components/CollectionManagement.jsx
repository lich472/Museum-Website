import { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';

export default function CollectionManagement({ onCountChange }) {
  const [collections, setCollections] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [period, setPeriod] = useState('');
  const [origin, setOrigin] = useState('');
  const [editingId, setEditingId] = useState(null);

  function resetForm() {
    setTitle('');
    setDescription('');
    setImageUrl('');
    setCategory('');
    setPeriod('');
    setOrigin('');
    setEditingId(null);
  }

  useEffect(() => {
    fetchCollections();
  }, []);

  async function fetchCollections() {
    try {
      const res = await axios.get('/collections');
      const list = Array.isArray(res.data) ? res.data : res.data?.collections || [];
      setCollections(list);
      onCountChange?.(list.length);
    } catch (err) {
      console.error(err.response?.status, err.response?.data);
      toast.error('Failed to load collections');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || !description || !imageUrl || !category || !period || !origin) {
      toast.error('Please fill in title, description, image URL, category, period and origin.');
      return;
    }

    const payload = { title, description, imageUrl, category, period, origin };

    try {
      if (editingId !== null) {
        const res = await axios.put(`/collections/${editingId}`, payload);
        const saved = res.data?.collection ?? res.data;
        const updatedList = collections.map(item => (item._id === editingId ? saved : item));
        setCollections(updatedList);
        onCountChange?.(updatedList.length);
        toast.success('Collection item updated successfully');
      } else {
        const res = await axios.post('/collections', payload);
        const saved = res.data?.collection ?? res.data;
        const updatedList = [saved, ...collections];
        setCollections(updatedList);
        onCountChange?.(updatedList.length);
        toast.success('Collection item created successfully');
      }
      resetForm();
    } catch (err) {
      console.error(err.response?.status, err.response?.data);
      toast.error(err.response?.data?.message || 'Failed to save collection item');
    }
  }

  function startEdit(item) {
    setTitle(item.title || '');
    setDescription(item.description || '');
    setImageUrl(item.imageUrl || '');
    setCategory(item.category || '');
    setPeriod(item.period || '');
    setOrigin(item.origin || '');
    setEditingId(item._id);
  }

  async function deleteCollection(id) {
    if (!window.confirm('Are you sure you want to delete this collection item?')) return;
    try {
      await axios.delete(`/collections/${id}`);
      const updatedList = collections.filter(item => item._id !== id);
      setCollections(updatedList);
      onCountChange?.(updatedList.length);
      if (editingId === id) resetForm();
      toast.success('Collection item removed successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete collection item');
    }
  }

  return (
    <section className="management-section" style={{ marginBottom: '3rem' }}>
      <h2>Collection Management</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '500px', marginBottom: '2rem' }}
      >
        <h3>{editingId === null ? 'Add Collection Item' : 'Edit Collection Item'}</h3>

        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="text" placeholder="Category (e.g. Pottery, Tools)" value={category} onChange={(e) => setCategory(e.target.value)} />
        <input type="text" placeholder="Period (e.g. 1850s)" value={period} onChange={(e) => setPeriod(e.target.value)} />
        <input type="text" placeholder="Origin (e.g. South Australia)" value={origin} onChange={(e) => setOrigin(e.target.value)} />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input type="text" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />

        <button type="submit">{editingId === null ? 'Add Collection Item' : 'Save Changes'}</button>
        {editingId !== null && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
            <th>Title</th>
            <th>Category</th>
            <th>Period</th>
            <th>Origin</th>
            <th>Description</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {collections.map((item) => (
            <tr key={item._id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{item.title}</td>
              <td>{item.category}</td>
              <td>{item.period}</td>
              <td>{item.origin}</td>
              <td>{item.description}</td>
              <td>
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    style={{ width: '50px', height: 'auto' }}
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </td>
              <td>
                <button type="button" onClick={() => startEdit(item)} style={{ marginRight: '0.5rem' }}>Edit</button>
                <button type="button" onClick={() => deleteCollection(item._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}