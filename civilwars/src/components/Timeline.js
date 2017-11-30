import React, { Component } from 'react';
import '../App.css';

const LINEHEIGHT = 80; // for 80vh
const YEAR_OFFSET = 10;
const CURSOR_OFFSET = 11;
const MAPSTART = 1800

class Timeline extends Component {

  render() {
    const total = this.props.end - MAPSTART;
    const offset = ((this.props.year - MAPSTART) / total * LINEHEIGHT);

    if (this.props.isMobile) {
        return (
            <div className="timeline-mobile"
                onMouseDown={(e) => this.props.toggleChangeYear(e, true)}
                onMouseUp={(e) => this.props.toggleChangeYear(e, false)}
                onMouseMove={this.props.changeYear}
                onTouchStart={(e) => this.props.toggleChangeYear(e, true)}
                onTouchEnd={(e) => this.props.toggleChangeYear(e, false)}
                onTouchMove={this.props.changeYear}
            >
                <div className="hoverable">
                  <div style={{ left: offset + "%" }} className="year-mobile">
                      {this.props.year}
                  </div>
                </div>
                <div id="mobile-line" className="timeline-line-mobile"></div>
            </div>
          );
    }

    return (
        <div className="timeline"
          onMouseDown={(e) => this.props.toggleChangeYear(e, true)}
          onMouseUp={(e) => this.props.toggleChangeYear(e, false)}
          onMouseMove={this.props.changeYear}
        >
        <div className="hoverable">
            <div className="year" style={{ top: (YEAR_OFFSET + offset).toString() + "vh" }}>
                {this.props.year}
            </div>
            <div className="timeline-cursor" style={{ top: (CURSOR_OFFSET + offset).toString() + "vh" }}></div>
        </div>
        <div id="line" className="timeline-line"></div>
        </div>
    );
  }
}

export default Timeline;
