import React from 'react';
class SideNav extends React.Component {
    componentDidMount() {
      console.log("sidenav mounted");
    }
  
    render() {
      return (
        <ul id="slide-out" className="sidenav">
          <li><a className="subheader">Living Room</a></li>
          <li>
            
          <ul className="furn-list">
            <li className="furn-item">
              <div className="furn-image-container">
              <img alt="" className="furn-image" src="tdx/frc1507/frc1507" />
              </div>
              <div className="furn-desc-container">
              <span className="furn-desc-name">Sofa Couch with Modern Linen Fabric</span><br />
              <span className="furn-desc-price">￥123,456</span>
              </div>
            </li>
            
            <li className="furn-item">
              <div className="furn-image-container">
              <img alt="" className="furn-image" src="tdx/dmn0040/dmn0040" />
              </div>
              <div className="furn-desc-container">
              <span className="furn-desc-name">Sofa Couch with Modern Linen Fabric</span><br />
              <span className="furn-desc-price">￥123,456</span>
              </div>
            </li>
          </ul>
  
          </li>
          <li><div className="divider"></div></li>
          <li><a className="subheader">Kitchen</a></li>
          <li>
  
          <ul className="furn-list">
            <li className="furn-item">
              <div className="furn-image-container">
              <img alt="" className="furn-image" src="tdx/dmn0040/dmn0040" />
              </div>
              <div className="furn-desc-container">
              <span className="furn-desc-name">Sofa Couch with Modern Linen Fabric</span><br />
              <span className="furn-desc-price">￥123,456</span>
              </div>
            </li>
            
            <li className="furn-item">
              <div className="furn-image-container">
              <img alt="" className="furn-image" src="tdx/frc1155/frc1155" />
              </div>
              <div className="furn-desc-container">
              <span className="furn-desc-name">Sofa Couch with Modern Linen Fabric</span><br />
              <span className="furn-desc-price">￥123,456</span>
              </div>
            </li>
          </ul>
          
          </li>
          <li><div className="divider"></div></li>
        </ul>
      )
    }
  }
export default SideNav;  