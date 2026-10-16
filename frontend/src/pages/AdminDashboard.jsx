import { useState } from 'react';
import DashboardOverview from '../components/DashboardOverview';
import ExhibitionManagement from '../components/ExhibitionManagement';
import EventManagement from '../components/EventManagement';
import CollectionManagement from '../components/CollectionManagement';
import VisitorInfoEditor from '../components/VisitorInfoEditor';

import '../AdminDashboard.css';

export default function AdminDashboard() {
  const [totalExhibitions, setTotalExhibitions] = useState(0);
  const [totalCollections, setTotalCollections] = useState(0);
  const [eventStats, setEventStats] = useState({
    totalEvents: 0,
    totalCapacity: 0,
    availableSpots: 0
  });

  return (
    <div className="admin-page-container">

      <div className="admin-page">
        <h1>Museum Admin Dashboard</h1>
        <p>Manage museum exhibitions, events and collections.</p>

        <DashboardOverview
          totalExhibitions={totalExhibitions}
          totalCollections={totalCollections}
          totalEvents={eventStats.totalEvents}
          totalCapacity={eventStats.totalCapacity}
          availableSpots={eventStats.availableSpots}
        />

        <ExhibitionManagement onCountChange={setTotalExhibitions} />
        <EventManagement onStatsChange={setEventStats} />
        <CollectionManagement onCountChange={setTotalCollections} />
        <VisitorInfoEditor />
      </div>

    </div>
  );
}