function DashboardOverview({
  totalExhibitions,
  totalEvents,
  totalCapacity,
  availableSpots
}) {
  
  const stats = [
    { id: 1, label: 'Total Exhibitions', value: totalExhibitions },
    { id: 2, label: 'Total Events', value: totalEvents },
    { id: 3, label: 'Total Event Capacity', value: totalCapacity },
    { id: 4, label: 'Available Event Spots', value: availableSpots }
  ]

  // make one card out of each stat
  let cards = []

  for (let i = 0; i < stats.length; i++) {
    let card = (
      <div className="summary-card" key={stats[i].id}>
        <p>{stats[i].label}</p>
        <strong>{stats[i].value}</strong>
      </div>
    )

    cards.push(card)
  }

  return (
    <section className="dashboard-overview">
      <h2>Dashboard Overview</h2>

      <div className="summary-grid">{cards}</div>
    </section>
  )
}

export default DashboardOverview
