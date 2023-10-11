import { Component } from "react";
import './card-details.style.css';

class CardDetails extends Component {
    render() {
      const { match } = this.props;
      const pokemonName = match.params.name; // Extract the Pokemon name from the route
  
      // Fetch and display Pokemon details based on the 'pokemonName'
  
      return (
        <div>
          <h2>Pokemon Details for: {pokemonName}</h2>
          {/* Display other Pokemon details here */}
        </div>
      );
    }
  }
  
  export default CardDetails;
