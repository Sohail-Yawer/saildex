import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./card-list.style.css";

const CardList = ({ pokemons }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const scrollY = window.scrollY;
        return () => window.scrollTo(0, scrollY);
    }, []);

    const handleClick = (name) => navigate(`/pokemon/${name}`);
    const getIdFromUrl = (url) => url.slice(0, -1).split("/").pop();
    const formatId = (id) => `#${String(id).padStart(3, "0")}`;
    const titleCase = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    return (
        <div className="card-list">
            {pokemons.map((p) => {
                const id = getIdFromUrl(p.url);
                return (
                    <div
                        key={p.name}
                        className="card-container"
                        onClick={() => handleClick(p.name)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) =>
                            (e.key === "Enter" || e.key === " ") && handleClick(p.name)
                        }
                        aria-label={`Open details for ${p.name}`}
                    >
                        <div className="sprite-box">
                            <img
                                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                                alt={`${p.name} sprite`}
                                loading="lazy"
                                decoding="async"
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
