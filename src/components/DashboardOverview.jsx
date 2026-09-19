function DashboardOverview() {
  const summaryStats = [
    {
      id: 1,
      label: 'Total Exhibitions',
      value: 2
    },
    {
      id: 2,
      label: 'Total Events',
      value: 2
    },
    {
      id: 3,
      label: 'Total Event Capacity',
      value: 60
    },
    {
      id: 4,
      label: 'Available Event Spots',
      value: 32
    }
  ]

  return (
    <section className="dashboard-overview">
      <h2>Dashboard Overview</h2>

      <div className="summary-grid">
        {summaryStats.map(function (stat) {
          return (
            <div className="summary-card" key={stat.id}>
              <p>{stat.label}</p>
              <strong>{stat.value}</strong>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default DashboardOverview