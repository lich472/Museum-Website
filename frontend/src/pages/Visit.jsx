import { useState, useEffect } from 'react'
import axios from '../lib/axios'

function Visit() {
  const [openingHours, setOpeningHours] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadVisitorInfo() {
      try {
        const response = await axios.get('/visitor-info')
        const info = response.data.visitorInfo ?? response.data

        setOpeningHours(info.openingHours)
      } catch (error) {
        console.error('Failed to load opening hours:', error)
      } finally {
        setLoading(false)
      }
    }

    loadVisitorInfo()
  }, [])

  return (
    <main>
      <section className="page-header">
        <div className="page-header-content">
          <p className="section-label">PLAN YOUR EXPERIENCE</p>

          <h1>Plan Your Visit</h1>

          <p>
            Everything you need to plan an enjoyable and accessible
            visit to the Regional Museum.
          </p>
        </div>
      </section>

      <section className="visit-section">
        <div className="visit-intro">
          <p className="section-label">VISITOR INFORMATION</p>
          <h2>Welcome to the Regional Museum</h2>

          <p>
            Explore our exhibitions and collections and discover
            stories connecting people, culture and history.
            Use the information below to prepare for your visit.
          </p>
        </div>

        <div className="visit-grid">
          <article className="visit-card">
            <span className="visit-number">01</span>
            <h3>Opening Hours</h3>

            {loading ? (
              <p>Loading opening hours...</p>
            ) : openingHours ? (
              <div>
                <p>Monday – Sunday</p>

                {Object.entries(openingHours).map(([day, hours]) => (
                  <p key={day}>
                    <strong>
                      {day.charAt(0).toUpperCase() + day.slice(1)}:
                    </strong>{' '}
                    {hours}
                  </p>
                ))}
              </div>
            ) : (
              <p>Opening hours are currently unavailable.</p>
            )}
          </article>

          <article className="visit-card">
            <span className="visit-number">02</span>
            <h3>Admission</h3>
            <p>General museum admission</p>
            <strong>Free Entry</strong>
          </article>

          <article className="visit-card">
            <span className="visit-number">03</span>
            <h3>Location</h3>
            <p>Regional Museum</p>
            <strong>Museum Precinct</strong>
          </article>

          <article className="visit-card">
            <span className="visit-number">04</span>
            <h3>Accessibility</h3>
            <p>
              Accessible entrances and visitor facilities are
              available throughout the museum.
            </p>
            <strong>All visitors welcome</strong>
          </article>
        </div>
      </section>
    </main>
  )
}

export default Visit
