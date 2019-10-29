import React from 'react';

function BottomNav() {
    return (
      <div className="bottomnav grey lighten-4 z-depth-1">
        
        <div className="item-container">
      <div className="item-pic-container">
          <img alt="" className="item-pic-image" src="tdx/frc1507/frc1507" />
          <div className="item-fave-container">
              <img alt="" className="item-fave-image" src="image/fav-icon_off.png" />
          </div>
      </div>
      <div className="item-prod-container">
          <div className="item-prod-name">
              <span>Sofa Couch Compact Corner Floor Low Sofa</span>
          </div>
          <div className="item-prod-price">
              <span>￥19,980,123 &nbsp;
        {
          (new Date()).toLocaleTimeString()
        }
        </span>
          </div>
      </div>
      <div className="item-var-container">
          
          <div className="tab-container">
          
              <div className="tab-head-container">
                <ul className="tab-head-list">
                  <li className="tab-head-item">色（タイプ）</li>
                  <li className="tab-head-item">シート（サイズ）</li>
                </ul>
              </div>
              
              <div className="tab-contents-container">
                <div id="test4">
                  <img alt="" className="item-thumb" src="tdx/dmn0040/dmn0040-11_01" />
                  <img alt="" className="item-thumb" src="tdx/dmn0040/dmn0040-11_02" />
                  <img alt="" className="item-thumb" src="tdx/dmn0040/dmn0040-11_03" />
                  <img alt="" className="item-thumb" src="tdx/dmn0040/dmn0040-11_01" />
                  <img alt="" className="item-thumb" src="tdx/dmn0040/dmn0040-11_02" />
                  <img alt="" className="item-thumb" src="tdx/dmn0040/dmn0040-11_03" />
                </div>
              </div>
              
          </div>
        
      </div>
      
      </div>
  
      </div>
    )
  }
export default BottomNav;  