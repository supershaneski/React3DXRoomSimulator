import React from 'react';
import DataFurniture from '../data/furniture.json';

function Variations(props) {
  const selected = props.selected;
  const variation_id = selected.variations.id;
  const variation_items = selected.variations.items;
  const product_id = props.productId;

  let variation_name = "";
  if(variation_items && variation_items.length > 0) {
    variation_name = (
      <ul className="tab-head-list">
        <li className="tab-head-item">{selected.variations.name}</li>
      </ul>
    );
  }

  function handleClick(data) {
    props.onClick({
      param: data,
    })
  }

  let varitems = "";
  if(variation_items && variation_items.length > 0) {
    varitems = variation_items.map((item) => {
      const simg = "tdx/" + product_id + "/" + item.simg;
      const salt = item.salt;
      return (
        <a key={item.simg} title={salt}><img 
        key={item.simg} 
        alt={item.simg} 
        onClick={() => handleClick(item)}
        className="item-thumb" 
        src={simg} /></a>
      )
    })
  }
  
  return (
    <div className="tab-container">
      <div className="tab-head-container">
        {variation_name}
      </div>
      <div className="tab-contents-container">
        <div id="test4">
          {varitems}
        </div>
      </div>
    </div>
  )
}

const getSelectedFurniture = (sid) => {
  return DataFurniture.items.find(item => item.id === sid);
}

const formatNumber = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


function BottomNav(props) {
    const selected = props.selectedItem;

    let sname = selected ? selected.name : "Untitled";
    let sid = selected ? selected.id.replace("furn_","") : "";
    const sprodid = (sid.length > 0)?"tdx/" + sid + "/" + sid:""
    
    const objfurn = getSelectedFurniture( sid );
    let sprice = "";
    if(objfurn){
      sname = objfurn.name;
      sprice = "￥" + formatNumber(objfurn.price);
    }

    let variationExist = false;
    if(selected) {
      if(selected.variations) variationExist = true;
    }
    
    return (
      <div className="bottomnav z-depth-1">
        <div className="item-container">
          
          <div className="item-pic-container">
            <img alt="" className="item-pic-image" src={ sprodid } />
          </div>
        
          <div className="item-prod-container">
            <div className="item-prod-name">
              <span>{ sname }</span>
            </div>
            <div className="item-prod-price">
              <span>{ sprice } &nbsp;
              </span>
            </div>
          </div>

          <div className="item-var-container">
            {
              variationExist && <Variations onClick={props.onVariationClick} productId={sid} selected={selected} />
            }
          </div>
        </div>
      </div>
    )
  }
export default BottomNav;  