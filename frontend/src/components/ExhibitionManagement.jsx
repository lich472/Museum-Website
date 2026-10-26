import { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';
import RichTextEditor from './RichTextEditor';
import { stripHtml } from '../utils/richText';

const emptyForm = {
  title: '',
  description: '',
  imageUrl: '',
  startDate: '',
  endDate: '',
  status: 'upcoming',
  room: '',
  tags: '',
  isHighlight: false,
};

export default function ExhibitionManagement({ onCountChange }) {
  const [exhibitions, setExhibitions] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  // Bumped when the form is reset or a record is opened for editing, so the
  // rich text editor reloads its text instead of keeping what was typed before.
  const [formVersion, setFormVersion] = useState(0);

  useEffect(() => {
    fetchExhibitions();
  }, []);

  async function fetchExhibitions() {
    try {
      const res = await axios.get('/exhibitions');
      const fetchedList = res.data?.exhibitions || [];

      setExhibitions(fetchedList);
      onCountChange?.(fetchedList.length);
    } catch (err) {
      console.error('Failed to load exhibitions:', err);
      toast.error('Failed to load exhibitions');
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function resetForm() {
    setFormData({ ...emptyForm });
    setEditingId(null);
    setFormVersion((v) => v + 1);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // The editor is not a real input, so `required` can't check the
    // description: stripHtml also catches one that is only empty paragraphs.
    if (
      !formData.title.trim() ||
      !stripHtml(formData.description) ||
      !formData.imageUrl.trim() ||
      !formData.startDate ||
      !formData.room.trim()
    ) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (formData.endDate && formData.endDate < formData.startDate) {
      toast.error('End date cannot be before start date.');
      return;
    }

    const payload = {
      ...formData,
      endDate: formData.endDate || formData.startDate,
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ''),
    };

    try {
      let res;

      if (editingId) {
        res = await axios.put(`/exhibitions/${editingId}`, payload);

        setExhibitions((previous) =>
          previous.map((item) => (item._id === editingId ? res.data : item))
        );

        toast.success('Exhibition updated successfully');
      } else {
        res = await axios.post('/exhibitions/createExhibition', payload);

        setExhibitions((previous) => [...previous, res.data]);

        toast.success('Exhibition created successfully');
      }

      const updatedList = await axios.get('/exhibitions');
      const fetchedList = updatedList.data?.exhibitions || [];

      setExhibitions(fetchedList);
      onCountChange?.(fetchedList.length);

      resetForm();
    } catch (err) {
      console.error('Failed to save exhibition:', err.response?.data || err.message);

      toast.error(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to save exhibition'
      );
    }
  }

  function startEdit(item) {
    setFormData({
      title: item.title || '',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      startDate: item.startDate ? item.startDate.split('T')[0] : '',
      endDate: item.endDate ? item.endDate.split('T')[0] : '',
      status: item.status || 'upcoming',
      room: item.room || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
      isHighlight: item.isHighlight || false,
    });

    setEditingId(item._id);
    setFormVersion((v) => v + 1);
  }

  async function deleteExhibition(id) {
    if (!window.confirm('Are you sure you want to delete this exhibition?')) {
      return;
    }

    try {
      await axios.delete(`/exhibitions/${id}`);

      const updatedList = exhibitions.filter((item) => item._id !== id);

      setExhibitions(updatedList);
      onCountChange?.(updatedList.length);

      if (editingId === id) {
        resetForm();
      }

      toast.success('Exhibition removed successfully');
    } catch (err) {
      console.error('Failed to delete exhibition:', err.response?.data || err.message);

      toast.error('Failed to delete exhibition');
    }
  }

  return (
    <section className="management-section" style={{ marginBottom: '3rem' }}>
      <h2>Exhibition Management</h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          maxWidth: '640px',
          marginBottom: '2rem',
        }}
      >
        <h3>{editingId ? 'Edit Exhibition' : 'Add Exhibition'}</h3>

        <label>Exhibition Name *</label>
        <input
          name="title"
          type="text"
          placeholder="Exhibition name"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <RichTextEditor
          key={`${editingId ?? 'new'}-${formVersion}`}
          label="Description *"
          value={formData.description}
          onChange={(html) => setFormData((prev) => ({ ...prev, description: html }))}
        />

        <label>Image URL *</label>
        <input
          name="imageUrl"
          type="url"
          placeholder="https://example.com/image.jpg"
          value={formData.imageUrl}
          onChange={handleChange}
          required
        />

        <label>Start Date *</label>
        <input
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
          required
        />

        <label>End Date</label>
        <input
          name="endDate"
          type="date"
          value={formData.endDate}
          min={formData.startDate || undefined}
          onChange={handleChange}
        />

        <label>Status *</label>
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="upcoming">Upcoming</option>
          <option value="current">Live</option>
          <option value="past">Archived</option>
        </select>

        <label>Room *</label>
        <select name="room" value={formData.room} onChange={handleChange} required>
          <option value="" disabled>Select a room...</option>
          <option value="Gallery A">Gallery A</option>
          <option value="Gallery B">Gallery B</option>
          <option value="Gallery C">Gallery C</option>
          <option value="Gallery D">Gallery D</option>
        </select>

        <label>Tags</label>
        <input
          name="tags"
          type="text"
          placeholder="e.g. history, culture, photography"
          value={formData.tags}
          onChange={handleChange}
        />
        <small>Separate tags with commas.</small>

        <label>
          <input
            name="isHighlight"
            type="checkbox"
            checked={formData.isHighlight}
            onChange={handleChange}
          />
          {' '}Feature this exhibition as a highlight
        </label>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit">{editingId ? 'Save Changes' : 'Add Exhibition'}</button>

          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
              <th>Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Room</th>
              <th>Tags</th>
              <th>Highlight</th>
              <th>Description</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {exhibitions.map((item) => {
              const preview = stripHtml(item.description);
              return (
                <tr key={item._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td>{item.title}</td>
                  <td>{item.startDate ? item.startDate.split('T')[0] : ''}</td>
                  <td>{item.endDate ? item.endDate.split('T')[0] : ''}</td>
                  <td>{item.status}</td>
                  <td>{item.room || '-'}</td>
                  <td>{Array.isArray(item.tags) ? item.tags.join(', ') : '-'}</td>
                  <td>{item.isHighlight ? 'Yes' : 'No'}</td>
                  <td>{preview.length > 80 ? `${preview.slice(0, 80)}…` : preview}</td>
                  <td>
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="exhibition-image"
                        style={{ width: '50px', height: 'auto' }}
                      />
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      style={{ marginRight: '0.5rem' }}
                    >
                      Edit
                    </button>

                    <button type="button" onClick={() => deleteExhibition(item._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}

            {exhibitions.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '1rem' }}>
                  No exhibitions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}