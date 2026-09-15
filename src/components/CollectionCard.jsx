function CollectionCard({ item, number }) {
  return (
    <article className="collection-card">

      <div className="collection-image">
        <span>{number}</span>
      </div>

      <div className="collection-card-content">

        <p className="collection-category">
          {item.category}
        </p>

        <h3>{item.title}</h3>

        <div className="collection-metadata">
          <span>{item.period}</span>
          <span>{item.origin}</span>
        </div>

        <p className="collection-description">
          {item.description}
        </p>

      </div>

    </article>
  );
}

export default CollectionCard;