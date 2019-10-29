import React from 'react';
function SideButton(props) {
  return (
    <div className="tab-btn-panel z-depth-2">
      <div onClick={props.onSesame} className="tab-btn">
        <img alt="" src="image/room1_icon.png" />
      </div>
      <div onClick={props.offSesame} className="tab-btn">
        <img alt="" src="image/sofa1_icon.png" />
      </div>
    </div>
  )
}
export default SideButton;