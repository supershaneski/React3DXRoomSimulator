import React from 'react';
//import logo from './logo.svg';
import './App.css';

import SideButton from './components/sidebutton';
import SideNav from './components/sidenav';
import BottomNav from './components/bottomnav';
import TdxContainer from './threedx/tdxcontainer';

const sendMessage = (msg) => {
  window.getMessage(msg);
}

const tdxOnInitialized = () => {
  sendMessage({
      action: "LOAD-ROOM",
      param: "room003",
  });
}

const tdxOnClick = (sAttr) => {
  console.log("TDXONCLICK");
  window.setBottomNav(1);
}

const tdxOnDeselect = () => {
  window.setBottomNav(0);
}

class App extends React.Component {

  constructor(props) {
    super(props);
    
    this.onSideNavClick = this.onSideNavClick.bind(this);
    this.handleTdxEvent = this.handleTdxEvent.bind(this);
    this.handleVariation = this.handleVariation.bind(this);
    this.handleSideClick = this.handleSideClick.bind(this);

    this.state = {
      selected: null,
    }

  }
  
  onSideNavClick(param) {
    sendMessage(param);
  }

  tdxOnClick(param) {
    this.setState({
      selected: param,
    })
    window.setBottomNav(1);
  }

  handleTdxEvent(evt) {
    switch(evt.name) {
      case 'TDXONINITIALIZED':
        tdxOnInitialized();
        break;
      case 'TDXONDESELECT':
        tdxOnDeselect();
        break;
      case 'TDXONCLICK':
        this.tdxOnClick(evt.param);
        break;
      case 'TDXONADDITEM':
        this.tdxOnClick(evt.param);
        break;
      default:
        //
    }
  }
  
  handleVariation(item) {
    sendMessage({
      action: "APPLY-VARIATION",
      param: item,
    });
  }

  handleSideClick(buttonId) {
    window.showSidePanel(buttonId);
  }

  componentDidMount() {
    //window.addEventListener("tdxEvent", (evt) => this.tdxEventHandler(evt));
  }

  render() {
    return (
      <div className="app-container">
        <TdxContainer onTdxEvent={(evt) => this.handleTdxEvent(evt)} />
        <BottomNav selectedItem={this.state.selected} onVariationClick={this.handleVariation} />
        <SideButton onButtonClick={this.handleSideClick}/>
        <SideNav onClick={this.onSideNavClick} />
      </div>
    )
  }
}

export default App;
