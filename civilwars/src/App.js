import React, { Component } from 'react';
import AmCharts from "@amcharts/amcharts3-react";
import throttle from "lodash/throttle";
import 'amcharts3/amcharts/amcharts';
import 'ammap3/ammap/ammap';
import 'amcharts3/amcharts/themes/light';
import './App.css';

import civilwars from './Data/data_wars';
import isoCountries from './Data/data_countries';


class App extends Component {

  componentWillMount() {
    const startDates = {};
    const endDates = {};
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
    }

    this.setState({startDates: startDates, endDates: endDates});
  }
  
  componentDidMount() {
    window.addEventListener('mousewheel', throttle(this.handleScroll.bind(this), 100));
  }

  componentWillUnmount() {
    window.removeEventListener('mousewheel', throttle(this.handleScroll.bind(this), 100));
  }

  generateMapElement(item) {
    const elements = [];
    const casualties = (item.casualties) ? item.casualties : 'Unknown';
    const color = "#FFFFFF";

    for (let country of item.locations) {
      elements.push({
        title: item.name,
        groupId: item.name,
        casualties: casualties,
        color: color,
        id: isoCountries[country],
      });
    }
   
    return elements;
  }

  handleScroll(event) {

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
        });
      });
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      areas: [],
      wars: [],
      startYear: 1800,
      endYear: new Date().getFullYear(),
      year: 1800,
      scrollBuffer: 50,
      startIndex: 0,
      startDates: {},
      endDates: {},
    };
  }


  render() {
    const config = {
      type: "map",
      theme: "black",
      panEventsEnabled : true,
      backgroundColor : "#1C1C1D",
      backgroundAlpha : 1,
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
      areasSettings : {
        autoZoom : false,
        color : "#B4B4B7",
        colorSolid : "#84ADE9",
        selectedColor : "#FFFFFF",
        outlineColor : "#666666",
        rollOverColor : "#9EC2F7",
        rollOverOutlineColor : "#000000"
      },
      export : false,
    };
    
    return (
      <div className="App">
        <div className="map">
          <AmCharts.React style={{ width: "90%", height: "90vh" }} options={config} />
        </div>
        <div className="timeline">
          {this.state.year}
        </div>
      </div>
    );
  }
}

export default App;
