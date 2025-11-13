import { useEffect, useState } from 'react';
import { getAllTours } from '../api/tourApi';
import TourCard from '../components/TourCard';

export default function Tours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllTours()
      .then((data) => {
        setTours(data);
      })
      .catch((err) => {
        console.error('Error fetching tours:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="tours-page">
        <h2 className="page-title">All Tours</h2>
        <p className="loading-text">Loading tours...</p>
      </section>
    );
  }

  return (
    <section className="tours-page">
      <h2 className="page-title">All Tours</h2>

      {tours.length === 0 ? (
        <p className="empty-text">No tours available at the moment.</p>
      ) : (
        <div className="tours-grid">
          {tours.map((tour) => (
            <TourCard key={tour._id} tour={tour} />
          ))}
        </div>
      )}
    </section>
  );
}
