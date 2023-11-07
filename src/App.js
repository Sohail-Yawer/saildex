import {Component} from 'react';
import CardList from './components/card-list/card-list.component';
import SearchBox from './components/search-box/search-box.component';
import CardDetails from './components/card-details/card-details.component';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import './App.css';

class App extends Component {

  constructor() {
    super();

    this.state = {
      pokemons: [],
      searchField: ''
    };
  }

  componentDidMount() {
    fetch('https://pokeapi.co/api/v2/pokemon/?limit=1016')
    .then( (response) => response.json())
    .then( (users) => this.setState( () => {
      return {pokemons : users.results}
    }
     ));
  }

  onSearchChange = (event)=>{
    console.log(event.target.value);

    const searchField = event.target.value.toLocaleLowerCase();

    

    this.setState(() => {
      return { searchField};
    });



  };

  render() {

    const {pokemons, searchField} = this.state;
    const {onSearchChange} = this;
    const filteredPokemon = pokemons.filter( (pokemon) => {
      return pokemon.name.toLocaleLowerCase().includes(searchField);
    });
    return (
     
      <div className="App">
        <Router>
          <Switch>
            <Route exact path="/" render={() => (
              <div>
                <SearchBox
                  className="pokemons-search-box"
                  placeholder="Search for Pokémon"
                  onChangeHandler={onSearchChange}
                />
                <CardList pokemons={filteredPokemon} />
              </div>
            )} />
            <Route path="/pokemon/:name" component={CardDetails} />
          </Switch>
        </Router>
      </div>
     
    );
  }
}

export default App;
