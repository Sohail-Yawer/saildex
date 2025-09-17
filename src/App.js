// App.js
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import CardList from './components/card-list/card-list.component';
import SearchBox from './components/search-box/search-box.component';
import CardDetails from './components/card-details/card-details.component';
import FilterBar from './components/filter-bar/filter-bar.component';

import TurnBackToggle from "./components/topbar/turn-back/turn-back.component";
import ShinyDexToggle from './components/topbar/shinydex/shinydex.component';
import DarkModeToggle from './components/topbar/darkmode/darkmode.component';
import ScrollJumpButton from "./components/scroll-jump/scroll-jump.component";

import './App.css';

const API = 'https://pokeapi.co/api/v2';

// helper to parse ID from URL like /pokemon/6/
const getIdFromUrl = (url) => url.slice(0, -1).split('/').pop();

// ======= Species ID sets for form filters =======
const MEGA_SPECIES_IDS = new Set([3,6,9,15,18,65,80,94,115,127,130,142,150,181,208,212,214,229,248,254,257,260,282,303,306,308,310,319,323,334,354,359,362,373,376,380,381,384,428,445,448,460,475,531,719]);
const ALOLAN_IDS = new Set([19,20,26,27,28,37,38,50,51,52,53,74,75,76,88,89,103,105]);
const GALARIAN_IDS = new Set([52,77,78,79,80,83,110,122,144,145,146,199,222,263,264,554,555,562,618]);
const HISUIAN_IDS = new Set([58,59,100,101,157,211,215,503,549,570,571,628,705,706,713,724]);

class App extends Component {
    constructor() {
        super();
        const storedSearchField = sessionStorage.getItem('searchField') || '';
        const storedShowBack  = sessionStorage.getItem('showBack')  === '1';
        const storedShowShiny = sessionStorage.getItem('showShiny') === '1';
        const storedDarkMode  = sessionStorage.getItem('darkMode')  === '1';

        this.state = {
            pokemons: [],
            displayPokemons: [],
            searchField: storedSearchField,
            types: [],
            generations: [],
            filters: { name: storedSearchField, type: null, region: null, form: null },
            showBack: storedShowBack,
            showShiny: storedShowShiny,
            darkMode: storedDarkMode,
            loading: false,
            error: null,
        };
    }

    componentDidMount() {
        this.applyTheme(this.state.darkMode);
        fetch(`${API}/pokemon/?limit=1025`)
            .then(res => res.json())
            .then(data => {
                const pokemons = data.results || [];
                this.setState({ pokemons }, () => {
                    this.applyFilters();
                    this.loadDictionaries();
                });
            })
            .catch(e => this.setState({ error: String(e) }));
    }

    applyTheme = (isDark) => {
        const root = document.documentElement;
        root.classList.toggle('theme-dark',  !!isDark);
        root.classList.toggle('theme-light', !isDark);
    };

    loadDictionaries = async () => {
        await Promise.all([this.loadTypes(), this.loadGenerations()].map(p => p.catch(() => {})));
    };

    loadTypes = async () => {
        try {
            const typesRes = await fetch(`${API}/type`).then(r => r.json());
            this.setState({ types: (typesRes.results || []).filter(t => t.name !== 'shadow' && t.name !== 'unknown') });
        } catch (e) { this.setState({ error: String(e) }); }
    };

    loadGenerations = async () => {
        try {
            const gensRes = await fetch(`${API}/generation`).then(r => r.json());
            const regionNames = [
                'Kanto (Gen I)','Johto (Gen II)','Hoenn (Gen III)',
                'Sinnoh (Gen IV)','Unova (Gen V)','Kalos (Gen VI)',
                'Alola (Gen VII)','Galar (Gen VIII)','Paldea (Gen IX)',
            ];
            const mapped = (gensRes.results || []).map((g, i) => ({
                name: g.name,
                displayName: regionNames[i] || g.name
            }));
            this.setState({ generations: mapped });
        } catch (e) { this.setState({ error: String(e) }); }
    };

    onSearchChange = (e) => {
        const searchField = e.target.value.toLowerCase();
        sessionStorage.setItem('searchField', searchField);
        this.setState(
            prev => ({ searchField, filters: { ...prev.filters, name: searchField } }),
            this.applyFilters
        );
    };

    onFilterChange = (partial) => {
        this.setState(prev => ({ filters: { ...prev.filters, ...partial } }), this.applyFilters);
    };

    resetFilters = () => {
        sessionStorage.setItem('searchField', '');
        this.setState({ searchField: '', filters: { name: '', type: null, region: null, form: null } }, this.applyFilters);
    };

    applyFilters = async () => {
        const { pokemons, filters } = this.state;
        this.setState({ loading: true, error: null });
        try {
            let candidateNames = pokemons.map(p => p.name);
            if (filters.type) {
                const typeData = await fetch(`${API}/type/${filters.type}`).then(r => r.json());
                const typeSet = new Set(typeData.pokemon.map(x => x.pokemon.name));
                candidateNames = candidateNames.filter(n => typeSet.has(n));
            }
            if (filters.region) {
                const genData = await fetch(`${API}/generation/${filters.region}`).then(r => r.json());
                const genSet = new Set(genData.pokemon_species.map(x => x.name));
                candidateNames = candidateNames.filter(n => genSet.has(n));
            }
            if (filters.form) {
                const nameToId = new Map(pokemons.map(p => [p.name, Number(getIdFromUrl(p.url))]));
                const formSet =
                    filters.form === 'mega' ? MEGA_SPECIES_IDS :
                        filters.form === 'alolan' ? ALOLAN_IDS :
                            filters.form === 'galarian' ? GALARIAN_IDS :
                                filters.form === 'hisuian' ? HISUIAN_IDS : null;
                if (formSet) {
                    candidateNames = candidateNames.filter(n => formSet.has(nameToId.get(n)));
                }
            }
            const q = (filters.name || '').trim().toLowerCase();
            if (q) candidateNames = candidateNames.filter(n => n.includes(q));
            const byName = new Map(pokemons.map(p => [p.name, p]));
            const displayPokemons = candidateNames.map(n => byName.get(n)).filter(Boolean);
            this.setState({ displayPokemons, loading: false });
        } catch (e) {
            this.setState({ error: String(e), loading: false });
        }
    };

    toggleBack = () => {
        this.setState(prev => ({ showBack: !prev.showBack }),
            () => sessionStorage.setItem('showBack', this.state.showBack ? '1' : '0'));
    };
    toggleShiny = () => {
        this.setState(prev => ({ showShiny: !prev.showShiny }),
            () => sessionStorage.setItem('showShiny', this.state.showShiny ? '1' : '0'));
    };
    toggleDarkMode = () => {
        this.setState(prev => ({ darkMode: !prev.darkMode }),
            () => { sessionStorage.setItem('darkMode', this.state.darkMode ? '1' : '0'); this.applyTheme(this.state.darkMode); });
    };

    render() {
        const { pokemons, displayPokemons, searchField, types, generations, filters, loading, error, showBack, showShiny, darkMode } = this.state;
        const logoSrc = `${process.env.PUBLIC_URL}/${darkMode ? 'SAIL-s-Pokedex-Logo_darkmode.png' : 'SAIL-s-Pokedex-Logo.png'}`;

        const homeContent = (
            <div>
                {/* Top-right controls */}
                <div style={{ position: "absolute", top: 12, right: 16, display: "flex", gap: 12, alignItems: "center", zIndex: 10 }}>
                    <TurnBackToggle showBack={showBack} onToggle={this.toggleBack} />
                    <ShinyDexToggle showShiny={showShiny} onToggle={this.toggleShiny} />
                    <DarkModeToggle darkMode={darkMode} onToggle={this.toggleDarkMode} />
                </div>
                <ScrollJumpButton />

                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "5px" }}>
                    <img src={logoSrc} alt="SAIL's Pokédex Logo" style={{ maxWidth: "500px", height: "auto" }} />
                </div>

                <SearchBox className="pokemons-search-box" placeholder="Search for Pokémon" onChangeHandler={this.onSearchChange} searchField={searchField} />
                <FilterBar types={types} generations={generations} filters={filters} onFilterChange={this.onFilterChange} onReset={this.resetFilters} />

                {loading && <p>Filtering…</p>}
                {error && <p style={{ color: 'salmon' }}>{error}</p>}

                <CardList pokemons={displayPokemons} showBack={showBack} showShiny={showShiny} />
            </div>
        );

        return (
            <div className="App" style={{ position: 'relative' }}>
                <Router basename="/saildex">
                    <Routes>
                        <Route path="/" element={homeContent} />
                        <Route path="/pokemon/:name" element={<CardDetails pokemons={pokemons} />} />
                    </Routes>
                </Router>
            </div>
        );
    }
}

export default App;
