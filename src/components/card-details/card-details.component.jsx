import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './card-details.style.css';

const Typewriter = ({ text, delay }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prevText) => prevText + text[currentIndex]);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return <p>{currentText}</p>;
};

const CardDetails = () => {
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [pokedexEntry, setPokedexEntry] = useState('');
  const [evolutionChain, setEvolutionChain] = useState([]);
  const [evolutionChainDetails, setEvolutionChainDetails] = useState([]);
  const navigate = useNavigate();
  const { name } = useParams();

  const handleBack = () => {
    navigate('/');
  };

  useEffect(() => {
    const fetchEvolutionChainDetails = async (chain) => {
      const details = [];
      const processChain = async (node) => {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${node.species.name}`);
        const data = await response.json();
        details.push(data);
        if (node.evolves_to.length > 0) {
          await processChain(node.evolves_to[0]);
        }
      };
      await processChain(chain);
      setEvolutionChainDetails(details);
    };

    fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
      .then((response) => response.json())
      .then((data) => {
        setPokemonDetails(data);

        fetch(data.species.url)
          .then((speciesResponse) => speciesResponse.json())
          .then((speciesData) => {
            const flavorTextEntry = speciesData.flavor_text_entries.find(
              (entry) => entry.language.name === 'en'
            );

            if (flavorTextEntry) {
              const cleanedText = flavorTextEntry.flavor_text.replace(/\u000C/g,' ');
                console.log(cleanedText);

              setPokedexEntry(cleanedText);
            }

            // Fetch evolution chain information
            fetch(speciesData.evolution_chain.url)
              .then((evolutionChainResponse) => evolutionChainResponse.json())
              .then((evolutionChainData) => {
                const chain = parseEvolutionChain(evolutionChainData.chain);
                setEvolutionChain(chain);
                fetchEvolutionChainDetails(evolutionChainData.chain);
              })
              .catch((evolutionChainError) => {
                console.error('Error fetching Pokemon evolution chain:', evolutionChainError);
              });
          })
          .catch((speciesError) => {
            console.error('Error fetching Pokemon species details:', speciesError);
          });
      })
      .catch((error) => {
        console.error('Error fetching Pokemon details:', error);
      });
  }, [name]);

  const parseEvolutionChain = (chain) => {
    const result = [];
    const processChain = (node) => {
      result.push(node.species.name);
      if (node.evolves_to.length > 0) {
        processChain(node.evolves_to[0]);
      }
    };
    processChain(chain);
    return result;
  };

  if (!pokemonDetails || !evolutionChain.length || !evolutionChainDetails.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className="card-details-container">
      <Link className="back-button" to="/" onClick={handleBack}>
        &lt; Back
      </Link>
  
      <div>
        <h2>Pokemon Details for: {pokemonDetails.name}</h2>
        <img
          src={pokemonDetails.sprites.front_default}
          alt={`pokemon ${pokemonDetails.name}`}
        />
        <div className="details-row">
          <div className='abilities-container'>
            <h3>Abilities:</h3>
            
              {pokemonDetails.abilities.map((ability, index) => (
                <li key={index}>{ability.ability.name}</li>
              ))}
            
          </div>
          <div>
            <h3 className="types-title">Type:</h3>
            <div className="types-container">
              {pokemonDetails.types.map((type, index) => (
                <div key={index} className={`type type-${type.type.name}`}>
                  {type.type.name}
                </div>
              ))}
            </div>
          </div>
        </div>
        <h2>Pokedex Entry:</h2>
        <Typewriter text={pokedexEntry} delay={50} />
        <h2>Evolution Chain:</h2>
        <div className="evolution-chain-container">
          {evolutionChainDetails.map((pokemon, index) => (
            <div key={index} className="evolution-chain-item">
              <img src={pokemon.sprites.front_default} alt={`pokemon ${pokemon.name}`} />
              <p>{pokemon.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
};

export default CardDetails;
