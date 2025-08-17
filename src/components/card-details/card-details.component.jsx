/* eslint-disable no-control-regex */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './card-details.style.css';

/** ===================== Helpers ===================== **/

// Normalize for PokéDB (name-based shiny host, used for "normal" shiny when no form override)
const cleanPokemonNameForShiny = (name) => {
    let n = (name || '').toLowerCase().trim();
    n = n.replace('gmax', 'gigantamax');
    n = n.replace('-amped', '');
    n = n.replace('-normal', '');
    n = n.replace('-ordinary', '');
    n = n.replace('-land', '');
    n = n.replace('-incarnate', '');
    n = n.replace('-altered', '');
    n = n.replace('-origin', '');
    // punctuation quirks
    if (n === 'mr-mime' || n === 'mr-rime') n = n.replace('-', '-'); // mr.mime / mr.rime
    if (n === 'mime-jr') n = n.replace('-', '-');                    // mime_jr
    if (n === 'nidoran-m' || n === 'nidoran-f') return n;            // keep
    return n;
};

// Map species name → /pokemon/ endpoint name for evo-chain fetches
// Giratina base species must be fetched as 'giratina-altered'
const pokemonApiNameForSpecies = (speciesName) => {
    if (speciesName === 'giratina') return 'giratina-altered';
    if (speciesName === 'deoxys') return 'deoxys-normal';
    if (speciesName === 'keldeo') return 'keldeo-ordinary';
    if (speciesName === 'toxtricity') return 'toxtricity-amped';
    return speciesName;
};

// Pokémon.com art builder (numeric ID + optional suffix)
const pokemonComArt = (id3, suffix = '') =>
    `https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/${id3}${suffix}.png`;

// ---- Single-mega species (show one "Mega" tab with _f2 + standard shiny pattern) ----
const MEGA_SINGLE_SPECIES = new Set([
    // Kanto
    3, 9, 15, 18, 65, 80, 94, 115, 127, 130, 142,
    // Johto
    181, 208, 212, 214, 229, 248,
    // Hoenn
    254, 257, 260, 282, 303, 306, 308, 310, 319, 323, 334, 354, 359, 362, 373, 376,
    // Sinnoh
    380, 381, 384, 428, 445, 448, 460, 475,
    // Unova+
    531, 719,
]);
// (Charizard 6, Mewtwo 150 are excluded since they have X/Y tabs)

// ---- Special multi-form tabs (Megas X/Y, Kyurem, Giratina, Primal, Origin, etc.) ----
// Each tab: { key, label, normalSuffix, shiny: () => url | null }
const FORM_TABS = {
    //Venasaur Gmax
    3:[
        {key: 'gmax', label: 'Gigantamax', normalSuffix:'_f3',
           // shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/venasaur-gmax.jpg'
        },
    ],
    // Charizard (X/Y)
    6: [
        { key: 'mega-x', label: 'Mega X', normalSuffix: '_f2',
            shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/charizard-mega-x.jpg' },
        { key: 'mega-y', label: 'Mega Y', normalSuffix: '_f3',
            shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/charizard-mega-y.jpg' },
        {key: 'gmax', label: 'Gigantamax', normalSuffix:'_f4',
            // shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/venasaur-gmax.jpg'
        },
    ],
    // Blastoise gmax
    9:[
        {key: 'gmax', label: 'Gigantamax', normalSuffix:'_f3',
            // shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/venasaur-gmax.jpg'
        },
    ],
    //Butterfree gmax
    12: [
        {key: 'gmax', label: 'Gigantamax', normalSuffix:'_f2',
            // shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/venasaur-gmax.jpg'
        },
    ],
    //Pikachu gmax
    25:[
        {key: 'gmax', label: 'Gigantamax', normalSuffix:'_f2',
            // shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/venasaur-gmax.jpg'
        },
    ],
    //Meowth gmax
    52:[
        {key: 'gmax', label: 'Gigantamax', normalSuffix:'_f4',
            // shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/venasaur-gmax.jpg'
        },
    ],
    //Machamp gmax
    68:[
        {key: 'gmax', label: 'Gigantamax', normalSuffix:'_f2',}
    ],
    // Gengar gmax
    94:[
        {key: 'gmax', label: 'Gigantamax', normalSuffix:'_f3',}
    ],
    //Kingler gmax
    99:[
        {key: 'gmax', label: 'Gigantamax', normalSuffix:'_f2',}
    ],
    //Lapras gmax
    131:[
        {key: 'gmax', label: 'Gigantamax', normalSuffix:'_f2',}
    ],
    //Eevee gmax
    133:[

        {key: 'gmax', label: 'Gigantamax', normalSuffix:'_f2',},
    ],
    // Snorlax gmax
    143:[
        {key: 'gmax', label: 'Gigantamax', normalSuffix:'_f2',}
    ],

    // Mewtwo (X/Y)
    150: [
        { key: 'mega-x', label: 'Mega X', normalSuffix: '_f2',
            shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/mewtwo-mega-x.jpg' },
        { key: 'mega-y', label: 'Mega Y', normalSuffix: '_f3',
            shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/mewtwo-mega-y.jpg' },
    ],
    // Kyurem (White/Black)
    646: [
        { key: 'white', label: 'White', normalSuffix: '_f2',
            shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/kyurem-white.jpg' },
        { key: 'black', label: 'Black', normalSuffix: '_f3',
            shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/kyurem-black.jpg' },
    ],
    // Giratina (Altered/Origin)
    487: [

        { key: 'origin', label: 'Origin', normalSuffix: '_f2',
            shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/giratina-origin.jpg' },
    ],
    // Dialga (Origin)
    483: [
        { key: 'origin', label: 'Origin', normalSuffix: '_f2',
            shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/dialga-origin.jpg' },
    ],
    // Palkia (Origin)
    484: [
        { key: 'origin', label: 'Origin', normalSuffix: '_f2',
            shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/palkia-origin.jpg' },
    ],
    // Primal Kyogre
    382: [
        { key: 'primal', label: 'Primal', normalSuffix: '_f2',
            shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/kyogre-primal.jpg' },
    ],
    // Primal Groudon
    383: [
        { key: 'primal', label: 'Primal', normalSuffix: '_f2',
            shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/groudon-primal.jpg' },
    ],
    //Deoxys Attack,Defense and Speed
    386: [
        { key: 'attack', label: 'Attack', normalSuffix: '_f2',
            shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/deoxys-attack.jpg'},
        { key: 'defense', label: 'Defense', normalSuffix: '_f3',
            shiny:() => 'https://img.pokemondb.net/sprites/home/shiny/2x/deoxys-defense.jpg'},
        { key: 'speed', label: 'Speed', normalSuffix: '_f4',
            shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/deoxys-speed.jpg'}
    ],
    //Keldeo Resolute
    647: [
        {key: 'resolute', label: 'Resolute', normalSuffix: '_f2',
            shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/keldeo-resolute.jpg'}
    ],
    //Garbodor gmax
    569: [
        {key: 'gmax', label: 'Gigantamax', normalSuffix: '_f2',},
    ],
    //Melmetal gmax
    809: [
        {key: 'gmax', label: 'Gigantamax', normalSuffix: '_f2',},
    ],
    //cinderace gmax
    815:[
        {key: 'gmax', label: 'Gigantamax', normalSuffix: '_f2',},
    ],
    //Inteleon gmax
    818:[
        {key: 'gmax', label: 'Gigantamax', normalSuffix:'_f2',
        // shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/venasaur-gmax.jpg'
    },],
    //corviknight gmax
    823:[
        {key: 'gmax', label: 'Gigantamax', normalSuffix: '_f2',},
    ],
    //orbeetle gmax
    826:[
        {key: 'gmax', label: 'Gigantamax', normalSuffix:'_f2',
            // shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/venasaur-gmax.jpg'
        },
    ],
    //Drednaw gmax
    834:[
        {key: 'gmax', label: 'Gigantamax', normalSuffix:'_f2',
            // shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/venasaur-gmax.jpg'
        },
    ],
    //coalossal gmax
    839:[
        {key: 'gmax', label: 'Gigantamax', normalSuffix:'_f2',
            // shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/venasaur-gmax.jpg'
        },
    ],
    //Flapple gmax
    841:[
        {key: 'gmax', label: 'Gigantamax', normalSuffix:'_f2',
            // shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/venasaur-gmax.jpg'
        },
    ],
    //Appletun gmax
    842:[
        {key: 'gmax', label: 'Gigantamax', normalSuffix:'_f2',
            // shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/venasaur-gmax.jpg'
        },
    ],
    //Sandaconda gmax
    844:[
        {key: 'gmax', label: 'Gigantamax', normalSuffix:'_f2',
            // shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/venasaur-gmax.jpg'
        },
    ],
    //Toxtricity amped and gmax
    849:[
        {key: 'Amped form', label: 'Amped form', normalSuffix:'_f2',
            shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/toxtricity-amped.jpg'},
        {key: 'gmax', label: 'Gigantamax', normalSuffix:'_f3',}
    ],
    //Centiskorch gmax
    851:[
        {key: 'gmax', label: 'Gigantamax', normalSuffix:'_f2',
            // shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/venasaur-gmax.jpg'
        },
    ],
    //Hatterene gmax
    858:[
        {key: 'gmax', label: 'Gigantamax', normalSuffix:'_f2',
            // shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/venasaur-gmax.jpg'
        },
    ],
    //Grimmsnarl gmax
    861:[
        {key: 'gmax', label: 'Gigantamax', normalSuffix:'_f2',
            // shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/venasaur-gmax.jpg'
        },
    ],
    //Alcremie gmax
    869:[
        {key: 'gmax', label: 'Gigantamax', normalSuffix:'_f2',
            // shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/venasaur-gmax.jpg'
        },
    ],
    //Copperjah gmax
    879:[
        {key: 'gmax', label: 'Gigantamax', normalSuffix:'_f2',
            // shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/venasaur-gmax.jpg'
        },
    ],
    //duraludon gmax
    884:[
        {key: 'gmax', label: 'Gigantamax', normalSuffix:'_f2',
            // shiny: () => 'https://img.pokemondb.net/sprites/home/shiny/2x/venasaur-gmax.jpg'
        },
    ]
};

// ---- Regional forms (Alolan / Galarian / Hisuian) ----
// Each entry: { <form>: { normalSuffix: string, shinySuffix: '-alolan' | '-galarian' | '-hisuian' } }
const REGIONAL_FORMS = {
    /* Alolan */
    19: { alolan: { normalSuffix: '_f2', shinySuffix: '-alolan' } }, // Rattata
    20: { alolan: { normalSuffix: '_f2', shinySuffix: '-alolan' } }, // Raticate
    26: { alolan: { normalSuffix: '_f2', shinySuffix: '-alolan' } }, // Raichu
    27: { alolan: { normalSuffix: '_f2', shinySuffix: '-alolan' } }, // Sandshrew
    28: { alolan: { normalSuffix: '_f2', shinySuffix: '-alolan' } }, // Sandslash
    37: { alolan: { normalSuffix: '_f2', shinySuffix: '-alolan' } }, // Vulpix
    38: { alolan: { normalSuffix: '_f2', shinySuffix: '-alolan' } }, // Ninetales
    50: { alolan: { normalSuffix: '_f2', shinySuffix: '-alolan' } }, // Diglett
    51: { alolan: { normalSuffix: '_f2', shinySuffix: '-alolan' } }, // Dugtrio
    // Meowth exception: _f2 = Alolan, _f3 = Galarian
    52: {
        alolan:  { normalSuffix: '_f2', shinySuffix: '-alolan'  },
        galarian:{ normalSuffix: '_f3', shinySuffix: '-galarian'}
    },
    53: { alolan: { normalSuffix: '_f2', shinySuffix: '-alolan' } }, // Persian (Alola)
    74: { alolan: { normalSuffix: '_f2', shinySuffix: '-alolan' } }, // Geodude
    75: { alolan: { normalSuffix: '_f2', shinySuffix: '-alolan' } }, // Graveler
    76: { alolan: { normalSuffix: '_f2', shinySuffix: '-alolan' } }, // Golem
    88: { alolan: { normalSuffix: '_f2', shinySuffix: '-alolan' } }, // Grimer
    89: { alolan: { normalSuffix: '_f2', shinySuffix: '-alolan' } }, // Muk
    103:{ alolan: { normalSuffix: '_f2', shinySuffix: '-alolan' } }, // Exeggutor
    105:{ alolan: { normalSuffix: '_f2', shinySuffix: '-alolan' } }, // Marowak

    /* Galarian */
    77: { galarian: { normalSuffix: '_f2', shinySuffix: '-galarian' } }, // Ponyta
    78: { galarian: { normalSuffix: '_f2', shinySuffix: '-galarian' } }, // Rapidash
    79: { galarian: { normalSuffix: '_f2', shinySuffix: '-galarian' } }, // Slowpoke
    // Slowbro: _f2 = MEGA (via Mega tab), _f3 = Galarian
    80: { galarian: { normalSuffix: '_f3', shinySuffix: '-galarian' } },
    83: { galarian: { normalSuffix: '_f2', shinySuffix: '-galarian' } }, // Farfetch'd
    110:{ galarian: { normalSuffix: '_f2', shinySuffix: '-galarian' } }, // Weezing
    122:{ galarian: { normalSuffix: '_f2', shinySuffix: '-galarian' } }, // Mr. Mime
    144:{ galarian: { normalSuffix: '_f2', shinySuffix: '-galarian' } }, // Articuno
    145:{ galarian: { normalSuffix: '_f2', shinySuffix: '-galarian' } }, // Zapdos
    146:{ galarian: { normalSuffix: '_f2', shinySuffix: '-galarian' } }, // Moltres
    199:{ galarian: { normalSuffix: '_f2', shinySuffix: '-galarian' } }, // Slowking
    222:{ galarian: { normalSuffix: '_f2', shinySuffix: '-galarian' } }, // Corsola
    263:{ galarian: { normalSuffix: '_f2', shinySuffix: '-galarian' } }, // Zigzagoon
    264:{ galarian: { normalSuffix: '_f2', shinySuffix: '-galarian' } }, // Linoone
    554:{ galarian: { normalSuffix: '_f2', shinySuffix: '-galarian' } }, // Darumaka
    555:{ galarian: { normalSuffix: '_f2', shinySuffix: '-galarian' } }, // Darmanitan
    562:{ galarian: { normalSuffix: '_f2', shinySuffix: '-galarian' } }, // Yamask
    618:{ galarian: { normalSuffix: '_f2', shinySuffix: '-galarian' } }, // Stunfisk

    /* Hisuian */
    58:  { hisuian: { normalSuffix: '_f2', shinySuffix: '-hisuian' } }, // Growlithe
    59:  { hisuian: { normalSuffix: '_f2', shinySuffix: '-hisuian' } }, // Arcanine
    100: { hisuian: { normalSuffix: '_f2', shinySuffix: '-hisuian' } }, // Voltorb
    101: { hisuian: { normalSuffix: '_f2', shinySuffix: '-hisuian' } }, // Electrode
    157: { hisuian: { normalSuffix: '_f2', shinySuffix: '-hisuian' } }, // Typhlosion
    211: { hisuian: { normalSuffix: '_f2', shinySuffix: '-hisuian' } }, // Qwilfish
    215: { hisuian: { normalSuffix: '_f2', shinySuffix: '-hisuian' } }, // Sneasel
    503: { hisuian: { normalSuffix: '_f2', shinySuffix: '-hisuian' } }, // Samurott
    549: { hisuian: { normalSuffix: '_f2', shinySuffix: '-hisuian' } }, // Lilligant
    570: { hisuian: { normalSuffix: '_f2', shinySuffix: '-hisuian' } }, // Zorua
    571: { hisuian: { normalSuffix: '_f2', shinySuffix: '-hisuian' } }, // Zoroark
    628: { hisuian: { normalSuffix: '_f2', shinySuffix: '-hisuian' } }, // Braviary
    705: { hisuian: { normalSuffix: '_f2', shinySuffix: '-hisuian' } }, // Sliggoo
    706: { hisuian: { normalSuffix: '_f2', shinySuffix: '-hisuian' } }, // Goodra
    713: { hisuian: { normalSuffix: '_f2', shinySuffix: '-hisuian' } }, // Avalugg
    724: { hisuian: { normalSuffix: '_f2', shinySuffix: '-hisuian' } }, // Decidueye
};

// Shiny URL builder for single-mega species
const singleMegaShiny = (speciesSlug) =>
    `https://img.pokemondb.net/sprites/home/shiny/2x/${speciesSlug}-mega.jpg`;

// Shiny URL builder for regional forms
const regionalShinyUrl = (speciesSlug, shinySuffix) =>
    `https://img.pokemondb.net/sprites/home/shiny/2x/${speciesSlug}${shinySuffix}.jpg`;

// Build tabs for a species (id + species slug)
const tabsForSpecies = (speciesId, speciesSlug) => {
    const baseTabs = [{ key: 'normal', label: 'Normal', normalSuffix: '', shiny: null }];

    // Fixed multi-form tabs (Megas X/Y, Kyurem, Giratina, Primal, Origin...)
    const fixed = FORM_TABS[speciesId] || [];

    // Single-mega species → add one Mega tab
    const singleMega = MEGA_SINGLE_SPECIES.has(speciesId)
        ? [{
            key: 'mega',
            label: 'Mega',
            normalSuffix: '_f2',
            shiny: () => singleMegaShiny(speciesSlug),
        }]
        : [];

    // Regional forms (Alolan/Galarian/Hisuian)
    const regional = REGIONAL_FORMS[speciesId] || {};
    const regionalTabs = Object.entries(regional).map(([formKey, cfg]) => ({
        key: formKey, // 'alolan' | 'galarian' | 'hisuian'
        label: formKey.charAt(0).toUpperCase() + formKey.slice(1),
        normalSuffix: cfg.normalSuffix,
        shiny: () => regionalShinyUrl(speciesSlug, cfg.shinySuffix),
    }));

    return [...baseTabs, ...fixed, ...singleMega, ...regionalTabs];
};

/** ===================== Typewriter ===================== **/

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

/** ===================== Component ===================== **/

const CardDetails = () => {
    const [pokemonDetails, setPokemonDetails] = useState(null);
    const [pokedexEntry, setPokedexEntry] = useState('');
    const [evolutionChainDetails, setEvolutionChainDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shinyChecked, setShinyChecked] = useState(false);
    const [spriteTab, setSpriteTab] = useState('normal'); // active tab

    const navigate = useNavigate();
    const { name } = useParams();

    const handleBack = () => navigate('/');

    const isShinyAvailable =
        pokemonDetails && pokemonDetails.sprites && pokemonDetails.sprites.front_shiny;

    useEffect(() => {
        // reset tab on Pokémon change
        setSpriteTab('normal');

        const fetchEvolutionChainDetails = async (chain) => {
            const details = [];
            const walk = async (node) => {
                const fetchName = pokemonApiNameForSpecies(node.species.name);
                const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${fetchName}`);
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
                (async () => {
                    await fetchEvolutionChainDetails(evoData.chain);
                    setLoading(false);
                })();
            })
            .catch(() => setLoading(false));
    }, [name]);

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

            setTimeout(() => navigate(`/pokemon/${pokemonName}`), 0);
        } catch (e) {
            // ignore
        } finally {
            setLoading(false);
        }
    };

    if (loading || !pokemonDetails) {
        return <div>Loading...</div>;
    }

    // Basic display values
    const id3 = String(pokemonDetails.id).padStart(3, '0');
    const idPadded = `#${id3}`;
    const heightM = `${(pokemonDetails.height / 10).toFixed(1)} m`;
    const weightKg = `${(pokemonDetails.weight / 10).toFixed(1)} kg`;
    const speciesSlug = pokemonDetails.species.name.toLowerCase();

    // Tabs for current species
    const tabs = tabsForSpecies(pokemonDetails.id, speciesSlug);
    const activeTab = tabs.find((t) => t.key === spriteTab) || tabs[0];

    // Normal art for active tab (pokemon.com)
    const normalArtUrl = pokemonComArt(id3, activeTab.normalSuffix || '');

    // Shiny for active tab:
    // - If tab has form-specific shiny() → use it
    // - Else if Normal tab and API shiny exists → use generic name-based shiny
    const fallbackNormalShiny =
        `https://img.pokemondb.net/sprites/home/shiny/2x/${cleanPokemonNameForShiny(pokemonDetails.name)}.jpg`;
    const tabShinyUrl = activeTab.shiny ? activeTab.shiny() : null;
    const shinyUrl = tabShinyUrl || (activeTab.key === 'normal' && isShinyAvailable ? fallbackNormalShiny : null);

    // Final URL considering checkbox
    const spriteUrl = shinyChecked && shinyUrl ? shinyUrl : normalArtUrl;

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
                    {/* Sprite panel with tabs */}
                    <div className="panel sprite-panel">
                        {tabs.length > 1 && (
                            <div className="sprite-tabs" role="tablist" aria-label="Sprite forms">
                                {tabs.map((t) => (
                                    <button
                                        key={t.key}
                                        type="button"
                                        role="tab"
                                        aria-selected={spriteTab === t.key}
                                        className={`sprite-tab ${spriteTab === t.key ? 'active' : ''}`}
                                        onClick={() => setSpriteTab(t.key)}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="sprite-stage">
                            <img src={spriteUrl} alt={`pokemon ${pokemonDetails.name}`} />
                        </div>

                        {/* Shiny toggle (affects evolution chain sprites too) */}
                        <label className="shiny-toggle">
                            <input
                                type="checkbox"
                                checked={shinyChecked}
                                onChange={() => setShinyChecked((prev) => !prev)}
                            />
                            Shiny
                        </label>
                    </div>

                    {/* Pokédex entry */}
                    <div className="panel training-panel">
                        <h2 className="panel-title">Pokédex entry</h2>
                        <Typewriter text={pokedexEntry} delay={50} />
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="col-right">
                    {/* Pokédex data */}
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
                    <span key={i} className={`type type-${t.type.name}`}>
                    {t.type.name}
                  </span>
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

                    {/* Evolution chain (respects shiny toggle) */}
                    <div className="panel breeding-panel">
                        <h2 className="panel-title">Evolution chain</h2>
                        <div className="evolution-chain-container">
                            {evolutionChainDetails.map((p, idx) => {
                                const img =
                                    (shinyChecked && p?.sprites?.front_shiny)
                                        ? p.sprites.front_shiny
                                        : (p?.sprites?.front_default || '');
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
