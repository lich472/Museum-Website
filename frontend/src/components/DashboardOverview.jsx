function DashboardOverview({ totalExhibitions, totalEvents, totalCapacity, availableSpots }) {
  const stats = [
    { id: 1, label: 'Total Exhibitions', value: totalExhibitions },
    { id: 2, label: 'Total Events', value: totalEvents },
    { id: 3, label: 'Total Event Capacity', value: totalCapacity },
    { id: 4, label: 'Available Event Spots', value: availableSpots }
  ];

  return (
    <section className="dashboard-overview">
      <h2>Dashboard Overview</h2>
      <div className="summary-grid">
        {stats.map((stat) => (
          <div className="summary-card" key={stat.id}>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export default DashboardOverview;
