import React from "react";
import { useEffect } from 'react';

import { useNavigate } from "react-router-dom";

import './card-list.style.css';

const CardList = ({ pokemons }) => {
  const navigate = useNavigate();


  useEffect(() => {
    // Save scroll position when the component mounts
    const scrollPosition = window.scrollY;

    // Return a cleanup function to restore scroll position when the component unmounts
    return () => {
      window.scrollTo(0, scrollPosition);
    };
  }, []);

  const handleClick = (pokemonName) => {
    console.log('You clicked on = ', pokemonName);
    navigate(`/pokemon/${pokemonName}`);
  };

  

  return (
    <div className="card-list">
      {pokemons.map((pokemon) => (
        <div className="card-container" key={pokemon.name} onClick={() => handleClick(pokemon.name)}>
          <img
            alt={`pokemon ${pokemon.name}`}
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.url.substr(0, pokemon.url.length - 1).split('/').pop()}.png`}
          />
          <h2>{pokemon.name}</h2>
        </div>
      ))}
    </div>
  );
};

export default CardList;
