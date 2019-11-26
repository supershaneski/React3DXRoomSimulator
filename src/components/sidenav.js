import React from 'react';
import DataRoom from '../data/room.json';
import DataFloor from '../data/floor.json';
import DataWall from '../data/wall.json';
import DataFurniture from '../data/furniture.json';

function Walls(props) {
  const roomlist = DataWall.items.map((item) => {
    const sid = item.id;
    const sname = item.name;
    const simg = "tdx/wall/" + sid + ".jpg";
    const price = "￥" + formatNumber(item.price);
    const wallitem = {
      id: sid,
      tdt: item.tdt,
    }
    return (
      <li key={sid} className="furn-item" 
        onClick={() => props.onClick({
          action: 'APPLY-WALL',
          param: wallitem,
        })}>
        <div className="furn-image-container">
        <img alt="" className="furn-image" src={simg} />
        </div>
        <div className="furn-desc-container">
        <span className="furn-desc-name">{sname}</span><br />
        <span className="furn-desc-price">{price}</span>
        </div>
      </li>
    )
  });
  return (
    <ul id="wall-catalog" className="furn-list">
      <li><a className="subheader">Select a wall material</a></li>
      {roomlist}
    </ul>        
  )
}

function Rooms(props) {
  const roomlist = DataRoom.items.map((item) => {
    const sid = item.id;
    const sname = item.name;
    const simg = "tdx/room/" + sid;
    return (
      <li key={sid} className="furn-item" 
        onClick={() => props.onClick({
          action: 'LOAD-ROOM',
          param: sid,
        })}>
        <div className="furn-image-container">
        <img alt="" className="furn-image" src={simg} />
        </div>
        <div className="furn-desc-container">
        <span className="furn-desc-name">{sname}</span><br />
        </div>
      </li>
    )
  });
  return (
    <ul id="room-catalog" className="furn-list">
      <li><a className="subheader">Select room to load</a></li>
      {roomlist}
    </ul>        
  )
}

function Floor(props) {
  const flooritems = DataFloor.items.map((item) => {
    const id = item.id;
    const name = item.name;
    const price = "￥" + formatNumber(item.price);
    const floor = {
      id: item.id,
      tdt: item.tdt
    };

    const fimg = "tdx/floor/" + item.id + ".jpg";

    return (
      <li key={id} className="furn-item"
        onClick={() => props.onClick({
          action: 'APPLY-FLOOR',
          param: floor,
        })}>
        <div className="furn-image-container">
        <img alt="" className="furn-image" src={fimg} />
        </div>
        <div className="furn-desc-container">
        <span className="furn-desc-name">{name}</span><br />
        <span className="furn-desc-price">{price}</span>
        </div>
      </li>
    )
  })

  return (
    <ul id="floor-catalog" className="furn-list">
      <li><a className="subheader">Select floor material</a></li>
      {flooritems}
    </ul>
  )
}

const formatNumber = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function Furniture(props) {
  const furnitems = DataFurniture.items.map((item)=>{
    const id = item.id;
    const name = item.name;
    const simg = "tdx/" + id + "/" + id;
    const price = "￥" + formatNumber(item.price);
    return (
      <li key={id} className="furn-item"
        onClick={() => props.onClick({
          action: 'ADD-ITEM',
          param: id,
        })}>
        <div className="furn-image-container">
        <img alt="" className="furn-image" src={simg} />
        </div>
        <div className="furn-desc-container">
        <span className="furn-desc-name">{name}</span><br />
        <span className="furn-desc-price">{price}</span>
        </div>
      </li>
    )
  });

  return (
    <ul id="furn-catalog" className="furn-list">
      <li><a className="subheader">Select furniture to add</a></li>
      { furnitems }
    </ul>
  )
}

class SideNav extends React.Component {
  constructor(props) {
    super(props);
    // another useless constructor
  }
  
  componentDidMount() {
    console.log("sidenav mounted");
  }
  
  render() {
    return (
      <ul id="slide-out" className="sidenav">
        <li>
          <Walls onClick={this.props.onClick} />
          <Floor onClick={this.props.onClick} />
          <Furniture onClick={this.props.onClick} />
          <Rooms onClick={this.props.onClick} />
        </li>
      </ul>
    )
  }
}
export default SideNav;  