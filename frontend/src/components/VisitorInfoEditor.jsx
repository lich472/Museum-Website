
import { useState, useEffect } from 'react'
import axios from '../lib/axios'
import { toast } from 'react-hot-toast'

function VisitorInfoEditor() {
  const [monday, setMonday] = useState('10:00–17:00')
  const [tuesday, setTuesday] = useState('10:00–17:00')
  const [wednesday, setWednesday] = useState('10:00–17:00')
  const [thursday, setThursday] = useState('10:00–17:00')
  const [friday, setFriday] = useState('10:00–17:00')
  const [saturday, setSaturday] = useState('10:00–17:00')
  const [sunday, setSunday] = useState('Closed')
  const [closedDates, setClosedDates] = useState('2026-12-25')

  const [address, setAddress] = useState('123 Main St, Adelaide SA')
  const [latitude, setLatitude] = useState('-34.9285')
  const [longitude, setLongitude] = useState('138.6007')

  const [wheelchairAccess, setWheelchairAccess] = useState(true)
  const [parking, setParking] = useState(
    'Free onsite parking, 2 accessible bays'
  )
  const [sensoryFriendlyHours, setSensoryFriendlyHours] = useState(
    'First Tuesday of the month, 9:00–10:00'
  )
  const [facilities, setFacilities] = useState(
    'Café, Gift Shop, Restrooms, Cloakroom'
  )

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadVisitorInfo() {
      try {
        const response = await axios.get('/visitor-info')
        const info = response.data.visitorInfo ?? response.data

        setMonday(info.openingHours?.monday ?? '10:00–17:00')
        setTuesday(info.openingHours?.tuesday ?? '10:00–17:00')
        setWednesday(info.openingHours?.wednesday ?? '10:00–17:00')
        setThursday(info.openingHours?.thursday ?? '10:00–17:00')
        setFriday(info.openingHours?.friday ?? '10:00–17:00')
        setSaturday(info.openingHours?.saturday ?? '10:00–17:00')
        setSunday(info.openingHours?.sunday ?? 'Closed')

        setClosedDates(info.closedDates ?? '')
        setAddress(info.address ?? '')
        setLatitude(String(info.latitude ?? ''))
        setLongitude(String(info.longitude ?? ''))
        setWheelchairAccess(info.wheelchairAccess ?? false)
        setParking(info.parking ?? '')
        setSensoryFriendlyHours(info.sensoryFriendlyHours ?? '')
        setFacilities(info.facilities ?? '')
      } catch (error) {
        console.error('Failed to load visitor information:', error)
        toast.error('Failed to load visitor information.')
      } finally {
        setLoading(false)
      }
    }

    loadVisitorInfo()
  }, [])

  async function saveVisitorInfo(e) {
    e.preventDefault()

    const visitorInfo = {
      openingHours: {
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
        sunday,
      },
      closedDates,
      address,
      latitude: Number(latitude),
      longitude: Number(longitude),
      wheelchairAccess,
      parking,
      sensoryFriendlyHours,
      facilities,
    }

    try {
      setSaving(true)

      await axios.put('/visitor-info', visitorInfo)

      toast.success('Visitor information saved successfully!')

      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Failed to save visitor information:', error)
      toast.error('Failed to save visitor information. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <section className="management-section">Loading visitor information...</section>
  }

  return (
    <section className="management-section">
      <h2>Opening Hours and Visitor Information</h2>

      <form onSubmit={saveVisitorInfo}>
        <h3>Opening Hours</h3>

        <label>
          Monday
          <input type="text" value={monday} onChange={(e) => setMonday(e.target.value)} />
        </label>

        <label>
          Tuesday
          <input type="text" value={tuesday} onChange={(e) => setTuesday(e.target.value)} />
        </label>

        <label>
          Wednesday
          <input type="text" value={wednesday} onChange={(e) => setWednesday(e.target.value)} />
        </label>

        <label>
          Thursday
          <input type="text" value={thursday} onChange={(e) => setThursday(e.target.value)} />
        </label>

        <label>
          Friday
          <input type="text" value={friday} onChange={(e) => setFriday(e.target.value)} />
        </label>

        <label>
          Saturday
          <input type="text" value={saturday} onChange={(e) => setSaturday(e.target.value)} />
        </label>

        <label>
          Sunday
          <input type="text" value={sunday} onChange={(e) => setSunday(e.target.value)} />
        </label>

        <label>
          Closed Dates
          <input
            type="text"
            placeholder="YYYY-MM-DD"
            value={closedDates}
            onChange={(e) => setClosedDates(e.target.value)}
          />
        </label>

        <h3>Location</h3>

        <label>
          Address
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>

        <label>
          Latitude
          <input
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
          />
        </label>

        <label>
          Longitude
          <input
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
          />
        </label>

        <h3>Accessibility and Facilities</h3>

        <label>
          <input
            type="checkbox"
            checked={wheelchairAccess}
            onChange={(e) => setWheelchairAccess(e.target.checked)}
          />
          Wheelchair Access
        </label>

        <label>
          Parking
          <textarea value={parking} onChange={(e) => setParking(e.target.value)} />
        </label>

        <label>
          Sensory Friendly Hours
          <input
            type="text"
            value={sensoryFriendlyHours}
            onChange={(e) => setSensoryFriendlyHours(e.target.value)}
          />
        </label>

        <label>
          Facilities
          <input
            type="text"
            value={facilities}
            onChange={(e) => setFacilities(e.target.value)}
          />
        </label>

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Visitor Information'}
        </button>
      </form>
    </section>
  )
}

export default VisitorInfoEditor
