/* eslint-disable no-control-regex */
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

    return <p className="dex-text">{currentText}</p>;
};

const CardDetails = () => {
    const [pokemonDetails, setPokemonDetails] = useState(null);
    const [pokedexEntry, setPokedexEntry] = useState('');
    const [evolutionChain, setEvolutionChain] = useState([]);
    const [evolutionChainDetails, setEvolutionChainDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shinyChecked, setShinyChecked] = useState(false);

    const navigate = useNavigate();
    const { name } = useParams();

    const handleBack = () => navigate('/');

    // helpers
    const cleanPokemonName = (name) => {
        let cleanedName = name.toLowerCase();
        cleanedName = cleanedName.replace('mega-x', '006_f2');
        cleanedName = cleanedName.replace('mega-y', 'megay');
        cleanedName = cleanedName.replace('gmax', 'gigantamax');
        cleanedName = cleanedName.replace('-amped','');
        cleanedName = cleanedName.replace('-normal','');
        cleanedName = cleanedName.replace('-ordinary','');
        cleanedName = cleanedName.replace('-land','');
        cleanedName = cleanedName.replace('-incarnate','');
        cleanedName = cleanedName.replace('-altered','');

        if (cleanedName === 'nidoran-m') return cleanedName.replace('-m','-m');
        if (cleanedName === 'nidoran-f') return cleanedName.replace('-f','-f');
        if (cleanedName === 'mr-mime' || cleanedName === 'mr-rime') return cleanedName.replace('-','.');
        if (cleanedName === 'mime-jr') return cleanedName.replace('-','_');
        return cleanedName;
    };

    const isShinyAvailable =
        pokemonDetails && pokemonDetails.sprites && pokemonDetails.sprites.front_shiny;

    const spriteUrl =
        pokemonDetails
            ? shinyChecked && isShinyAvailable
                ? `https://img.pokemondb.net/sprites/home/shiny/2x/${cleanPokemonName(pokemonDetails.name)}.jpg`
                : `https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/${String(
                    pokemonDetails.id
                ).padStart(3, '0')}.png`
            : '';

    const handleShinyCheckboxChange = () => setShinyChecked((prev) => !prev);

    const parseEvolutionChain = (chain) => {
        const result = [];
        const walk = (node) => {
            result.push(node.species.name);
            if (node.evolves_to.length > 0) walk(node.evolves_to[0]);
        };
        walk(chain);
        return result;
    };

    useEffect(() => {
        const fetchEvolutionChainDetails = async (chain) => {
            const details = [];
            const walk = async (node) => {
                const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${node.species.name}`);
                const data = await res.json();
                details.push(data);
                if (node.evolves_to.length > 0) await walk(node.evolves_to[0]);
            };
            await walk(chain);
            setEvolutionChainDetails(details);
        };

        fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
            .then((r) => r.json())
            .then((data) => {
                setPokemonDetails(data);
                return fetch(data.species.url);
            })
            .then((r) => r.json())
            .then((speciesData) => {
                const entry = speciesData.flavor_text_entries.find((e) => e.language.name === 'en');
                if (entry) setPokedexEntry(entry.flavor_text.replace(/\u000C/g, ' '));

                return fetch(speciesData.evolution_chain.url).then((r) => r.json());
            })
            .then((evoData) => {
                const chain = parseEvolutionChain(evoData.chain);
                setEvolutionChain(chain);
                return (async () => {
                    await fetchEvolutionChainDetails(evoData.chain);
                    setLoading(false);
                })();
            })
            .catch(() => setLoading(false));
    }, [name]);

    // click evo card to navigate + refresh entry
    const handleEvolutionPokemonClick = async (pokemonName) => {
        try {
            setLoading(true);
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
            const data = await res.json();

            const speciesRes = await fetch(data.species.url);
            const speciesData = await speciesRes.json();
            const entry = speciesData.flavor_text_entries.find((e) => e.language.name === 'en');
            const cleaned = entry ? entry.flavor_text.replace(/\u000C/g, ' ') : '';

            setPokemonDetails(data);
            setPokedexEntry(cleaned);

            // navigate after state updates
            setTimeout(() => navigate(`/pokemon/${pokemonName}`), 0);
        } catch (e) {
            // swallow
        } finally {
            setLoading(false);
        }
    };

    if (loading || !pokemonDetails) {
        return <div>Loading...</div>;
    }

    // some quick displays
    const idPadded = `#${String(pokemonDetails.id).padStart(3, '0')}`;
    const heightM = `${(pokemonDetails.height / 10).toFixed(1)} m`;
    const weightKg = `${(pokemonDetails.weight / 10).toFixed(1)} kg`;

    return (
        <div className="details-page">
            <Link className="back-button" to="/" onClick={handleBack}>
                &lt; Back
            </Link>

            <h1 className="details-title">
                {pokemonDetails.name.charAt(0).toUpperCase() + pokemonDetails.name.slice(1)}
            </h1>

            <div className="details-grid">
                {/* LEFT COLUMN */}
                <div className="col-left">
                    {/* Sprite panel */}
                    <div className="panel sprite-panel">
                        <div className="sprite-stage">
                            <img src={spriteUrl} alt={`pokemon ${pokemonDetails.name}`} />
                        </div>

                         {/*Shiny checkbox under image*/}
                        {isShinyAvailable && (
                            <label className="shiny-toggle">
                                <input
                                    type="checkbox"
                                    checked={shinyChecked}
                                    onChange={handleShinyCheckboxChange}
                                />
                                Shiny
                            </label>
                        )}
                    </div>

                    {/* Pokédex entry NOW on the left */}
                    <div className="panel training-panel">
                        <h2 className="panel-title">Pokédex entry</h2>
                        <Typewriter text={pokedexEntry} delay={50} />
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="col-right">
                    {/* Pokédex data NOW on the right */}
                    <div className="panel info-panel">
                        <h2 className="panel-title">Pokédex data</h2>
                        <div className="info-row">
                            <span className="info-key">National №</span>
                            <span className="info-val">{idPadded}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-key">Type</span>
                            <span className="info-val">
          {pokemonDetails.types.map((t, i) => (
              <span key={i} className={`type type-${t.type.name}`}>{t.type.name}</span>
          ))}
        </span>
                        </div>
                        <div className="info-row">
                            <span className="info-key">Height</span>
                            <span className="info-val">{heightM}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-key">Weight</span>
                            <span className="info-val">{weightKg}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-key">Abilities</span>
                            <span className="info-val">
          {pokemonDetails.abilities.map((a, idx) => (
              <span key={idx} className="ability-chip">{a.ability.name}</span>
          ))}
        </span>
                        </div>
                    </div>

                    {/* Evolution chain stays under it on the right */}
                    <div className="panel breeding-panel">
                        <h2 className="panel-title">Evolution chain</h2>
                        <div className="evolution-chain-container">
                            {evolutionChainDetails.map((p, idx) => {
                                const img =
                                    shinyChecked && p?.sprites?.front_shiny
                                        ? p.sprites.front_shiny
                                        : p.sprites.front_default;
                                return (
                                    <div
                                        key={idx}
                                        className="evolution-chain-item"
                                        onClick={() => handleEvolutionPokemonClick(p.name)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) =>
                                            (e.key === 'Enter' || e.key === ' ') &&
                                            handleEvolutionPokemonClick(p.name)
                                        }
                                        aria-label={`View ${p.name}`}
                                    >
                                        <img src={img} alt={p.name} />
                                        <p>{p.name}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default CardDetails;
