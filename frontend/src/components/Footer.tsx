
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import axios from '../lib/axios'

function Footer() {
  const [openingHours, setOpeningHours] = useState(null)
  const location = useLocation()

  useEffect(() => {
    async function loadVisitorInfo() {
      try {
        const response = await axios.get('/visitor-info')
        const info = response.data.visitorInfo ?? response.data
        setOpeningHours(info.openingHours)
      } catch (error) {
        console.error('Failed to load visitor information:', error)
      }
    }

    loadVisitorInfo()
  }, [location.pathname])

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>Regional Museum</h2>
          <p>
            Connecting people with history, culture and stories
            through meaningful museum experiences.
          </p>
        </div>

        <div className="footer-links">
          <h3>Explore</h3>

          <Link to="/">Home</Link>
          <Link to="/exhibitions">Exhibitions</Link>
          <Link to="/collections">Collections</Link>
          <Link to="/visit">Plan Your Visit</Link>
        </div>

        <div className="footer-info">
          <h3>Visit</h3>

          {openingHours ? (
            <>
              {Object.entries(openingHours as Record<string, string>).map(
                ([day, hours]) => (
                  <p key={day}>
                    <strong>{day.charAt(0).toUpperCase() + day.slice(1)}:</strong>{' '}
                    {hours}
                  </p>
                )
              )}
            </>
          ) : (
            <p>Opening hours currently unavailable</p>
          )}

          <p>Free general admission</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Regional Museum. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
