import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CardList from './components/card-list/card-list.component';
import SearchBox from './components/search-box/search-box.component';
import CardDetails from './components/card-details/card-details.component';

import './App.css';

class App extends Component {
  constructor() {
    super();

    this.state = {
      pokemons: [],
      searchField: '',
    };
  }

  componentDidMount() {
    // Retrieve searchField from session storage
    const storedSearchField = sessionStorage.getItem('searchField');

    this.setState(() => ({
      // Use the stored value if available, otherwise default to an empty string
      searchField: storedSearchField || '',
    }));

    fetch('https://pokeapi.co/api/v2/pokemon/?limit=1292')
      .then((response) => response.json())
      .then((users) =>
        this.setState(() => {
          return { pokemons: users.results };
        })
      );
  }

  onSearchChange = (event) => {
    const searchField = event.target.value.toLowerCase();

    this.setState(() => {
      return { searchField };
    });

    // Store searchField in session storage
    sessionStorage.setItem('searchField', searchField);
  };

  render() {
    const { pokemons, searchField } = this.state;
    const { onSearchChange } = this;
    const filteredPokemon = pokemons.filter((pokemon) => {
      return pokemon.name.toLowerCase().includes(searchField);
    });

    return (
      <div className="App">
        <Router>
          <Routes>
            <Route
              exact
              path="/"
              element={
                <div>
                  <SearchBox
                    className="pokemons-search-box"
                    placeholder="Search for Pokémon"
                    onChangeHandler={onSearchChange}
                    // Set the input value from the state
                    value={searchField}
                  />
                  <CardList pokemons={filteredPokemon} />
                </div>
              }
            />
            <Route path="/pokemon/:name" element={<CardDetails pokemons={pokemons} />} />
          </Routes>
        </Router>
      </div>
    );
  }
}

export default App;
