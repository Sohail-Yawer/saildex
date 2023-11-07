import { Component } from "react";
import {Link, withRouter} from 'react-router-dom';
import './card-details.style.css';

class CardDetails extends Component {

  handleBack = () => {
    this.props.history.push('/'); // Navigate to the CardList component
    window.open(`/`,"_self");
  };

    render() {
      const { match } = this.props;
      const pokemonName = match.params.name; // Extract the Pokemon name from the route
  
      // Fetch and display Pokemon details based on the 'pokemonName'
  
      return (
        <div style={{ position: 'relative' }}>
        <Link to="/" className="back-button" onClick={this.handleBack}>&lt; Back</Link>
        <h2>Pokemon Details for: {pokemonName}</h2>
        {/* Display other Pokemon details here */}
      </div>
      );
    }
  }
  
  export default withRouter(CardDetails);
