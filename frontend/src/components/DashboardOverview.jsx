function DashboardOverview({
  totalExhibitions,
  totalCollections,
  totalEvents,
  totalCapacity,
  availableSpots,
}) {
  const stats = [
    { id: 1, label: 'Total Exhibitions', value: totalExhibitions },
    { id: 2, label: 'Total Collection Items', value: totalCollections },
    { id: 3, label: 'Total Events', value: totalEvents },
    { id: 4, label: 'Total Event Capacity', value: totalCapacity },
    { id: 5, label: 'Available Event Spots', value: availableSpots },
  ];

  return (
    <section className="dashboard-overview">
      <h2>Dashboard Overview</h2>
      <div className="summary-grid">
        {stats.map((stat) => (
          <div className="summary-card" key={stat.id}>
            <p>{stat.label}</p>
            <strong>{stat.value ?? 0}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export default DashboardOverview;