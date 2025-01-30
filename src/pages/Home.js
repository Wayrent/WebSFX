import React, { useState, useEffect } from 'react';
import { getSounds } from '../services/api';
import SoundItem from '../components/SoundItem';

const Home = () => {
  const [sounds, setSounds] = useState([]);

  useEffect(() => {
    getSounds()
      .then(response => setSounds(response.data))
      .catch(error => console.error('Error fetching sounds:', error));
  }, []);

  return (
    <div>
      <h1>Sound Library</h1>
      <form method="get" action="/sounds" className="form-container">
        <div className="input-group flex-grow-1">
          <input type="text" className="form-control" name="search" placeholder="Search by title, category, or tags" />
          <div className="input-group-append">
            <button type="submit" className="btn btn-primary" title="Найти">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
      </form>
      <ul className="list-group mt-3">
        {sounds.map(sound => (
          <SoundItem key={sound.id} sound={sound} />
        ))}
      </ul>
    </div>
  );
};

export default Home;
