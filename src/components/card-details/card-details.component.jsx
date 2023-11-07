import React, { Component } from 'react';
import {  Link,withRouter } from 'react-router-dom';
import './card-details.style.css';

class CardDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pokemonDetails: null,
    };
  }

  handleBack = () => {
    this.props.history.push('/');
    window.open(`/`,"_self");
  };

  componentDidMount() {
    const { match } = this.props;
    const pokemonName = match.params.name;

    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
      .then((response) => response.json())
      .then((data) => {
        this.setState({ pokemonDetails: data });
      })
      .catch((error) => {
        console.error('Error fetching Pokemon details:', error);
      });
  }

  render() {
    const { pokemonDetails } = this.state;

    if (!pokemonDetails) {
      return <div>Loading...</div>;
    }

    return (
      <div >
        <div>
          <Link className="back-button" onClick={this.handleBack} >&lt; Back</Link>
        </div>

        <div>
          <h2>Pokemon Details for: {pokemonDetails.name}</h2>
          <h3>Abilities:</h3>
          <ol>
            {pokemonDetails.abilities.map((ability, index) => (
              <li key={index}>{ability.ability.name}</li>
            ))}
          </ol>
          <h3>Types:</h3>
          <ol>
            {pokemonDetails.types.map((type, index) => (
              <li key={index}>{type.type.name}</li>
            ))}
          </ol>
        </div>
        {/* Display other Pokemon details here */}
      </div>
    );
  }
}

export default withRouter(CardDetails);
