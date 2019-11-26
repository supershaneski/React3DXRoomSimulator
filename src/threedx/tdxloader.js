
const addJScript = (url) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    document.body.appendChild(script);
}

class baseObject { // es6
    constructor(doc) {
        this.obj = doc;
        this.id = doc.getAttribute("id");
    }
    
    getSummary(key) {
        const summary = this.obj.getElementsByTagName("summary");
        if(summary.length === 0) return "";
        const node = summary[0].getElementsByTagName(key);
        if(node.length === 0) return "";
        return node[0].firstChild.nodeValue;
    }

    getFurnitureType() {
        return this.obj.getAttribute("type");
    }

    getVariations() {
        return this.obj.getElementsByTagName("variation");
    }

    getVariation(key) {
        const variation = this.obj.getElementsByTagName("variation");
        if(isNaN(key)){
            for(let varitem of variation){
                if(varitem.getAttribute("id") === key) {
                   return varitem;
               }
           }
        } else {
            return variation[key];
        }
    }

    getMaterials() {
        return this.obj.getElementsByTagName("material");
    }

    getMaterial(key) {
        const material = this.obj.getElementsByTagName("material");
        for(var i = 0; i < material.length; i++){
            if(material[i].getAttribute("id") === key) return material[i];
        }
    }

}

export default containerElement => {
    var selected = null;

    const init = () => {
        console.log("init loader")
        
        //window.addEventListener("tdxEvent", (evt) => tdxEventHandler(evt));
        
        addJScript('./js/tdxmain.js');
        
        checkTdxScript()
            .then(result => checkTdxScript())
            .then(result => {
                let flag = true;
                try {
                    window.callFromReact(containerElement.id);
                } catch(err) {
                    flag = false;
                }
                return flag;
        })
        .catch(err => {
            console.log('There was an error:' + err)
            window.location.reload();
        })
        
    }

    const sendMessage = (data) => {
        window.sendMessage(data);
    }

    const tdxEventHandler = (evt) => {
        switch(evt.detail.name) {
            case 'TDXONINITIALIZED':
                tdxOnInitiliazed();
                break;
            case 'TDXONLOAD':
                tdxOnLoad();
                break;
            case 'TDXONCLICK':
                tdxOnClick(evt.detail.param);
                break;
            case 'TDXONDESELECT':
                tdxOnDeselect();
                break;
            case 'TDXONADDITEM':
                tdxOnAdditem(evt.detail.param);
                break;
            default:
        }
    }

    const tdxOnAdditem = (item) => {
        let n = item.lastIndexOf("/");
        item = (n>=0)?item.substr(n + 1):item;
        n = item.lastIndexOf(".");
        item = (n>=0)?item.substr(0, n):item;
        //loadVariationFile(item);
        //console.log("ITEM ADDED", item);
    }

    const loadVariationFile = (item) => {
        console.log("LOAD VARIATION FILE", item);

        // let's load the xml variation file
        fetch('./tdx/xml/' + item + '.xml',{
            method: "GET",
            headers: {
                'Accept': 'text/xml',
                'Content-Type': 'text/xml'
            },
          })
            .then(result => {
                if(!result.ok) {
                    // catch error
                    throw Error("Variation file not found.");
                }
                return result.text()
            })
            .then(txt => readVariationFile(txt),
                error => console.log(error));
    }

    const readVariationFile = (rawTxt) => {
        var dom = new DOMParser();
        var xml = dom.parseFromString(rawTxt, 'text/xml');
        var root = xml.getElementsByTagName("furniture");
        if(root.length === 0) return;
        
        const furn = new baseObject(root[0]);
        selected = furn;

        /*
        const sid = furn.id;
        const sname = furn.getSummary("name");
        //console.log(sid, sname);
        const varlist = furn.getVariations();
        for(let item of varlist) {
            const mat = furn.getMaterial(item.getAttribute("id"));
            const itemlist = mat.getElementsByTagName("item");
            for(let vitem of itemlist) {
                const smap = vitem.getAttribute("map");
                const alt = vitem.getAttribute("alt");
                const image = vitem.firstChild.nodeValue;
                //console.log("-", smap, alt, image);
            }
        }
        */
        
    }

    const tdxOnDeselect = () => {
        console.log("TDXONDESELECT");
        selected = null;
    }

    const tdxOnClick = (sAttr) => {
        console.log("TDXONCLICK", sAttr);

        // get only item name
        const n = sAttr.indexOf(":");
        const item = (n >= 0)?sAttr.substr(0,n):sAttr;

        // load variation file
        //loadVariationFile(item);
    }

    const tdxOnLoad = () => {
        console.log("TDXONLOAD");
    }

    const tdxOnInitiliazed = () => {
        console.log("TDXONINITIALIZED");

        // load room
        sendMessage({
            action: "Reload",
            param: "http://localhost:3000/tdx/room001.fls"
        });
    }

    function checkTdxScript(onSuccess, onFail) {
        return new Promise((resolve, reject) => {
          setTimeout(function() {
            try {
                var result = window.connectPromise();
            } catch(err){
                //
            }
            result ? resolve(result) : reject('Error');
          }, 500);
        })
    }

    const testReturn = () => {
        console.log("test return")
    }

    const testAgain = (n) => {
        //console.log("test again");
        if(n > 2) {
            var param;
            /*
            if(n > 3){
                param = "kmp0406_01,kmp0406_01.jpg,1,kmp0406_01_01";
            } else {
                param = "kmp0406_02,kmp0406_02.jpg,1,kmp0406_01_02";
            }
            */

            if(!selected) return;
            var var1 = selected.getVariation(0);
            var material1 = selected.getMaterial(var1.getAttribute("id"));
            var items = material1.getElementsByTagName("item");
            var index = 0;
            if( n > 3) {
                index = 1;
            }
            var varkey = material1.getAttribute("id");
            var sitem = items[index].firstChild.nodeValue;
            var stype = items[index].getAttribute("type");
            var smap = items[index].getAttribute("map");

            param = varkey + "," + sitem + "," + stype + "," + smap;
            console.log("variation", param);

            sendMessage({
                action: "Variation",
                param: param,
            });
        } else {
            var item;
            switch(n) {
                case 1:
                    item = "furn_frc1155.3dx";
                    break;
                case 2:
                    item = "furn_dmn0040.3dx";
                    break;
                default:
                    item = "furn_kmp0406.3dx";
            }
            sendMessage({
                action: "Add",
                param: "http://localhost:3000/tdx/3dx/" + item,
            });
        }
    }

    init();

    return {
        testReturn,
        testAgain
    }
}