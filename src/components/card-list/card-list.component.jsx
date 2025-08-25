import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./card-list.style.css";

const CardList = ({ pokemons, showBack = false, showShiny = false }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const scrollY = window.scrollY;
        return () => window.scrollTo(0, scrollY);
    }, []);

    const handleClick = (name) => navigate(`/pokemon/${name}`);
    const getIdFromUrl = (url) => url.slice(0, -1).split("/").pop();
    const formatId = (id) => `#${String(id).padStart(3, "0")}`;
    const titleCase = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    // Build animated URL per toggle state
    const animUrl = (name, back, shiny) => {
        // dirs: normal | back-normal | shiny | back-shiny
        let dir = "normal";
        if (back && shiny) dir = "back-shiny";
        else if (back) dir = "back-normal";
        else if (shiny) dir = "shiny";
        return `https://img.pokemondb.net/sprites/black-white/anim/${dir}/${name}.gif`;
    };

    return (
        <div className="card-list">
            {pokemons.map((p) => {
                const id = getIdFromUrl(p.url);
                const animated = animUrl(p.name, showBack, showShiny);

                // Fallbacks (static sprites)
                const fallbackNormal = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
                const fallbackShiny  = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`;
                const fallback = showShiny ? fallbackShiny : fallbackNormal;

                return (
                    <div
                        key={p.name}
                        className="card-container"
                        onClick={() => handleClick(p.name)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleClick(p.name)}
                        aria-label={`Open details for ${p.name}`}
                    >
                        <div className="sprite-box">
                            <img
                                src={animated}
                                alt={`${p.name} sprite`}
                                loading="lazy"
                                decoding="async"
                                onError={(e) => {
                                    e.currentTarget.onerror = null; // avoid loop
                                    e.currentTarget.src = fallback;
                                }}
                            />
                            <span className="id-tag">{formatId(id)}</span>
                        </div>

                        <h3 className="card-name">{titleCase(p.name)}</h3>
                    </div>
                );
            })}
        </div>
    );
};

export default CardList;
