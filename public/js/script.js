    
const SidePanelEnum = {"FURNITURE":1, "ROOM":2, "FLOOR":3, "WALL":4,}
Object.freeze(SidePanelEnum)

document.addEventListener('DOMContentLoaded', function() {
    console.log("content loaded");
    var elems = document.querySelectorAll('.sidenav');
    var instances = M.Sidenav.init(elems);
    //instances.open();

    document.addEventListener('touchmove', function (event) {
        if (event.scale !== 1) { event.preventDefault(); }
    }, false);
});

function setSidePanel(index) {
    var furn_panel = document.getElementById('furn-catalog');
    var room_panel = document.getElementById('room-catalog');
    var floor_panel = document.getElementById('floor-catalog');
    var wall_panel = document.getElementById('wall-catalog');
    furn_panel.style.display = (index === 1)?"block":"none";
    room_panel.style.display = (index === 2)?"block":"none";
    floor_panel.style.display = (index === 3)?"block":"none";
    wall_panel.style.display = (index === 4)?"block":"none";
}

function showSideNav() {
    var elem = document.querySelector('.sidenav');
    var instance = M.Sidenav.getInstance(elem);
    instance.open();
}

function showSidePanel(panelId) {
    if(panelId === "FURNITURE") setSidePanel(SidePanelEnum.FURNITURE);
    if(panelId === "ROOM") setSidePanel(SidePanelEnum.ROOM);
    if(panelId === "FLOOR") setSidePanel(SidePanelEnum.FLOOR);
    if(panelId === "WALL") setSidePanel(SidePanelEnum.WALL);
    showSideNav();
}

function setBottomNav(mode = 0) {
    var div = document.querySelector('.bottomnav');
    if(mode === 0) {
        if(div.classList.contains("bottomnav-show")) {
            div.classList.remove("bottomnav-show");
        }
        div.classList.add("bottomnav-hide");
    } else {
        if(div.classList.contains("bottomnav-hide")) {
            div.classList.remove("bottomnav-hide");
        }
        div.classList.add("bottomnav-show");
    }
}

function showBottomNav() {
    var div = document.querySelector('.bottomnav');
    if(div.classList.contains("bottomnav-hide")) {
        div.classList.remove("bottomnav-hide");
    }
    div.classList.add("bottomnav-show");
}

function hideBottomNav() {
    var div = document.querySelector('.bottomnav');
    if(div.classList.contains("bottomnav-show")) {
        div.classList.remove("bottomnav-show");
    }
    div.classList.add("bottomnav-hide");
}