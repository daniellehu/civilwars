import React, { Component } from 'react';
import AmCharts from "@amcharts/amcharts3-react";
import 'amcharts3/amcharts/amcharts';
import 'ammap3/ammap/ammap';
import 'amcharts3/amcharts/themes/light';

import Card from './components/Card';
import Timeline from './components/Timeline';

import './App.css';

import civilwars from './data/data_wars';
import isoCountries from './data/data_countries';

const MOBILE_WIDTH = 850;

class App extends Component {

  componentWillMount() {
    const startDates = {};
    const endDates = {};
    let totalCasualties = 0;
    for (let war of civilwars) {
      if (war.started in startDates) {
        startDates[war.started].push(war);
      } else {
        startDates[war.started] = [war];
      }

      if (war.ended in endDates) {
        endDates[war.ended].push(war);
      } else {
        endDates[war.ended] = [war];
      }

      if (war.casualties) {
        totalCasualties += war.casualties;
      }
    }
    
    this.setState({startDates: startDates, endDates: endDates, avgCasualty: totalCasualties / civilwars.length});
  }
  
  componentDidMount() {
    window.addEventListener('mousewheel', this.handleScroll.bind(this));
    window.addEventListener('click', this.handleClick.bind(this));
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('mousewheel', this.handleScroll.bind(this));
    window.removeEventListener('click', this.handleClick.bind(this));
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  generateMapElement(item) {
    const elements = [];
    let casualtyRating = 100;

    if (item.casualties) {
      casualtyRating = Math.max(casualtyRating - 
                      (Math.min(item.casualties, this.state.avgCasualty) / 
                      this.state.avgCasualty) * 50, 50);
    }
    
    const color = "hsl(0, 80%, " + casualtyRating.toString() + "%)";
    for (let country of item.locations) {
      elements.push({
        title: item.name,
        groupId: item.name,
        color: color,
        id: isoCountries[country],
        selectable: true,
      });
    }
   
    return elements;
  }

  toggleChangeYear(event, status) {
    if (status) { // clicked
      this.setState({ changeYearStatus: status, lastYear: this.state.year });
    } else {
      const year = this.state.year;
      const lastYear = this.state.lastYear;

      this.setState({ changeYearStatus: status, lastYear: year }, function() {
        const self = this;
        let wars = this.state.wars.slice();
        let areas = this.state.areas.slice();
        const addWars = [];

        if (lastYear < year) { // if dragging time forward
          // remove outdated civil wars
          for (let i = wars.length - 1; i >= 0; i--) {
            if (wars[i].ended < year || wars[i].started > year) {
              const removedWar = wars.splice(i, 1);
              for (let j = areas.length - 1; j >= 0; j--) {
                if (removedWar.name === areas[j].groupId) {
                  areas.splice(j, 1);
                }
              }
            }
          }
                  
          // add existing civil wars
          for (let y = lastYear; y <= year; y++) {
            if (self.state.startDates[y]) { 
              for (let war of self.state.startDates[y]) {
                if (war.ended >= year || !war.ended) {
                  addWars.push(war);
                }
              }
            }
          }
        } else { // if dragging time backwards
          // remove all civil wars
          wars = [];
          areas = [];

          // add all civil wars up to year
          for (let y = self.state.startYear; y <= year; y++) {
            if (self.state.startDates[y]) { 
              for (let war of self.state.startDates[y]) {
                if (war.ended >= year) {
                  addWars.push(war);
                }
              }
            }
          }
        }
        wars = wars.concat(addWars);
        
        // update data for map
        for (let addWar of addWars) {
          const mapElem = self.generateMapElement(addWar);
          areas = areas.concat(mapElem);
        }

        self.setState({
          wars: wars,
          areas: areas,
        });
      });
    }
  }

  changeYear(event) {
    if (this.state.changeYearStatus) {
      const timelineWidth = document.getElementById('mobile-line').offsetWidth;
      const current = Math.min(event.clientX, timelineWidth);
      const year = 1800 + Math.round((current / timelineWidth) * (this.state.endYear - this.state.startYear + 1));
      this.setState({ year: year });
    }
  }

  handleResize(event) {
    this.setState({ isMobile: event.target.innerWidth <= MOBILE_WIDTH });
  }

  handleClick(event) {
    if (this.state.year < 1800 || this.state.isMobile) return;
    if (event.target.id !== 'selected' &&
        event.target.parentElement.id !== 'selected' &&
        event.target.parentElement.parentElement.id !== 'selected') {
      this.setState({
        selectedWar: null,
      });
    }
  }

  handleScroll(event) {
    if (this.state.isMobile) return;

    if (event.deltaY > this.state.scrollBuffer) {
      if (this.state.year === this.state.endYear + 1) return;
      this.setState({ year: this.state.year + 1 }, function() {
        let wars = this.state.wars.slice();
        let areas = this.state.areas.slice();

        // add civil wars
        const addWars = this.state.startDates[this.state.year];
        if (addWars) {
          for (let war of addWars) {
            const mapElem = this.generateMapElement(war);
            areas = areas.concat(mapElem);
          }
          wars = wars.concat(addWars);
        }

        // remove civil wars
        const removeWars = this.state.endDates[this.state.year-1];
        if (removeWars) {
          for (let war of removeWars) {
            for (let current = 0; current < wars.length; current++) {
              if (wars[current].name === war.name) {
                wars.splice(current, 1);
                for (let areaIndex = areas.length-1; areaIndex >= 0; areaIndex--) {
                  if (areas[areaIndex].groupId === war.name) {
                    areas.splice(areaIndex, 1);
                  }
                }
                break;
              }
            }
          }
        }

        this.setState({
          wars: wars,
          areas: areas,
          lastYear: this.state.year,
        });
      });
    } else if (event.deltaY < -1 * this.state.scrollBuffer) {
      if (this.state.year === this.state.startYear) return;
      this.setState({ year: this.state.year - 1 }, function() {
        let wars = this.state.wars.slice();
        let areas = this.state.areas.slice();

        // add civil wars
        const addWars = this.state.endDates[this.state.year];
        if (addWars) {
          for (let war of addWars) {
            const mapElem = this.generateMapElement(war);
            areas = areas.concat(mapElem);
          }
          wars = wars.concat(addWars);
        }

        // remove civil wars
        const removeWars = this.state.startDates[this.state.year+1];
        if (removeWars) {
          for (let war of removeWars) {
            for (let current = 0; current < wars.length; current++) {
              if (wars[current].name === war.name) {
                wars.splice(current, 1);
                for (let areaIndex = areas.length-1; areaIndex >= 0; areaIndex--) {
                  if (areas[areaIndex].groupId === war.name) {
                    areas.splice(areaIndex, 1);
                  }
                }
                break;
              }
            }
          }
        }

        this.setState({
          wars: wars,
          areas: areas,
          lastYear: this.state.year,
        });
      });
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      areas: [],
      wars: [],
      year: 1780,
      lastYear: 1780,
      changeYearStatus: false,
      
      scrollBuffer: 20,
      startYear: 1800,
      endYear: new Date().getFullYear(),
      startDates: {},
      endDates: {},
      avgCasualty: 0,

      selectedWar: null,
      selectedX: null,
      selectedY: null,

      isMobile: window.innerWidth <= MOBILE_WIDTH,
    };
  }

  renderMobileCards(wars) {
    return wars.map((war) => {
      return <div key={`${war.name}-${war.started}`}>
        <Card
          war={war}
          isMobile={this.state.isMobile}
        />
      </div>
    });
  }


  render() {

    if (this.state.isMobile) {
      if (this.state.year < this.state.startYear) {
      const opacity = (this.state.startYear - this.state.year) / 20;
      return (
        <div className="App mobile-intro intro">
          <h1><span className="fade" style={{ opacity: opacity}}>Civil Wars</span></h1>
          <h4>
            <span className="fade"  style={{ opacity: opacity }}>from </span> 
            1800 <span className="fade" style={{ opacity: opacity }}>to today </span>
          </h4>
          <div className="floater clickable" 
               onClick={() => this.setState({year: 1800, lastYear: 1800})}>
            <i className="fa fa-angle-double-right clickable"></i></div>
        </div>
      )
      } else {
        return (
          <div className="App">
            <Timeline
              isMobile={this.state.isMobile}
              changeYear={this.changeYear.bind(this)}
              toggleChangeYear={this.toggleChangeYear.bind(this)}
              year={this.state.year} 
              start={this.state.startYear}
              end={this.state.endYear}
            />
            <div className="map-mobile">
              {this.renderMobileCards(this.state.wars)}
            </div>
        </div>
        )
      }
    }

    const self = this;
    const config = {
      type: "map",
      theme: "black",
      panEventsEnabled : true,
      backgroundColor : "#1C1C1D",
      backgroundAlpha : 1,
      zoomOnDoubleClick: false,
      zoomControl: {
        zoomControlEnabled : false,
        panControlEnabled : false,
        homeButtonEnabled: false,
      },
      dataProvider : {
        map : "worldLow",
        getAreasFromMap : true,
        areas : this.state.areas,
      },
      balloon: {
      },
      areasSettings : {
        autoZoom : false,
        color : "#B4B4B7",
        colorSolid : "#E61A1A",
        selectedColor : "#FFFFFF",
        outlineColor : "#666666",
        rollOverColor : "#B4B4B7",
        rollOverOutlineColor : "#FFFFFF",
      },
      export : false,
      valueLegend: {
        minValue: "Unknown",
        maxValue: "> " + Math.round(this.state.avgCasualty).toString() + " casualties",
        color: "#FFFFFF",
      },
      listeners: [{
        event: "clickMapObject",
        method: function(event) {
          const selectedTitle = event.mapObject["title"];
          const selectedX = event.event.clientX;
          const selectedY = event.event.clientY;
          let selectedWar = null;
          
          for (let war of self.state.wars) {
            if (war.name === selectedTitle) {
              selectedWar = war;
              break;
            }
          }

          self.setState({ 
            selectedWar: selectedWar,
            selectedX: selectedX,
            selectedY: selectedY,
          });
        }
      }]
    };

    if (this.state.year < 1790) {
      const opacity = (1790 - this.state.year) / 10;

      return (
        <div className="App intro">
          <h1><span className="fade" style={{ opacity: opacity}}>Civil Wars</span></h1>
          <h4>
            <span className="fade"  style={{ opacity: opacity }}>from </span> 
            1800 <span className="fade" style={{ opacity: opacity }}>to today </span>
          </h4>
          <div className="floater fade" style={{ opacity: opacity}}>
            <i className="fa fa-angle-double-down"></i>
          </div>
        </div>
      );
    } else if (this.state.year < 1800) {
      const opacity = (1800 - this.state.year) / 10;
      const height = (10 + (this.state.year - 1790) / 10 * 40).toString() + "vh";

      return (
        <div className="App intro">
          <h1><span className="fade" style={{ opacity: 0 }}>Civil Wars</span></h1>
          <div className="timeline-cursor-intro" style={{opacity: 1-opacity}}></div>
          <div className="timeline-line-intro" style={{ 
            opacity: 1-opacity,
            height: height
          }}></div>
          <h4>
            <span className="fade" style={{ opacity: 0 }}>from </span>
            1800 <span className="fade"  style={{ opacity: 0 }}>to today </span>
          </h4>
      </div>
      );
    } else if (this.state.selectedWar) {
      return (
        <div className="App">
          <div className="map">
            <AmCharts.React style={{ width: "90%", height: "90vh" }} options={config} />
            <Card
              war={this.state.selectedWar}
              isMobile={this.state.isMobile}
              x={this.state.selectedX}
              y={this.state.selectedY}
            />
          </div>
          <Timeline 
            isMobile={this.state.isMobile}
            year={this.state.year} 
            start={this.state.startYear-20}
            end={this.state.endYear}
          />
        </div>
      );
    }
    
    return (
      <div className="App">
        <div className="map">
          <AmCharts.React style={{ width: "90%", height: "90vh" }} options={config} />
        </div>
        <Timeline 
          isMobile={this.state.isMobile}
          year={this.state.year} 
          start={this.state.startYear-20}
          end={this.state.endYear}
        />
      </div>
    );
  }
}

export default App;
