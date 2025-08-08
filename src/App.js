// App.js
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CardList from './components/card-list/card-list.component';
import SearchBox from './components/search-box/search-box.component';
import CardDetails from './components/card-details/card-details.component';
import FilterBar from './components/filter-bar/filter-bar.component';

import './App.css';

const API = 'https://pokeapi.co/api/v2';

class App extends Component {
    constructor() {
        super();

        const storedSearchField = sessionStorage.getItem('searchField') || '';

        this.state = {
            pokemons: [],            // full {name, url} list
            displayPokemons: [],     // filtered list
            searchField: storedSearchField,
            types: [],
            filters: { name: storedSearchField, type: null },
            loading: false,
            error: null,
        };
    }

    componentDidMount() {
        fetch(`${API}/pokemon/?limit=1292`)
            .then((response) => response.json())
            .then((data) => {
                const pokemons = data.results || [];
                this.setState({ pokemons }, () => {
                    // apply any stored search on load
                    this.applyFilters();
                    // preload type list
                    this.loadTypes();
                });
            })
            .catch((e) => this.setState({ error: String(e) }));
    }

    loadTypes = async () => {
        try {
            const typesRes = await fetch(`${API}/type`).then(r => r.json());
            this.setState({
                types: typesRes.results || [],
            });
        } catch (e) {
            this.setState({ error: String(e) });
        }
    };

    onSearchChange = (event) => {
        const searchField = event.target.value.toLowerCase();
        sessionStorage.setItem('searchField', searchField);
        this.setState(
            (prev) => ({
                searchField,
                filters: { ...prev.filters, name: searchField },
            }),
            this.applyFilters
        );
    };

    onFilterChange = (partial) => {
        this.setState(
            (prev) => ({ filters: { ...prev.filters, ...partial } }),
            this.applyFilters
        );
    };

    resetFilters = () => {
        sessionStorage.setItem('searchField', '');
        this.setState(
            {
                searchField: '',
                filters: { name: '', type: null },
            },
            this.applyFilters
        );
    };

    applyFilters = async () => {
        const { pokemons, filters } = this.state;

        this.setState({ loading: true, error: null });
        try {
            // Start with all names
            let candidateNames = pokemons.map(p => p.name);

            // TYPE filter (server-side)
            if (filters.type) {
                const typeData = await fetch(`${API}/type/${filters.type}`).then(r => r.json());
                const typeSet = new Set(typeData.pokemon.map(x => x.pokemon.name));
                candidateNames = candidateNames.filter(n => typeSet.has(n));
            }

            // NAME filter
            const q = (filters.name || '').trim().toLowerCase();
            if (q) candidateNames = candidateNames.filter(n => n.includes(q));

            // Map back to objects for CardList
            const byName = new Map(pokemons.map(p => [p.name, p]));
            const displayPokemons = candidateNames.map(n => byName.get(n)).filter(Boolean);

            this.setState({ displayPokemons, loading: false });
        } catch (e) {
            this.setState({ error: String(e), loading: false });
        }
    };

    render() {
        const {
            pokemons,
            displayPokemons,
            searchField,
            types,
            filters,
            loading,
            error
        } = this.state;

        return (
            <div className="App">
                <Router>
                    <Routes>
                        <Route
                            exact
                            path="/"
                            element={
                                <div>
                                    {/* Type Filter Bar */}


                                    {/* Search Box */}
                                    <SearchBox
                                        className="pokemons-search-box"
                                        placeholder="Search for Pokémon"
                                        onChangeHandler={this.onSearchChange}
                                        searchField={searchField}
                                    />
                                    <FilterBar
                                        types={types}
                                        filters={filters}
                                        onFilterChange={this.onFilterChange}
                                        onReset={this.resetFilters}
                                        loadDictionaries={this.loadTypes}
                                    />

                                    {loading && <p>Filtering…</p>}
                                    {error && <p style={{ color: 'salmon' }}>{error}</p>}

                                    <CardList pokemons={displayPokemons} />
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