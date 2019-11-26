import React from 'react';
function SideButton(props) {
  return (
    <div className="tab-btn-panel z-depth-2">
      <div 
        onClick={() => props.onButtonClick('ROOM')}  //onsesame
        className="tab-btn">
        <a title="Room Layout"><img alt="" src="image/madori3_icon.png" /></a>
      </div>
      <div 
        onClick={() => props.onButtonClick('FLOOR')} //hotsesame
        className="tab-btn">
        <a title="Flooring"><img alt="" src="image/floor1_icon.png" /></a>
      </div>
      <div 
        onClick={() => props.onButtonClick('WALL')} //floorsesame
        className="tab-btn">
        <a title="Wallpaper"><img alt="" src="image/room1_icon.png" /></a>
      </div>
      <div 
        onClick={() => props.onButtonClick('FURNITURE')} //offsesame
        className="tab-btn">
        <a title="Furniture"><img alt="" src="image/sofa1_icon.png" /></a>
      </div>
    </div>
  )
}
export default SideButton;