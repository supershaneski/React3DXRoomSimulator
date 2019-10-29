import React from 'react';
//import logo from './logo.svg';
import './App.css';

import SideButton from './components/sidebutton';
import SideNav from './components/sidenav';
import BottomNav from './components/bottomnav';
import TdxContainer from './threedx/tdxcontainer';

/*
function MainContent() {
  return (
    <div className="maincontent  z-depth-1">
      &nbsp;
    </div>
  )
}
*/

function App() {
  const clickMe = () => {
    window.openSesame()
  }
  const showMe = () => {
    window.closeSesame()
  }
  return (
    <div className="app-container">
      <TdxContainer />
      <BottomNav />
      <SideButton onSesame={clickMe} offSesame={showMe}>Button</SideButton>
      <SideNav />
    </div>
  );
}

export default App;
