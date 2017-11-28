import React, { Component } from 'react';
import '../App.css';


class Card extends Component {

  render() {
    const left = String(this.props.x) + "px";
    const top = String(this.props.y) + "px";

    return (
      <div className="card" style={{ color: 'pink', left: left, top: top }}>
        {this.props.war.name}
      </div>
    );
  }
}

export default Card;
