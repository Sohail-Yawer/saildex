import { Component } from "react";
import './card-list.style.css'

class CardList extends Component{

    render() {
        console.log(this.props);
        const {pokemons} = this.props;
        return (
            <div className="card-list">
               {pokemons.map((pokemon)=> (
                <div className="card-container" key={pokemon.id}>
                    <img
                        alt={`pokemon ${pokemon.name}`}
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.url.substr(0,pokemon.url.length-1).split('/').pop()}.png`}
                    />
                <h2 >{pokemon.name}</h2>
                </div>
               ))}
            </div>
        );
    }
}

export default CardList;