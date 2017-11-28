import React, { Component } from 'react';
import '../App.css';

const LINEHEIGHT = 80; // for 80vh
const YEAR_OFFSET = 10;
const CURSOR_OFFSET = 11;

class Timeline extends Component {

  render() {
    const total = this.props.end - this.props.start;
    const offset = ((this.props.year - this.props.start) / total) * LINEHEIGHT;

    return (
      <div className="timeline">
        <div className="year" style={{ top: (YEAR_OFFSET + offset).toString() + "vh" }}>
            {this.props.year}
        </div>
        <div className="timeline-cursor" style={{ top: (CURSOR_OFFSET + offset).toString() + "vh" }}></div>
        <div className="timeline-line"></div>
      </div>
    );
  }
}

export default Timeline;
