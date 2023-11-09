import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './card-details.style.css';

const CardDetails = () => {
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const navigate = useNavigate();
  const { name } = useParams();

  const handleBack = () => {
    navigate('/');
  };

  useEffect(() => {
    // Save scroll position when the component mounts
    const scrollPosition = window.scrollY;

    // Return a cleanup function to restore scroll position when the component unmounts
    return () => {
      window.scrollTo(0, scrollPosition);
    };
  }, []);

  useEffect(() => {
    fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
      .then((response) => response.json())
      .then((data) => {
        setPokemonDetails(data);
      })
      .catch((error) => {
        console.error('Error fetching Pokemon details:', error);
      });
  }, [name]);

  if (!pokemonDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="card-details-container">
      <Link className="back-button" to="/" onClick={handleBack}>
        &lt; Back
      </Link>

      <div>
        <h2>Pokemon Details for: {pokemonDetails.name}</h2>
        <h3>Abilities:</h3>
        <ul>
          {pokemonDetails.abilities.map((ability, index) => (
            <li key={index}>{ability.ability.name}</li>
          ))}
        </ul>
        <h3>Types:</h3>
        <ul>
          {pokemonDetails.types.map((type, index) => (
            <li key={index} className={`type-${type.type.name}`}>
              {type.type.name}
            </li>
          ))}
        </ul>
      </div>
      {/* Display other Pokemon details here */}
    </div>
  );
};

export default CardDetails;
