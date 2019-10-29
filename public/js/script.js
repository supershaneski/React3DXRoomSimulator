
document.addEventListener('DOMContentLoaded', function() {
    console.log("content loaded");
    var elems = document.querySelectorAll('.sidenav');
    var instances = M.Sidenav.init(elems);
    //instances.open();
});

function closeSesame() {
    // bottomnav show/hide animation
    var div = document.querySelector('.bottomnav');
    if(div.classList.contains("bottomnav-show")) {
        div.classList.remove("bottomnav-show");
        div.classList.add("bottomnav-hide");
    } else {
        if(div.classList.contains("bottomnav-hide")) {
            div.classList.remove("bottomnav-hide");
        }
        div.classList.add("bottomnav-show");
    }
}

function openSesame() {

    // sidenav show/hide animation
    var elem = document.querySelector('.sidenav');
    var instance = M.Sidenav.getInstance(elem);
    instance.open();
    
    // this test
    var div = document.getElementById("non-existent");
    if(div) {
        console.log("item not found")
        var txt = div.innerHTML.toString();
        var n = txt.indexOf("/");
        var s = "";
        if(n >= 0) {
            s = txt.substr(n + 1);
        }
        if(s.length === 0) {
            s = s + s.length;
        }
        console.log("end test");
    }

    /*
    var btn = document.querySelector('.btn-tab-nav');
    if(btn) {
        if(btn.classList.contains("btn-nav-show")) {
            btn.classList.remove("btn-nav-show");
            btn.classList.add("btn-nav-hide");
        } else {
            if(btn.classList.contains("btn-nav-hide")) {
                btn.classList.remove("btn-nav-hide");
            }
            btn.classList.add("btn-nav-show");
        }
    }
    */
    
}