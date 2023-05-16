import { Component } from "react";

class CardList extends Component{

    render() {
        console.log(this.props);
        const {pokemons} = this.props;
        return (
            <div>
               {pokemons.map((pokemon)=> (
                <h1 key = {pokemon.id}>{pokemon.name}</h1>
               ))}
            </div>
        );
    }
}

export default CardList;