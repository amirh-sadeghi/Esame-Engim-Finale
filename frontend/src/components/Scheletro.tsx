function Scheletro() {
  return (
    <div className="scheletro">
      <div className="scheletro-card">
        <div className="scheletro-titolo" />
        {['80%', '65%', '72%', '58%', '40%'].map((w, i) => (
          <div key={i} className="scheletro-riga" style={{ width: w }} />
        ))}
        <div className="scheletro-btn" />
      </div>
      <div className="scheletro-card">
        <div className="scheletro-riga" style={{ width: '100%' }} />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="scheletro-riga" style={{ width: '100%' }} />
        ))}
      </div>
    </div>
  )
}

export default Scheletro
