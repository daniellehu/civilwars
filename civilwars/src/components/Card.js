import React, { Component } from 'react';
import '../App.css';


class Card extends Component {

  render() {
    // if country in bottom half of screen, move box above cursor
    // else country is in top half of screen, move box below cursor
    const middleHeight = window.innerHeight / 2;
    const middleWidth = window.innerWidth / 2;
    const directionFactorY = (this.props.y > middleHeight) ? -1 : 1;
    const offsetX = (Math.abs(this.props.x)-middleWidth > 200) ? -350 : 0;
    const offsetY = (Math.abs(this.props.y)-middleHeight > 100) ? this.props.war.description.length : 0;
    const left = String(this.props.x + offsetX) + "px";
    const top = String(this.props.y + directionFactorY * offsetY) + "px";

    let locations = '';
    for (let location of this.props.war.locations) {
        locations = locations + location + ', ';
    }
    locations = locations.substring(0, locations.length - ', '.length);
    
    const casualties = (this.props.war.casualties) ? this.props.war.casualties : 'Unknown';

    return (
      <div className="card" style={{ left: left, top: top }}>
        <h3 className="title">{this.props.war.name}</h3>

        <p className="info">
            <span className="bolded">{locations}</span> 
            ({this.props.war.started}-{this.props.war.ended})
        </p>

        <p className="info"><span className="bolded">Deaths:</span> {casualties}</p> 

        <p className="description">
            {this.props.war.description}
            <a className="link" target='_blank' href={this.props.war.wiki}> See More.</a>
        </p>
      </div>
    );
  }
}

export default Card;
