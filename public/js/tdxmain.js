
/*
utility routines/functions
*/
function isIE(){
  if(navigator.appName.toUpperCase().indexOf("NETSCAPE")>=0){
    if(navigator.userAgent.toUpperCase().indexOf("TRIDENT")>=0){
      return true;
    } else {
      return navigator.userAgent.toUpperCase().indexOf("EDGE")>=0?true:false;
    }
  } else {
    return navigator.appName.toUpperCase().indexOf("EXPLORER")>=0?true:false;
  }
}

function getBasename(filename){
	var n = filename.lastIndexOf(".");
	if(n>0){
		return filename.substr(0,n);
	} else {
		return filename;
	}
}

function getFilename(s){
	var n = s.lastIndexOf("/");
	if(n > 0){
		s = s.substr(n+1);
	}
	return s;
}

function setParamValue(value, defvalue){
  if(typeof(value) == "undefined") return defvalue;
	if(value === null) return defvalue;
	if(!value) return defvalue;
	return value;
}

function gethostname(){
  var baseref = document.getElementsByTagName("base")[0].href;
  return baseref;
}

function getRoomHeight(){
	var tdx = document.getElementById("Control1");
	var info = tdx.GetSceneInfo();
	var token = info.split("\n");
    var roomheight = 240;
	for(var i = 0; i < token.length; i++){
		var n = token[i].indexOf("roomheight=");
		if(n >= 0){
            roomheight = parseFloat(token[i].substr(n+11));
			break;
        } else {
            n = token[i].indexOf("ceilings2=");
            if(n >= 0){
                var tmp = token[i];
                var m = tmp.indexOf(',"');
                n = tmp.indexOf('"height":');
                if(n >= 0 && m > n){
                    roomheight = parseFloat(tmp.substr(n+9,m-(n+9)));
                }
                break;
            }
        }
	}
	return roomheight;
}

function getRoomCenter() {
    var tdx = document.getElementById("Control1");
    var cp = (function(jsonStr){
        var scene = JSON.parse(jsonStr);
        var madf;
        var tdx = scene.tdxs[0];
        if (!tdx.hasOwnProperty("floors2")) tdx.floors2 = [];
        if (!tdx.hasOwnProperty("ceilings2")) tdx.ceilings2 = [];
        if (!tdx.hasOwnProperty("walls2")) tdx.walls2 = [];
        if (!tdx.hasOwnProperty("points2")) tdx.points2 = [];
        var flrs, pts;
        for (var i = 0; i < scene.tdxs.length; ++i) {
            var tdx = scene.tdxs[i];
            if (tdx.filename == "(madori2)") {
                flrs = tdx.floors2;
                pts = tdx.points2;
			break;
		}
	}
	var cx = 0;
	var cy = 0;
        if(flrs){
            var n = 0;
            for (var i = 0; i < flrs.length; ++i) {
                var flr = flrs[i];
                for (var j = 0; j < flr.pts.length; ++j) {
                    var P = pts[flr.pts[j]];
                    cx+=P[0];
                    cy-=P[1];
                    n++;
		}
            }
            cx = cx/n;
            cy = cy/n;
		cy = -1*cy;
	}

	return new POINT(cx,cy);
    })(tdx.MapJSON());
    return new POINT(cp.x,cp.y);
}

function POINT(x,y){
    this.x = x;
    this.y = y;
    return this;
}

/*
handle resizing for player
*/
//window.onresize = resizeplayer;
function resizeplayer(){

  // get size from tdx-container
  var width = document.getElementById("tdxplayer-container").offsetWidth;
  var height = document.getElementById("tdxplayer-container").offsetHeight;
  try{
      if(TdxPlayer.Resize){
          TdxPlayer.Resize(width,height);
      }
  } catch(err){
  }

}

/*
variables
*/
var Module, TdxPlayer;
var gDocBase = "./"; //"assets/";
var gTDXFilename = gDocBase+"room000.fls"; //gDocBase+"3dx/fls404.fls";
var gTDXWebGLVersion = '0.0.3'; //'0.0.3'; // player version
var gTDXRenderingHint = 2563;
var gTDXWalkthruMode = 5;
var gDefaultTatamiSize = 1.82;
var gTDXWallAlpha = 0.4; //0.4;
var gTDXFloorAlpha = 0.2; //0.2; //0.2;
var gReadyState = false;
var gTemp = [];
var gEditMode = false;

var App = {
  ReadyState:0,
  Endpoints:{},
  SelectedItem:''
};

function ssdownloader(){
	var req = null;
	var that = this;
	this.handler = null;
	this.mode = 0;
	this.get = function(){
		var url = arguments[0];
		this.handler = arguments[2];
		if (arguments.length > 3) this.mode = arguments[3];
		url = (arguments[1])?url+"?"+arguments[1]:url;
		if (window.XMLHttpRequest) {
			req = new XMLHttpRequest();
			req.onreadystatechange = reqchange;
			req.open("GET", url, true);
			if (this.mode > 0)req.setRequestHeader("Accept", "text/xml");
			req.send(null);
		} else if (window.ActiveXObject) {
			req = new ActiveXObject("Microsoft.XMLHTTP");
			req.onreadystatechange = reqchange;
			req.open("GET", url, true);
			if (this.mode > 0) req.setRequestHeader("Accept", "text/xml");
			req.send(null);
		}
	};
	function reqchange(){
		if (req.readyState == 4) {
			if (req.status == 200) {
				if (that.mode > 0) {
					if (that.handler) that.handler(req.status,req.responseXML,req.responseText);
				} else {
					if (that.handler) that.handler(req.status,req.responseText);
				}
			} else {
				if (that.handler) that.handler(req.status,req.responseText);
			}
		}
	};
	return this;
}


function baseObject(id, obj){
    this.id = id;
    this.obj = obj;    
    this.getSummary = function(){
        var summary, node, value;
        try{
            summary = this.obj.getElementsByTagName("summary");
            node = summary[0].getElementsByTagName(arguments[0]);
            value = node[0].firstChild.nodeValue;
        } catch(err){
            //
        }
        return value;
    };    
    this.getData = function(){
        var summary, node, value;
        try{
            summary = this.obj.getElementsByTagName("summary");
            node = summary[0].getElementsByTagName(arguments[0]);
            value = node[0].firstChild.nodeValue;
        } catch(err){
            //
        }
        return value;
    };   
    this.getFurnitureType = function(){
        return this.obj.getAttribute("type");
    };
    this.getVariations = function(){
        return this.obj.getElementsByTagName("variation");
    };
    this.getVariation = function(){
        var variation = this.obj.getElementsByTagName("variation");
        if(isNaN(arguments[0])){
            for(var i = 0; i < variation.length; i++){
                if(variation[i].getAttribute("id") === arguments[0]) return variation[i];
            }
        } else {
            return variation[arguments[0]];
        }
    };
    this.getMaterials = function(){
        return this.obj.getElementsByTagName("material");
    };
    this.getMaterial = function(){
        var material = this.obj.getElementsByTagName("material");
        for(var i = 0; i < material.length; i++){
            if(material[i].getAttribute("id") === arguments[0]) return material[i];
        }
    };
    return this;
}

var Scene = {
    doc:null,
    curitem:"",
    callback:null,
    Items:"",    
    init:function(){
        //if(!document.implementation.createDocument){
        if(isIE()){
            var xmlString = "<lib></lib>";
            var parser = new DOMParser();
            this.doc = parser.parseFromString(xmlString, "text/xml");
        } else {
            this.doc = document.implementation.createDocument(null, "lib");
        }
    },
    getFurnitureById:function(){
        var furn = this.doc.getElementsByTagName("furniture");
        for(var i = 0; i < furn.length; i++){
            if(furn[i].getAttribute("id") == arguments[0]){
                return new baseObject(arguments[0],furn[i]);
            } else if(arguments[0].toLowerCase().indexOf(furn[i].getAttribute("id").toLowerCase())>=0){
                return new baseObject(furn[i].getAttribute("id"),furn[i]);
            }
        }
    },
    getFurnitureData: function(){
        this.curitem = arguments[0];
        this.callback = arguments[1];


        if(Scene.Items.indexOf(this.curitem)>=0){
            //console.log("アイテムが見つかりません");
            var param = {
              event:'OnItemNotFound',
              args:''
            };
            //my.namespace.pubOn3dxEvent(JSON.stringify(param));

            setTimeout(function(){
                var tdx = document.getElementById("Control1");
                tdx.EnableControl(1);
                App.ReadyState = 0;
            },100);
            
            return;
        }
        var param = this.curitem;

        //if(param.indexOf('furn_')>=0 && param.indexOf("/")<0){
        //  var token = param.split('_');
        //  param = 'furn_'+token[1];
        //}

        /*
        if(param.indexOf("/")<0){
          var s = param.replace('.3dx','');
          param = s+'/'+param;
        }
        */

        //var rx = /^[^\*].+/;
        //if(rx.test(param)) param = '/'+param;
        //console.log('param='+param);
        
        //console.log("docbase2", gDocBase);
        //console.log(param);

        //var surl = App.Endpoints['3dx'];
        //var surl = "http://localhost:3000/tdx/xml/"; //gDocBase;
        //var surl = gDocBase + "tdx/xml/"; //gDocBase;
        var surl = gDocBase + "tdx/"; //gDocBase;
        param = param.replace('.3dx','');

        var prodkey = param.replace('furn_', '');

        surl += prodkey + '/';
        param += '.xml';
        if(param.indexOf("furn_")<0) param = "furn_" + param;

        var odate = new Date();
        var stamptime = odate.getTime();
        var req = new ssdownloader();
        var sdocfile = surl + param+'?'+stamptime;
        
        req.get(sdocfile,null,function(status,src){
            if((status == 200)&&(src != null)){
                var furndoc = src.getElementsByTagName("furniture")[0];
                var root = Scene.doc.getElementsByTagName("lib");
                root[0].appendChild(furndoc);
                App.ReadyState = 0;
                if(Scene.callback) Scene.callback(Scene.curitem);
            } else {
                //console.log("アイテムが見つかりません");
                var param = {
                  event:'OnItemNotFound',
                  args:''
                };
                //my.namespace.pubOn3dxEvent(JSON.stringify(param));

                Scene.Items+=Scene.curitem+",";
                setTimeout(function(){
                    var tdx = document.getElementById("Control1");
                    tdx.EnableControl(1);
                    App.ReadyState = 0;
                },100);
            }
        },1);
    }
    
};

/*
player functions
*/
var gCaptureFlag = false;
var gCaptureExt = "jpg";
var gReadOnly = false;
var gThreshWidth = 0; //0:show, -1:hide, w
var gSupportedView = 7; //1:2d,2:3d,4:overview
var gHideWallMode = true;

var TdxMain = (function(){
  return {
    checkXml:function(param){
      param = '/' + param + '/' + param + '.xml';
      var surl = App.Endpoints['3dx'];
      var odate = new Date();
      var stamptime = odate.getTime();
      var req = new ssdownloader();
      var sdocfile = surl+param+'?'+stamptime;
      req.get(sdocfile,null,function(status,src){
          if((status == 200)&&(src != null)){
              var furndoc = src.getElementsByTagName("furniture")[0];
              var id = furndoc.getAttribute('id');
              var obj = new baseObject(id,furndoc);
              var defaultid = obj.getSummary('default_id');
              var productid = obj.getSummary('product_id');
              //console.log(furndoc);
              //console.log(id+' : '+defaultid+' : '+productid);

              var varlist = obj.getVariations();
              var arr = [];
              var flag = false;
              if(varlist.length > 0){
                for (var i = 0; i < varlist.length; i++){
                  var varid = varlist[i].getAttribute('id');
                  var mat = obj.getMaterial(varid);
                  var item = mat.getElementsByTagName('item');
                  for(var k = 0; k < item.length; k++){
                    flag = true;
                    var itemname = item[k].firstChild.nodeValue;
                    var code = item[k].getAttribute('code');
                    if(!code){
                      var newobj = {
                        name:itemname,
                        code:code
                      }
                      arr.push(newobj);
                    }
                  }
                }
              }

              var mainobj = {
                id:id,
                defaultid:defaultid,
                productid:productid,
                withvariations:flag,
                items:arr
              }

              console.log(mainobj);
              //console.dir(mainobj);
              
          } else {
              //
          }
      },1);
    },
    clear:function(){
      Module.pauseMainLoop();
    },
    init:function(){
      initMPP();
    },
    setProperties:function(sparam){
      var obj = JSON.parse(sparam);
      var tdx = document.getElementById("Control1");

      if(typeof(obj.ShowCtrlThresh) !== "undefined") {
        gThreshWidth = obj.ShowCtrlThresh;
        tdx.SetProperty('showctrlthresh',String(gThreshWidth));
      }

      if(typeof(obj.SupportedViewMode) !== "undefined") {
        gSupportedView = obj.SupportedViewMode;
        tdx.SetProperty('supportedviewmode',String(gSupportedView));
      }

      if(typeof(obj.HideWallMode) !== "undefined") {
        gHideWallMode = obj.HideWallMode;
        tdx.SetProperty('hidewallmode', String(gHideWallMode));
      }

      if(typeof(obj.WallAlpha) !== "undefined") {
        tdx.SetProperty('WallAlpha', String(obj.WallAlpha));
      }

      if(typeof(obj.FloorAlpha) !== "undefined") {
        tdx.SetProperty('FloorAlpha', String(obj.FloorAlpha));
      }

    },
    setReadOnly:function(flag){
      gReadOnly = flag;
    },
    isBusy:function(){
      var tdx = document.getElementById("Control1");
      return tdx.IsBusy();
    },
    captureImage:function(w,h,quality,ext){
      var tdx = document.getElementById('Control1');
      if(!quality) quality = 70;
      if(!ext) ext = "jpg";
      gCaptureFlag = true;
      gCaptureExt = ext;
      tdx.MakeThumbnail(w,h,quality,ext);
    },
    turnObject:function(){
      var tdx = document.getElementById('Control1');
      tdx.TurnObject(0,180,0);
    },
    loadFls:function(fls,backdrop){
      if(typeof(fls) == "undefined"){
        //console.log("nothing to load");
        return;
      }
      if(!gReadyState){
        gTemp.push(fls);
        gTemp.push(backdrop);
        return;
      }
      var tdx = document.getElementById("Control1");
      tdx.EnableControl(0);

      if(backdrop) {
        tdx.BackDrop = backdrop;
      }

      /*
      if(fls.indexOf("//FLS file")>=0){
        tdx.SetSceneInfo(fls);
      } else {
        tdx.UnmapJSON(fls);
      }*/

      tdx.UnmapJSON(fls);
    },
    getFls:function(){
      var tdx = document.getElementById("Control1");
      //console.log(tdx.GetSceneInfo());
      //return tdx.GetSceneInfo();
      return tdx.MapJSON();
    },
    setEndpointUrl:function(s){
      var tdx = document.getElementById("Control1");
      tdx.SetEndpoints(s);
      App.Endpoints = JSON.parse(s);
      gReadyState = true;

      if(gTemp.length > 0){
        if(gTemp.length == 2) tdx.BackDrop = gTemp[1];
        tdx.UnmapJSON(gTemp[0]);
      }

      gTemp = [];
    },
    setWallFixture:function(item){

      if(App.ReadyState > 0) return;
      App.ReadyState = 1;

      clearInterval(timadd);

      var tdx = document.getElementById("Control1");
      tdx.EnableControl(0);

      var furn = Scene.getFurnitureById(item);
      if(typeof(furn) == 'undefined'){
        Scene.getFurnitureData(item,TdxMain.setWallFixture);
        return;
      }
      //tdx.Object.Set(furn);
      App.ReadyState = 0;
      App.SelectedItem = item;
      tdx.EnableControl(1);
      tdx.SelectAttribute('wall');

    },
    addWallFixture:function(item){

      if(App.ReadyState > 0) return;
      App.ReadyState = 1;

      clearInterval(timadd);

      var tdx = document.getElementById("Control1");
      var coord = tdx.GetWallExtent();
      if(!coord) return;
      
      tdx.EnableControl(0);

      var furn = Scene.getFurnitureById(item);
      if(typeof(furn) == 'undefined'){
        Scene.getFurnitureData(item,TdxMain.addWallFixture);
        return;
      }
      tdx.Object.Set(furn);

      var width = furn.getSummary('width');
      var posy = furn.getSummary('posy');

      width = setParamValue(width,100);
      width = parseFloat(width);
      width = width/2;

      posy = setParamValue(posy,0);
      posy = parseFloat(posy);
      
      var item_type = tdx.Object.SelectedType;

      var px = 10 + width;
      var py = (item_type.indexOf('door')>=0)?0:posy;
      var pz = 0;

      var defvalue = furn.getSummary("default_id");
      var codevalue = furn.getSummary("product_id");
      var simvalue = furn.getSummary("sim_id");
      defvalue = setParamValue(defvalue,"");
      codevalue = setParamValue(codevalue,"ZZ");
      simvalue = setParamValue(simvalue,"00");
      var smetadata = "";
      if(defvalue){
        smetadata = defvalue+":"+codevalue+":"+simvalue;
      }

      tdx.SetMoveAxis(3,0,0);
      tdx.BeginUpdate();
      tdx.PreSetMetaData(smetadata);
      tdx.Attach3DXToWall(item, item.replace('.3dx','.3dt'), px, py, pz);

      timadd = setInterval(function(){
        var tdx = document.getElementById("Control1");
        var flag = tdx.IsBusy();
        if(!flag){
          clearInterval(timadd);
          tdx.SetObjectCollision(false);
          tdx.EndUpdate();
          tdx.EnableControl(1);
          tdx.SelectAttribute('');
          App.ReadyState = 0;

          var param = {
            event:'OnAddItem',
            args:''
          };
          //my.namespace.pubOn3dxEvent(JSON.stringify(param));
        }
      },100);

    },
    addFurniture:function(item){
      //console.log('host='+location.href);
      
      if(App.ReadyState > 0) return;
      App.ReadyState = 1;

      clearInterval(timadd);

      var tdx = document.getElementById("Control1");
      tdx.EnableControl(0);

      var furn = Scene.getFurnitureById(item);
      if(typeof furn == 'undefined'){
        Scene.getFurnitureData(item,TdxMain.addFurniture);
        return;
      }
      tdx.Object.Set(furn);

      var sbehavior = furn.getSummary('behavior');
      sbehavior = setParamValue(sbehavior,0);

      var placement = furn.getSummary('placement');
      placement = setParamValue(placement,'floor');

      var height = furn.getSummary('height');
      height = setParamValue(height,250);
      height = parseFloat(height);

      var px, py, pz;
      py = 0;
      if(placement !== 'floor'){
        var room_height = getRoomHeight();
        py+=room_height;
        py-=height;
      } else {
        py = furn.getSummary('posy');
        py = setParamValue(py,0);
        py = parseFloat(py);
        if(py > 0) py -= height;
      }

      if(tdx.ViewMode == 1){
        var xyz = tdx.GetCameraPosRevised();
        var token = xyz.split(",");
        px = parseFloat(token[0]);
        pz = parseFloat(token[2]);
      } else {
        var p = getRoomCenter();
        px = p.x;
        pz = p.y;
      }
      
      var defvalue = furn.getSummary("default_id");
      var codevalue = furn.getSummary("product_id");
      var simvalue = furn.getSummary("sim_id");
      defvalue = setParamValue(defvalue,"");
      codevalue = setParamValue(codevalue,"ZZ");
      simvalue = setParamValue(simvalue,"00");
      var smetadata = "";
      if(defvalue){
        smetadata = defvalue+":"+codevalue+":"+simvalue;
      }

      var filename = item;
      var sparam = {
        pos:[px,py,pz],
        rot:[0,0,0],
        scl:[1,1,1],
        siz:[-1,-1,-1],
        towall:-1,
        makegroup:true,
        behavior:parseInt(sbehavior),
        metadata:smetadata
      };
      var json_param = JSON.stringify(sparam);

      tdx.SetMoveAxis(1,1,1);
      tdx.BeginUpdate();
      tdx.AddObjectWithParameter(filename, json_param);

      timadd = setInterval(function(){
        var tdx = document.getElementById("Control1");
        var flag = tdx.IsBusy();
        if(!flag){
          clearInterval(timadd);

          if(tdx.Object.Selected.indexOf('xxx9001')>=0||tdx.Object.Selected.indexOf('xxx9002')>=0||tdx.Object.Selected.indexOf('xxx9003')>=0){
            var height = getRoomHeight();
            var xyz = tdx.GetObjectSize();
            var token = xyz.split(',');
            var x = parseFloat(token[0]);
            var z = parseFloat(token[2]);
            tdx.SetObjectSize(x,height,z);
            var _tmp = tdx.Object.obj.getVariation(0);
            var _items = _tmp.getElementsByTagName('item');
            for(var i = 0; i < _items.length; i++){
              tdx.RemapObjectTexture(_items[i].firstChild.nodeValue);
            }
          } else if(tdx.Object.Selected.indexOf('xxx0038')>=0||tdx.Object.Selected.indexOf('xxx0039')>=0){
            var xyz = tdx.GetObjectSize();
            var token = xyz.split(',');
            var x = parseFloat(token[0]);
            var z = parseFloat(token[2]);
            tdx.SetObjectSize(x,235,z);
          }

          tdx.SetObjectCollision(false);
          tdx.EndUpdate();
          tdx.EnableControl(1);
          App.ReadyState = 0;

          var param = {
            event:'OnAddItem',
            args:''
          };
          //my.namespace.pubOn3dxEvent(JSON.stringify(param));
        }
      },100);

    },
    getObjectSize:function(){
      var tdx = document.getElementById("Control1");
      
      var xyz = tdx.GetObjectSize();
      var token = xyz.split(",");
      var sx = Math.round(10*parseFloat(token[0]))/10;
      var sy = Math.round(10*parseFloat(token[1]))/10;
      var sz = Math.round(10*parseFloat(token[2]))/10;
      return sx + "," + sy + "," + sz;
      
      //return tdx.GetObjectSize();
    },
    getObjectInitSize:function(){
      var tdx = document.getElementById("Control1");
      var xyz = tdx.GetObjectSize();
      var token = xyz.split(',');
      var x = parseFloat(token[0]);
      var y = parseFloat(token[1]);
      var z = parseFloat(token[2]);

      xyz = tdx.GetObjectScale();
      token = xyz.split(',');
      var sx = parseFloat(token[0]);
      var sy = parseFloat(token[1]);
      var sz = parseFloat(token[2]);

      x = x/sx;
      y = y/sy;
      z = z/sz;

      x = Math.round(1000*x)/1000;
      y = Math.round(1000*y)/1000;
      z = Math.round(1000*z)/1000;
      
      xyz = x+','+y+','+z;
      return xyz;
    },
    setObjectSize:function(x,y,z){ //new
      var tdx = document.getElementById("Control1");
      tdx.BeginUpdate();
      tdx.SetObjectSize(x,y,z);
      

      if(tdx.Object.SelectedType === "window"){
        if(tdx.Object.obj.id.toUpperCase().indexOf("WND_")>=0){
          tdx.RemapObjectTexture("xxx0132_glss");
          tdx.RemapObjectTexture("xxx0132_glss1");
        } else {
          tdx.RemapObjectTexture("bg");
        }
      }

      tdx.EndUpdate();
      tdx.Redraw();

      setTimeout(function(){
        // emit event
        var param = {
          event:'OnObjectResize',
          args:''
        };
        //my.namespace.pubOn3dxEvent(JSON.stringify(param));
      },100);
    },

    getObjectCollision:function(){
      var tdx = document.getElementById("Control1");
      return tdx.GetObjectCollision();
    },
    setObjectCollision:function(flag){ //new
      var tdx = document.getElementById("Control1");
      tdx.SetObjectCollision(flag);
      setTimeout(function(){
        // emit event
        var param = {
          event:'OnChangeState',
          args:''
        };
        //my.namespace.pubOn3dxEvent(JSON.stringify(param));
      },100);
    },

    getObjectLock:function(){
      var tdx = document.getElementById("Control1");
      return tdx.GetObjectLock();
    },
    setObjectLock:function(flag){ //new
      var tdx = document.getElementById("Control1");
      tdx.SetObjectLock(flag);
      setTimeout(function(){
        // emit event
        var param = {
          event:'OnChangeState',
          args:''
        };
        //my.namespace.pubOn3dxEvent(JSON.stringify(param));
      },100);
    },

    getCurrentVariation:function(){
      var tdx = document.getElementById("Control1");
      var metadata = tdx.GetMetaData();
      var token = metadata.split(':');
      var code = '';
      if(token.length > 1){
        code = token[1];
        code = code.replace(/ZZ/g,'');
        if(code){
          token = code.split('-');
          code = '';
          for(var i = 0; i < token.length; i++){
            code+= i + 'x' + token[i]+'-';
          }
          code = code.substr(0,code.length-1);
        }
      }
      return code;
    },
    getObjectMetaData:function(){
      var tdx = document.getElementById("Control1");
      return tdx.GetMetaData();
    },
    getSummary:function(skey){
      var tdx = document.getElementById("Control1");
      return tdx.Object.obj.getSummary(skey);
    },
    getItemType:function(){
      var tdx = document.getElementById("Control1");
      return tdx.Object.SelectedType;
    },
    getSelObj:function(){
      var tdx = document.getElementById("Control1");
      return tdx.GetSelObj();
    },
    getItemcode:function(){
      var tdx = document.getElementById("Control1");
      return tdx.Object.Selected;
    },
    getSubcode:function(){
      var tdx = document.getElementById("Control1");
      var metadata = tdx.GetMetaData();
      var subcode = '';
      if(metadata){
        var baseid = tdx.Object.Selected;
        var token = metadata.split(':');
        baseid = baseid.replace('furn_','');
        subcode = baseid+'-'+token[0];
      }
      return subcode;
    },

    getVariations:function(){
      var tdx = document.getElementById("Control1");
      var metadata = tdx.GetMetaData();
      var token = metadata.split(':');
      var current_options = [];
      if(token.length > 1){
        var _tmp = token[1];
        current_options = _tmp.split('-');
      }

      var varlist = tdx.Object.obj.getVariations();
      var variations = [];
      if(varlist.length > 0){
        for (var i = 0; i < varlist.length; i++){
          var varid = varlist[i].getAttribute("id");
          var varname = varlist[i].getAttribute("name");
          var varvisible = varlist[i].getAttribute("visible");
          varvisible = setParamValue(varvisible,"");

          if(varvisible.indexOf("discon")>=0) continue;
          var err_flag = false;
          try{
            var varitems = varlist[i].getElementsByTagName('item');
            if(varitems.length == 0) err_flag = true;
          } catch(err){
            err_flag = true;
          }
          if(err_flag) continue;

          var newvar = {
            id:varid,
            name:varname,
            items:[]
          };

          var matlist = tdx.Object.obj.getMaterial(varid);
          var matitems = matlist.getElementsByTagName('item');
          for(var k = 0; k < matitems.length; k++){
            var mat_id = matitems[k].firstChild.nodeValue;
            var mat_name = matitems[k].getAttribute('alt');

            var mat_type = matitems[k].getAttribute('type');
            var mat_map = matitems[k].getAttribute('map');
            var mat_value = matitems[k].getAttribute('value');
            var mat_code = matitems[k].getAttribute('code');
            var mat_param = matitems[k].getAttribute('param');
            var mat_tdt = matitems[k].getAttribute('tdt');
            var mat_visible = matitems[k].getAttribute('visible');

            mat_type = setParamValue(mat_type,0);
            mat_map = setParamValue(mat_map,'');
            mat_value = setParamValue(mat_value,'');
            mat_code = setParamValue(mat_code,'');
            mat_param = setParamValue(mat_param,'');
            mat_tdt = setParamValue(mat_tdt,'');
            mat_visible = setParamValue(mat_visible,'');

            var newmat = {
              id:mat_id,
              name:mat_name,
              param:{
                selected:isOptionSelected(current_options, mat_code),
                varid:varid,
                type:mat_type,
                map:mat_map,
                value:mat_value,
                code:mat_code,
                param:mat_param,
                tdt:mat_tdt,
              }
            };

            newvar.items.push(newmat);

          }

          variations.push(newvar);

        }
      }

      var jstr = JSON.stringify(variations);
      return jstr;
    },

    setVariation:function(id,param){
      var oparam = JSON.parse(param);
      var varkey = oparam.varid;
      var item = id;
      var stype = oparam.type;
      var smap = oparam.map;
      var stdt = oparam.tdt;
      var svalue = oparam.value;
      var scode = oparam.code;
      var sparam = oparam.parm;
      selectMatFurniture(varkey,item,stype,smap,stdt,svalue,scode,sparam);
    }

  }
})(TdxMain||{});

//////// begin new //////
var timVariation;
var gVariationSet = {
    CurrentObj:0,
    SelectedObj:0,
    SetNo:0,
    VarKey:"",
    Item:"",
    Count:0,
    VarItem:[]
}

function isOptionSelected(arr,sopt){
  var flag = false;
  if(arr.length == 0) return false;
  if(!sopt) return false;
  var token = sopt.split('x');
  var index = parseInt(token[0]);
  var value = token[1];
  try{
    if(arr[index] === value) flag = true;
  } catch(err){
    flag = false;
  }
  return flag;
}

function setSelectMatFurniture() {
  var param = arguments[0].split(",");
  var varkey = param[0];
	var item = (param.length > 1)?param[1]:"";
	var stype = (param.length > 2)?parseInt(param[2]):0;
	var smap = (param.length > 3)?param[3]:"";
	var stdt = (param.length > 4)?param[4]:"";
	var svalue = (param.length > 5)?param[5]:"";
	var scode = (param.length > 6)?param[6]:"";
  var sparam = (param.length > 7)?param[7]:"";
  selectMatFurniture(varkey, item, stype, smap, stdt, svalue, scode, sparam);
}

function selectMatFurniture(){
  var tdx = document.getElementById("Control1");

  var varkey = arguments[0];
	var item = arguments[1];
	var stype = arguments[2];
	var smap = arguments[3];
	var stdt = arguments[4];
	var svalue = arguments[5];
	var scode = arguments[6];
  var sparam = arguments[7];
  
  if(svalue || scode || sparam) UpdateItemValue(svalue, scode, sparam);
  if(stdt){
    if(stdt.indexOf('/')<0){
      var s = stdt.replace('.3dt','');
      stdt = s + '/' +stdt;
    }
  }

  if(stype == 1){
		selectMatFurniture3(smap, stdt);
	} else if(stype == 2) {
		selectMatFurniture4(varkey,item,smap,stdt);
	} else if(stype == 5) {
		selectMatFurniture7(smap);
	} else if(stype == 7) {
		selectMatFurniture4(varkey,item,smap,stdt);
	} else if(stype == 8) {
		setSelObjectSize(smap);
	} else {
		selectMatFurniture2(varkey,item,stdt);
	}

}

function selectMatFurniture2(varkey, item, stdt){
  var tdx = document.getElementById('Control1');

  var furnset = tdx.Object.obj.getSummary("furnset");
  furnset = setParamValue(furnset, "no");
  if(furnset == "yes"){

    var setno = tdx.Object.obj.getSummary("setno");
    setno = setParamValue(setno,1);
    setno = parseInt(setno);        
    var _tmp = tdx.Object.Selected.replace("furn_");
    var _token = _tmp.split("_");
    var current_no = 0;
    if(_token.length > 1){
        current_no = parseInt(_token[1],10);            
    }

    var _parent = tdx.GetSelObj();
    gVariationSet.SelectedObj = _parent;
    _parent = parseInt(_parent);
    _parent = _parent - current_no;
    gVariationSet.CurrentObj = _parent;
    gVariationSet.SetNo = setno;
    gVariationSet.Count = 0;
    gVariationSet.VarKey = varkey;
    gVariationSet.Item = item;
    gVariationSet.VarItem = [];
    
    tdx.EnableControl(0);
    tdx.BeginUpdate();
    timVariation = setInterval(function(){
        var tdx = document.getElementById("Control1");
        var flag = tdx.IsBusy();
        if(flag) return;
        if(gVariationSet.Count == gVariationSet.SetNo){
            tdx.SetSelObj(gVariationSet.SelectedObj);
            
            var variation = gVariationSet.VarItem;
            var str_variation = JSON.stringify(variation);
            tdx.ApplyVariation(str_variation);
            
            tdx.EndUpdate();
            tdx.EnableControl(1);
            clearInterval(timVariation);
            
            return;
        }
            
        tdx.SetSelObj(gVariationSet.CurrentObj);
        
        var vargrp = tdx.Object.obj.getVariation(gVariationSet.VarKey);
        var items = vargrp.getElementsByTagName("item");
        var basename = getBasename(gVariationSet.Item);
        var n = basename.indexOf("_");
        var prodid = basename;
        if(n > 0){
            prodid = basename.substr(0,n); 
        }
            
        var m_texture;
        for(var i = 0; i < items.length; i++){
            var attrib = items[i].firstChild.nodeValue;
            var pattern = items[i].getAttribute("pattern");
            var suffix = items[i].getAttribute("suffix");
            if(pattern){
                if(pattern.indexOf(prodid)>=0){
                    var texture = basename+"_"+suffix;
                    //tdx.SetObjectTexture(attrib,texture);
                    m_texture = texture;
                } else {
                    //tdx.SetObjectTexture(attrib,"blank.gif");
                    m_texture = "blank.gif";
                }
            } else {
                //tdx.SetObjectTexture(attrib,item);
                m_texture = item;
            }
            
            var var0 = {
              "obj":gVariationSet.CurrentObj,
              "atr":attrib,
              "map":[
                  {
                      "ind":0,
                      "img":m_texture
                  }
              ]
            };
            gVariationSet.VarItem.push(var0);
        }

        gVariationSet.CurrentObj++;
        gVariationSet.Count++;

    },100);
    
    return;
  }

  var vargrp = tdx.Object.obj.getVariation(varkey);
	var items = vargrp.getElementsByTagName("item");

	var basename = getBasename(item);
	var n = basename.indexOf("_");
	var prodid = basename;
	if(n > 0){
		prodid = basename.substr(0,n);
	}
    
  var variation = [];
  var s_map0;
  
	for(var i = 0; i < items.length; i++){
		var attrib = items[i].firstChild.nodeValue;
		var pattern = items[i].getAttribute("pattern");
		var suffix = items[i].getAttribute("suffix");
		if(pattern){
			if(pattern.indexOf(prodid)>=0 || prodid.indexOf(pattern) >= 0){
				var texture = basename+"_"+suffix;
				if(stdt){
					//tdx.SetObjectMap2(attrib,0,texture,stdt);
          s_map0 = texture;
				} else {
					//tdx.SetObjectTexture(attrib,texture);
          s_map0 = texture;
				}
			} else {
				//tdx.SetObjectTexture(attrib,"blank.gif");
        s_map0 = "blank.gif";
			}
		} else {
			if(stdt){
				//tdx.SetObjectMap2(attrib,0,item,stdt);
        s_map0 = item;
			} else {
				//tdx.SetObjectTexture(attrib,item);
        s_map0 = item;
			}
		}
    
    var mapvar = {
      "atr":attrib,
      "map":[
          {
              "ind":0,
              "img":s_map0,
              "tdt":stdt
          }
      ]
    }        
    variation.push(mapvar);
        
	}
    
  var str_variation = JSON.stringify(variation);
  tdx.ApplyVariation(str_variation);
	tdx.Redraw();

}
function selectMatFurniture3(smap, stdt){
  var tdx = document.getElementById("Control1");
  if(!smap) return;

  var furnset = tdx.Object.obj.getSummary("furnset");
  furnset = setParamValue(furnset, "no");
  if(furnset == "yes"){

    var setno = tdx.Object.obj.getSummary("setno");
    setno = setParamValue(setno,1);
    setno = parseInt(setno);        
    var _tmp = tdx.Object.SelectedObject.replace("furn_");
    var _token = _tmp.split("_");
    var current_no = 0;
    if(_token.length > 1){
        current_no = parseInt(_token[1],10);            
    }
        
    var _parent = parseInt(tdx.GetSelObj());
    gVariationSet.SelectedObj = _parent;
    _parent = _parent - current_no;
    
    gVariationSet.CurrentObj = _parent;
    gVariationSet.SetNo = setno;
    gVariationSet.Count = 0;
    gVariationSet.Item = smap;
    gVariationSet.VarItem = [];
    
    tdx.EnableControl(0);
    tdx.BeginUpdate();
    timVariation = setInterval(function(){
      var tdx = document.getElementById("Control1");
      var flag = tdx.IsBusy();
      if(flag) return;
      if(gVariationSet.Count == gVariationSet.SetNo){
        tdx.SetSelObj(gVariationSet.SelectedObj);
        
        var variation = gVariationSet.VarItem;
        var str_variation = JSON.stringify(variation);
        tdx.ApplyVariation(str_variation);
        
        tdx.EndUpdate();
        tdx.EnableControl(1);
        clearInterval(timVariation);
        return;
      }
            
      tdx.SetSelObj(gVariationSet.CurrentObj);
      
      var smap = gVariationSet.Item;
      var mat = tdx.Object.obj.getMaterial(smap);
      var items = mat.getElementsByTagName("item");
      for(var i = 0; i < items.length; i++){
        var attrib = items[i].firstChild.nodeValue;
        var mats = items[i].getAttribute("mat");
        var token = mats.split(";");
        var tdt = items[i].getAttribute("tdt");
        tdt = setParamValue(tdt,"");
        
        var variation0 = {
          "obj":gVariationSet.CurrentObj,
          "atr":attrib,
          "map":[],
          "mat":[]
        };
                
        for(var k = 0;k < token.length;k++){
          var tmp = token[k].split(":");
          if(tmp[0] === "opacity"){
            //tdx.SetObjectMaterial(attrib,4,parseInt(tmp[1]));
            
            var mat0 = {
                "ind":4,
                "val":parseInt(tmp[1])
            };
            variation0.mat.push(mat0);
              
          }else if(tmp[0] === "specular"){
            //tdx.SetObjectMaterial(attrib,2,parseInt(tmp[1]));
            
            var mat0 = {
                "ind":2,
                "val":parseInt(tmp[1])
            };
            variation0.mat.push(mat0);
              
          }else if(tmp[0] === "gloss"){
            //tdx.SetObjectMaterial(attrib,3,parseInt(tmp[1]));
              
            var mat0 = {
                "ind":3,
                "val":parseInt(tmp[1])
            };
            variation0.mat.push(mat0);
                        
          }else if(tmp[0] === "flatactive"){
            //tdx.SetObjectMaterial(attrib,6,3);
            //tdx.SetObjectMaterial(attrib,7,parseInt(tmp[1]));
            
            var mat0 = {
                "ind":6,
                "val":3
            };
            var mat1 = {
                "ind":7,
                "val":parseInt(tmp[1])
            };
            variation0.mat.push(mat0);
            variation0.mat.push(mat1);
              
          }else if(tmp[0] === "envmap"){
            //tdx.SetObjectMaterial(attrib,6,1);
            //tdx.SetObjectMaterial(attrib,7,parseInt(tmp[1]));
                      
            var mat0 = {
                "ind":6,
                "val":1
            };
            var mat1 = {
                "ind":7,
                "val":parseInt(tmp[1])
            };
            variation0.mat.push(mat0);
            variation0.mat.push(mat1);
                      
          }else if(tmp[0] === "texture"){
            /*
            if(tdt){
                tdx.SetObjectMap2(attrib,0,tmp[1],tdt);
            } else {
                tdx.SetObjectMap(attrib,0,tmp[1]);
            }
            */
                        
            var map0 = {
                "ind":0,
                "img":tmp[1],
                "tdt":tdt
            };
            variation0.map.push(map0);
              
          }else if(tmp[0] === "specmap"){
            /*
            if(tdt){
                tdx.SetObjectMap2(attrib,10,tmp[1],tdt);
            } else {
                tdx.SetObjectMap(attrib,10,tmp[1]);
            }
            */
                        
            var map0 = {
                "ind":10,
                "img":tmp[1],
                "tdt":tdt
            };
            variation0.map.push(map0);
              
          }else if(tmp[0] === "diffuse"){
            /*
            if(tdt){
                tdx.SetObjectMap2(attrib,3,tmp[1],tdt);
            } else {
                tdx.SetObjectMap(attrib,3,tmp[1]);
            }
            */
              
            var map0 = {
                "ind":3,
                "img":tmp[1],
                "tdt":tdt
            };
            variation0.map.push(map0);
                        
          }else if(tmp[0] === "envimg"){
            /*
            if(tdt){
                tdx.SetObjectMap2(attrib,5,tmp[1],tdt);
            } else {
                tdx.SetObjectMap(attrib,5,tmp[1]);
            }
            */
            
            var map0 = {
                "ind":5,
                "img":tmp[1],
                "tdt":tdt
            };
            variation0.map.push(map0);
                  
          }

        }

        gVariationSet.VarItem.push(variation0);

      }
      gVariationSet.CurrentObj++;
      gVariationSet.Count++;
          
    },100);
    return;
  }
    
  var variation = [];
  var s_map0, s_mat0;
  
	var mat = tdx.Object.obj.getMaterial(smap);
	var items = mat.getElementsByTagName("item");
	for(var i = 0; i < items.length; i++){
		var attrib = items[i].firstChild.nodeValue;
		var mats = items[i].getAttribute("mat");
		var token = mats.split(";");
		var tdt = items[i].getAttribute("tdt");
		tdt = setParamValue(tdt,"");
        
        if(!tdt) tdt = stdt;
        
        var variation0 = {
            "atr":attrib,
            "mat":[],
            "map":[]
        };
        
		for(var k = 0;k < token.length;k++){
			var tmp = token[k].split(":");
			if(tmp[0] === "opacity"){
				//tdx.SetObjectMaterial(attrib,4,parseInt(tmp[1]));
        s_mat0 = parseInt(tmp[1]);
        
        //console.log(' - '+attrib+','+s_mat0);

        var mat0 = {
            "ind":4,
            "val":s_mat0
        };
        variation0.mat.push(mat0);
                
			} else if(tmp[0] === "specular"){
				//tdx.SetObjectMaterial(attrib,2,parseInt(tmp[1]));
        s_mat0 = parseInt(tmp[1]);
        
        var mat1 = {
            "ind":2,
            "val":s_mat0
        };
        variation0.mat.push(mat1);
                
			} else if(tmp[0] === "gloss"){
				//tdx.SetObjectMaterial(attrib,3,parseInt(tmp[1]));
        s_mat0 = parseInt(tmp[1]);
        
        var mat2 = {
            "ind":3,
            "val":s_mat0
        };
        variation0.mat.push(mat2);
                
			} else if(tmp[0] === "flatactive"){
				//tdx.SetObjectMaterial(attrib,6,3);
				//tdx.SetObjectMaterial(attrib,7,parseInt(tmp[1]));
        s_mat0 = parseInt(tmp[1]);
        
        var mat3 = {
            "ind":6,
            "val":3
        };
        var mat4 = {
            "ind":7,
            "val":s_mat0
        };
        variation0.mat.push(mat3);
        variation0.mat.push(mat4);
                
			} else if(tmp[0] === "envmap"){
				//tdx.SetObjectMaterial(attrib,6,1);
				//tdx.SetObjectMaterial(attrib,7,parseInt(tmp[1]));
        s_mat0 = parseInt(tmp[1]);
        
        var mat5 = {
            "ind":6,
            "val":1
        };
        var mat6 = {
            "ind":7,
            "val":s_mat0
        };
        variation0.mat.push(mat5);
        variation0.mat.push(mat6);
                
			} else if(tmp[0] === "texture"){
				if(tdt){
					//tdx.SetObjectMap2(attrib,0,tmp[1],tdt);
				} else {
					//tdx.SetObjectMap(attrib,0,tmp[1]);
				}
        s_map0 = tmp[1];
        
        var map0 = {
            "ind":0,
            "img":s_map0,
            "tdt":tdt
        };
        variation0.map.push(map0);
                
			} else if(tmp[0] === "specmap"){
				if(tdt){
					//tdx.SetObjectMap2(attrib,10,tmp[1],tdt);
				} else {
					//tdx.SetObjectMap(attrib,10,tmp[1]);
				}
        s_map0 = tmp[1];
        
        var map1 = {
            "ind":10,
            "img":s_map0,
            "tdt":tdt
        };
        variation0.map.push(map1);
                
			} else if(tmp[0] === "diffuse"){
				if(tdt){
					//tdx.SetObjectMap2(attrib,3,tmp[1],tdt);
				} else {
					//tdx.SetObjectMap(attrib,3,tmp[1]);
				}
        s_map0 = tmp[1];
        
        var map2 = {
            "ind":3,
            "img":s_map0,
            "tdt":tdt
        };
        variation0.map.push(map2);
                
			} else if(tmp[0] === "envimg"){
				if(tdt){
					//tdx.SetObjectMap2(attrib,5,tmp[1],tdt);
				} else {
					//tdx.SetObjectMap(attrib,5,tmp[1]);
				}
        s_map0 = tmp[1];
        
        var map3 = {
            "ind":5,
            "img":s_map0,
            "tdt":tdt
        };
        variation0.map.push(map3);
                
			}
		}
        
    variation.push(variation0);
	}
  
  var str_variation = JSON.stringify(variation);
  tdx.ApplyVariation(str_variation);
	tdx.Redraw();
}
function selectMatFurniture4(varkey, item, smap, stdt){
  var token = smap.split(";");
	var arr = [];
	for(var i = 0; i < token.length; i++){
		var atoken = token[i].split(":");
		arr[i] = {
			key:atoken[0],
			value:atoken[1]
		};
	}

  var tdx = document.getElementById("Control1");
	var vargrp = tdx.Object.obj.getVariation(varkey);
	var items = vargrp.getElementsByTagName("item");
	var basename = getBasename(item);
  var str_texture, str_mat;

  for(var i = 0; i < items.length; i++){
		var attrib = items[i].firstChild.nodeValue;
		var mats = items[i].getAttribute("mat");
		var suffix = items[i].getAttribute("suffix");
		mats = setParamValue(mats,"");
		suffix = setParamValue(suffix,"");
		var diffuse = "";

		if(suffix.indexOf(";")>=0){
			var ctoken = suffix.split(";");
			diffuse = ctoken[1];
			suffix = ctoken[0];
		}
		if(mats){
            
      var variation0 = {
          "atr":attrib,
          "map":[],
          "mat":[]
      };
            
			var mtoken = mats.split(";");
			for(var k = 0; k < mtoken.length; k++){
				if(!mtoken[k]) break;
				if(mtoken[k] == "texture"){
					if(suffix){
						var texture = basename+"_"+suffix;
						str_texture = texture;
					} else {
						str_texture = item;
					}
                    
          var maptex = {
              "ind":0,
              "img":str_texture,
              "tdt":stdt
          };
          variation0.map.push(maptex);
                    
				}
                
				for(var n = 0; n < arr.length; n++){
					if(arr[n].key == mtoken[k]){
						if(arr[n].key == "specmap"){
							str_texture = arr[n].value;
              
              var map0 = {
                  "ind":10,
                  "img":str_texture,
                  "tdt":stdt
              };
              variation0.map.push(map0);
                            
						} else if(arr[n].key == "envimg"){
							str_texture = arr[n].value;
              
              var map1 = {
                  "ind":5,
                  "img":str_texture,
                  "tdt":stdt
              };
              variation0.map.push(map1);
                            
						} else if(arr[n].key == "diffuse"){
							if(diffuse){
								diffuse = arr[n].value+"_"+diffuse;
								str_texture = diffuse;
							} else {
								str_texture = arr[n].value;
							}
                            
              var map2 = {
                  "ind":3,
                  "img":str_texture,
                  "tdt":stdt
              };
              variation0.map.push(map2);
                            
						} else if(arr[n].key == "specular"){
							//tdx.SetObjectMaterial(attrib,2,arr[n].value);
              str_mat = arr[n].value;
              
              var mat0 = {
                  "ind":2,
                  "val":str_mat
              };
              variation0.mat.push(mat0);
                            
						} else if(arr[n].key == "gloss"){
							//tdx.SetObjectMaterial(attrib,3,arr[n].value);
              str_mat = arr[n].value;
              
              var mat1 = {
                  "ind":3,
                  "val":str_mat
              };
              variation0.mat.push(mat1);
                            
						} else if(arr[n].key == "opacity"){
							//tdx.SetObjectMaterial(attrib,4,arr[n].value);
              str_mat = arr[n].value;
              
              var mat2 = {
                  "ind":4,
                  "val":str_mat
              };
              variation0.mat.push(mat2);
                            
						} else if(arr[n].key == "envmap"){
							//tdx.SetObjectMaterial(attrib,6,1);
							//tdx.SetObjectMaterial(attrib,7,parseInt(arr[n].value));
              str_mat = parseInt(arr[n].value);
              
              var mat3 = {
                  "ind":6,
                  "val":1
              };
              var mat4 = {
                  "ind":7,
                  "val":str_mat
              };
              variation0.mat.push(mat3);
              variation0.mat.push(mat4);
            }
						break;
					}
				}
			}
            
		} else {

			if(suffix){
				var texture = basename+"_"+suffix;
				str_texture = texture;
			} else {
				str_texture = item;
			}
            
      var variation0 = {
        "atr":attrib,
        "map":[
          {
              "ind":0,
              "img":str_texture,
              "tdt":stdt
          }
        ]
      };      

      variation.push(variation0);
            
		}
	}
    
  var str_variation = JSON.stringify(variation);
  tdx.ApplyVariation(str_variation);
	tdx.Redraw();

}

function selectMatFurniture7(anim){
  var tdx = document.getElementById("Control1");
  
  var furnset = tdx.Object.obj.getSummary("furnset");
  furnset = setParamValue(furnset, "no");
  if(furnset == "yes"){
    var setno = tdx.Object.obj.getSummary("setno");
    setno = setParamValue(setno,1);
    setno = parseInt(setno);        
    var _tmp = tdx.Object.SelectedObject.replace("furn_");
    var _token = _tmp.split("_");
    var current_no = 0;
    if(_token.length > 1){
        current_no = parseInt(_token[1],10);            
    }
    
    var _parent = parseInt(tdx.GetSelObj());
    gVariationSet.SelectedObj = _parent;
    _parent = _parent - current_no;
    gVariationSet.SelectedObj = _parent;
    
    gVariationSet.CurrentObj = _parent;
    gVariationSet.SetNo = setno;
    gVariationSet.Count = 0;
    gVariationSet.Item = anim;
    gVariationSet.VarItem = [];

    tdx.EnableControl(0);
    tdx.BeginUpdate();

    timVariation = setInterval(function(){
      var tdx = document.getElementById("Control1");
      var flag = tdx.IsBusy();
      if(flag) return;
      if(gVariationSet.Count == gVariationSet.SetNo){
          tdx.SetSelObj(gVariationSet.SelectedObj);
          
          //var variation = gVariationSet.VarItem;
          //var str_variation = JSON.stringify(variation);
          //tdx.ApplyVariation(str_variation);
          
          tdx.EndUpdate();
          tdx.EnableControl(1);
          clearInterval(timVariation);
          return;
      }
      
      tdx.SetSelObj(gVariationSet.CurrentObj);

      var anim = gVariationSet.Item;
      var stoken = anim.split(";");
      var anigrp,token,atoken,smap;
      if(stoken.length > 1) {
        anim = stoken[0];
        smap = stoken[1];        
        token = anim.split(":");        
        if(token[1].indexOf(",") >= 0) {
            atoken = token[1].split(",");
            anigrp = parseInt(atoken[1]);
        } else {
            anigrp = parseInt(token[1]);
        }
        tdx.PlayAnimationOfSelected(anigrp);
        
        /*
        var variation0 = {
            "obj":gVariationSet.CurrentObj,
            "ani":anigrp
        };
        gVariationSet.VarItem.push(variation0);
        */

        if(smap) { 
          if(smap.indexOf("SHORT")>=0 || smap.indexOf("LONG")>=0){                        
            var flagShort = (smap.indexOf("SHORT")>=0)?true:false;
            var varitem = tdx.Object.obj.getVariation(0);
            var items = varitem.getElementsByTagName("item");
            for(var i = 0; i < items.length; i++){
              var attrib = items[i].firstChild.nodeValue;
              var texture = tdx.GetObjectMap(attrib,0);
              var basename = getBasename(texture);
              var lastchar = basename.substr(basename.length-1);      
              if(flagShort){
                if(lastchar == "a"){
                  texture = texture.replace("a.jpg",".jpg");
                  tdx.SetObjectMap(attrib,0,texture);
                }
              } else {
                if(lastchar != "a"){
                  texture = basename + "a.jpg";
                  tdx.SetObjectMap(attrib,0,texture);
                }
              }
                  
              /*
              var variation1 = {
                  "atr":attrib,
                  "map":[
                      {
                          "ind":0,
                          "img":texture
                      }
                  ]
              };
              gVariationSet.VarItem.push(variation1);
              */
                  
            }
          } else {
            //selectMatFurniture3Ext(smap);
            var mat = tdx.Object.obj.getMaterial(smap);
            var items = mat.getElementsByTagName("item");
            for(var i = 0; i < items.length; i++){
              var attrib = items[i].firstChild.nodeValue;
              var mats = items[i].getAttribute("mat");
              var token = mats.split(";");
              var tdt = items[i].getAttribute("tdt");
              tdt = setParamValue(tdt,"");
              
              /*
              var variation1 = {
                  "atr":attrib,
                  "map":[],
                  "mat":[]
              };
              */
                            
              for(var k = 0;k < token.length;k++){
                var tmp = token[k].split(":");
                if(tmp[0] === "opacity"){
                  tdx.SetObjectMaterial(attrib,4,parseInt(tmp[1]));
                  
                  /*
                  var mat0 = {
                      "ind":4,
                      "val":parseInt(tmp[1])
                  };
                  variation1.mat.push(mat0);
                  */
                    
                }else if(tmp[0] === "specular"){
                  tdx.SetObjectMaterial(attrib,2,parseInt(tmp[1]));
                                    
                  /*
                  var mat0 = {
                      "ind":2,
                      "val":parseInt(tmp[1])
                  };
                  variation1.mat.push(mat0);
                  */
                    
                }else if(tmp[0] === "gloss"){
                  tdx.SetObjectMaterial(attrib,3,parseInt(tmp[1]));
                  
                  /*
                  var mat0 = {
                      "ind":3,
                      "val":parseInt(tmp[1])
                  };
                  variation1.mat.push(mat0);
                  */
                                    
                }else if(tmp[0] === "flatactive"){
                  tdx.SetObjectMaterial(attrib,6,3);
                  tdx.SetObjectMaterial(attrib,7,parseInt(tmp[1]));
                  
                  /*
                  var mat0 = {
                      "ind":6,
                      "val":3
                  };
                  var mat0 = {
                      "ind":7,
                      "val":parseInt(tmp[1])
                  };
                  variation1.mat.push(mat0);
                  variation1.mat.push(mat1);
                  */
                                    
                }else if(tmp[0] === "envmap"){
                  tdx.SetObjectMaterial(attrib,6,1);
                  tdx.SetObjectMaterial(attrib,7,parseInt(tmp[1]));
                  
                  /*
                  var mat0 = {
                      "ind":6,
                      "val":1
                  };
                  var mat0 = {
                      "ind":7,
                      "val":parseInt(tmp[1])
                  };
                  variation1.mat.push(mat0);
                  variation1.mat.push(mat1);
                  */
                                  
                }else if(tmp[0] === "texture"){
                  if(tdt){
                      tdx.SetObjectMap2(attrib,0,tmp[1],tdt);
                  } else {
                      tdx.SetObjectMap(attrib,0,tmp[1]);
                  }
                    
                  /*
                  var map0 = {
                      "ind":0,
                      "img":tmp[1],
                      "tdt":tdt
                  };
                  variation1.map.push(map0);
                  */
                                  
                }else if(tmp[0] === "specmap"){
                  if(tdt){
                      tdx.SetObjectMap2(attrib,10,tmp[1],tdt);
                  } else {
                      tdx.SetObjectMap(attrib,10,tmp[1]);
                  }
                  
                  /*
                  var map0 = {
                      "ind":10,
                      "img":tmp[1],
                      "tdt":tdt
                  };
                  variation1.map.push(map0);
                  */
                                    
                }else if(tmp[0] === "diffuse"){
                    
                  if(tdt){
                      tdx.SetObjectMap2(attrib,3,tmp[1],tdt);
                  } else {
                      tdx.SetObjectMap(attrib,3,tmp[1]);
                  }
                                
                  /*
                  var map0 = {
                      "ind":3,
                      "img":tmp[1],
                      "tdt":tdt
                  };
                  variation1.map.push(map0);
                  */
                }else if(tmp[0] === "envimg"){
                  if(tdt){
                      tdx.SetObjectMap2(attrib,5,tmp[1],tdt);
                  } else {
                      tdx.SetObjectMap(attrib,5,tmp[1]);
                  }
                    
                  /*
                  var map0 = {
                      "ind":5,
                      "img":tmp[1],
                      "tdt":tdt
                  };
                  variation1.map.push(map0);                                    
                  */
                }
              }
              
              //gVariationSet.VarItem.push(variation1);

            }
          }
        }

      } else {
        token = anim.split(":");        
        if(token[1].indexOf(",") >= 0) {
            atoken = token[1].split(",");
            anigrp = parseInt(atoken[1]);
        } else {
            anigrp = parseInt(token[1]);
        }
        tdx.PlayAnimationOfSelected(anigrp);
        
        /*
        var variation0 = {
            "obj":gVariationSet.CurrentObj,
            "ani":anigrp,
        };
        gVariationSet.VarItem.push(variation0);
        */
                
      }
            
      gVariationSet.CurrentObj++;
      gVariationSet.Count++;
            
    },100);
    
    return;
  }

  var stoken = anim.split(";");
	var anigrp,token,atoken,smap;
	if(stoken.length > 1) {
		anim = stoken[0];
		smap = stoken[1];
		token = anim.split(":");
		if(token[1].indexOf(",") >= 0) {
			atoken = token[1].split(",");
			anigrp = parseInt(atoken[1]);
		} else {
			anigrp = parseInt(token[1]);
		}
        
    var variation = [];
    var anim = {
        ani:[anigrp]
    };
    variation.push(anim);
        
		//tdx.PlayAnimationOfSelected(anigrp);
		//if(smap) selectMatFurniture3(smap);
    if(smap){
        
      var mat = tdx.Object.obj.getMaterial(smap);
      var items = mat.getElementsByTagName("item");
      for(var i = 0; i < items.length; i++){            
          var attrib = items[i].firstChild.nodeValue;
          var mats = items[i].getAttribute("mat");
          var token = mats.split(";");
          var tdt = items[i].getAttribute("tdt");
          tdt = setParamValue(tdt,"");
          
          var var0 = {
              "atr":attrib,
              "map":[],
              "mat":[]
          };
                
          for(var k = 0;k < token.length;k++){
            var tmp = token[k].split(":");
            if(tmp[0] === "opacity"){
              //tdx.SetObjectMaterial(attrib,4,parseInt(tmp[1]));
              
              var mat0 = {
                  "ind":4,
                  "val":parseInt(tmp[1])
              };
              var0.mat.push(mat0);
                
            }else if(tmp[0] === "specular"){
              //tdx.SetObjectMaterial(attrib,2,parseInt(tmp[1]));
              
              var mat0 = {
                  "ind":2,
                  "val":parseInt(tmp[1])
              };
              var0.mat.push(mat0);
                
            }else if(tmp[0] === "gloss"){
              //tdx.SetObjectMaterial(attrib,3,parseInt(tmp[1]));
              
              var mat0 = {
                  "ind":3,
                  "val":parseInt(tmp[1])
              };
              var0.mat.push(mat0);
                        
            }else if(tmp[0] === "flatactive"){
              //tdx.SetObjectMaterial(attrib,6,3);
              //tdx.SetObjectMaterial(attrib,7,parseInt(tmp[1]));
                
            }else if(tmp[0] === "envmap"){
              //tdx.SetObjectMaterial(attrib,6,1);
              //tdx.SetObjectMaterial(attrib,7,parseInt(tmp[1]));
              
              var mat0 = {
                  "ind":6,
                  "val":1
              };
              var mat1 = {
                  "ind":7,
                  "val":parseInt(tmp[1])
              };
              var0.mat.push(mat0);
              var0.mat.push(mat1);
                
            }else if(tmp[0] === "texture"){
              if(tdt){
                  //tdx.SetObjectMap2(attrib,0,tmp[1],tdt);
              } else {
                  //tdx.SetObjectMap(attrib,0,tmp[1]);
              }
              
              var map0 = {
                "ind":0,
                "img":tmp[1],
                "tdt":tdt
              };
              var0.map.push(map0);
                
            }else if(tmp[0] === "specmap"){
              if(tdt){
                  //tdx.SetObjectMap2(attrib,10,tmp[1],tdt);
              } else {
                  //tdx.SetObjectMap(attrib,10,tmp[1]);
              }
              
              var map0 = {
                "ind":10,
                "img":tmp[1],
                "tdt":tdt
              };
              var0.map.push(map0);
                        
            }else if(tmp[0] === "diffuse"){
              if(tdt){
                  //tdx.SetObjectMap2(attrib,3,tmp[1],tdt);
              } else {
                  //tdx.SetObjectMap(attrib,3,tmp[1]);
              }
              
              var map0 = {
                "ind":3,
                "img":tmp[1],
                "tdt":tdt
              };
              var0.map.push(map0);
                
            }else if(tmp[0] === "envimg"){
              if(tdt){
                  //tdx.SetObjectMap2(attrib,5,tmp[1],tdt);
              } else {
                  //tdx.SetObjectMap(attrib,5,tmp[1]);
              }
              
              var map0 = {
                  "ind":5,
                  "img":tmp[1],
                  "tdt":tdt
              };
              var0.map.push(map0);
                    
            }
          }
          
        variation.push(var0);

      }
        
    }
        
    var str_variation = JSON.stringify(variation);
    tdx.ApplyVariation(str_variation);
    tdx.Redraw();
    
	} else {
		token = anim.split(":");
		if(token[1].indexOf(",") >= 0) {
			atoken = token[1].split(",");
			anigrp = parseInt(atoken[1]);
		} else {
			anigrp = parseInt(token[1]);
		}
		//tdx.PlayAnimationOfSelected(anigrp);
        
    var variation = [];
    var anim = {
        ani:[anigrp]
    };
    variation.push(anim);
    var str_variation = JSON.stringify(variation);
    tdx.ApplyVariation(str_variation);
    //tdx.Redraw();
    
	}

}
function setSelObjectSize(size_str){
  var tdx = document.getElementById('Control1');
  var token, xyz, sx, sy, sz;
  var furn, attrs, items;
  var attrib, texture, basename, lastchar;

  if(size_str.indexOf('SHORT')>=0 || size_str.indexOf('LONG')>=0){
    var flag = (size_str.indexOf("SHORT")>=0)?true:false;
		xyz = tdx.GetObjectSize();
		token = xyz.split(",");
		sx = parseFloat(token[0]);
		sy = (flag)?1.5:2.8;
		sz = parseFloat(token[2]);
		tdx.SetObjectSize(sx,sy,sz);

    var variation = [];

    var vargrp = tdx.Object.obj.getVariation(0);
		items = vargrp.getElementsByTagName("item");
		for(var i = 0; i < items.length; i++){
			attrib = items[i].firstChild.nodeValue;
			texture = tdx.GetObjectMap(attrib,0);
			basename = getBasename(texture);
			lastchar = basename.substr(basename.length-1);
      var flag = false;
      
      var var0 = {
          "atr":attrib,
          "map":[]
      };
            
			if(flag){
				if(lastchar == "a"){
					texture = texture.replace("a.jpg",".jpg");
					//tdx.SetObjectMap(attrib,0,texture);                    
          var map0 = {
              "ind":0,
              "img":texture
          };
          var0.map.push(map0);                    
          flag = true;
        }
			} else {
				if(lastchar != "a"){
					texture = basename + "a.jpg";
					//tdx.SetObjectMap(attrib,0,texture);
          var map0 = {
              "ind":0,
              "img":texture
          };
          var0.map.push(map0);   
          flag = true;
        }
			}
            
      if(flag){
          variation.push(var0);
      }
            
		}
        

  } else {
    token = size_str.split(",");
		sx = parseFloat(token[0]);
		sz = parseFloat(token[1]);
		xyz = tdx.GetObjectSize();
		token = xyz.split(",");
		sy = parseFloat(token[1]);
		tdx.SetObjectSize(sx,sy,sz);
  }

}

function UpdateItemValue(sitemstr, scodestr, sparam){
  var tdx = document.getElementById("Control1");
	var smetadata = tdx.GetMetaData();
	if(typeof(smetadata) == "undefined") smetadata = "";
	if(!smetadata) return;
    
	var stoken = smetadata.split(":");
	var selected_value = stoken[0].split("-"); //VALUE
	var selected_code = stoken[1]; //CODE
  var selected_param = stoken[2]; //PARAM
    
	var cur_value = selected_code; //CODESTR
	var cur_token = cur_value.split("-"); //CODE ARR
  var cur_param = selected_param.split("|");

  //////// PARAM ////////
  if(sparam){        
    var param_items = sparam.split(";");
    var param_token, param_index, param_value;
    for(var k = 0; k < param_items.length; k++){
        param_token = param_items[k].split("x");
        param_index = parseInt(param_token[0]);
        param_value = param_token[1];
        cur_param[param_index] = param_value;
    }
    var new_param = "";
    for(var k = 0; k < cur_param.length; k++){
        new_param+=cur_param[k]+"|";
    }
    if(new_param) new_param = new_param.substr(0, new_param.length-1);
    selected_param = new_param; //PARAM
  }

  //////// CODE ////////    
	if(scodestr){
		var code_items = scodestr.split(";");
		var code_token, code_index, code_value;
		for(var k = 0; k < code_items.length; k++){
			code_token = code_items[k].split("x");
			code_index = parseInt(code_token[0]);
			code_value = code_token[1];
			if(code_value.indexOf("?")>=0){
				if(code_value.indexOf("code(")>=0 || code_value.indexOf("value(")>=0){
					cur_token[code_index] = setCodeValue2(code_index,code_value, cur_token, selected_value);
				} else {
					cur_token[code_index] = setCodeValue(code_value, cur_token);
				}
			} else {
				cur_token[code_index] = code_value;
			}
		}
		var new_value = "";
		for(var k = 0; k < cur_token.length; k++){
			new_value+=cur_token[k]+"-";
		}
		new_value = new_value.substr(0, new_value.length-1);
		selected_code = new_value; //CODESTR
	}

  ///////// VALUE ////////
	var token, value_index;
	var tmp_value, token_value;
	var skey, svalue, sindex;
	var tmp_key;
	if(sitemstr){
		if(sitemstr.indexOf("if(")>=0){
		   token = sitemstr.split("?");
		   tmp_value = token[1];
		   token_value = tmp_value.split(":");
		   tmp_key = token[0];
		   tmp_key = tmp_key.substr(3);
		   tmp_key = tmp_key.substr(0,tmp_key.length-1);
		   token = tmp_key.split("=");
		   skey = token[0];
		   svalue = token[1];
		   if(skey == "code"){
			   token = svalue.split("x");
			   sindex = parseInt(token[0]);
			   svalue = token[1];
			   if(cur_token[sindex] == svalue){
				   token = token_value[0].split("x");
				   value_index = token[0];
			   } else {
				   token = token_value[1].split("x");
				   value_index = token[0];
			   }
			   selected_value[value_index] = token[1];
		   }
        } else if(sitemstr.indexOf("func(")>=0){
            token = sitemstr.split("x");
            value_index = token[0];
            tmp_key = token[1].replace("func(","");
            tmp_key = tmp_key.substr(0,tmp_key.length-1);
            
            var c0 = 0;
            var c1 = 0;
            var c2 = 0;
            var c3 = 0;
            var c4 = 0;
            
            for(var i = 0; i < cur_param.length; i++){
                if(i == 0) c0 = parseInt(cur_param[0],10);
                if(i == 1) c1 = parseInt(cur_param[1],10);
                if(i == 2) c2 = parseInt(cur_param[2],10);
                if(i == 3) c3 = parseInt(cur_param[3],10);
                if(i == 4) c4 = parseInt(cur_param[4],10);
            }
            
            var func_str = tdx.Object.obj.getData("function");            
            func_str = setParamValue(func_str,"");
            if(func_str){
                try{
                    var result_value = eval(func_str);
                    selected_value[value_index] = (result_value < 10)?"0"+result_value:result_value;
                } catch(err){
                    //
                }                
            }
		} else {
			token = sitemstr.split(";");
			for(var i = 0; i < token.length; i++){
				if(!token[i]) continue;
				var tmp_token = token[i].split("x");
				value_index = parseInt(tmp_token[0]);
				if(tmp_token[1].indexOf("?")>=0){
					var s_value;
					if(tmp_token[1].indexOf("code(")>=0 || tmp_token[1].indexOf("value(")>=0){
						//s_value = setParamValueValue2(itemindex, tmp_token[1], cur_token, selected_value);
						s_value = setParamValueValue2(value_index, tmp_token[1], cur_token, selected_value);
					} else {
						s_value = setParamValueValue(tmp_token[1], selected_code);
					}
					selected_value[value_index] = s_value;
				} else {
					selected_value[value_index] = tmp_token[1];
				}
			}
		}
	}

  smetadata = "";
	for(var i = 0; i < selected_value.length; i++){
		smetadata+=selected_value[i]+"-";
	}
	if(smetadata) smetadata = smetadata.substr(0,smetadata.length-1);
  if(tdx.Object.obj.id.indexOf("kmp")>=0) selected_code = selected_param;
  smetadata = smetadata+":"+selected_code+":"+selected_param;
  
  var furn_id = tdx.Object.obj.id;
  var sgrpdata = tdx.GetGrpData();
  if(typeof(sgrpdata) == "undefined") sgrpdata = "";
  if(sgrpdata){
    var objJSON = JSON.parse(sgrpdata);
    var tmp_meta;
    for(var i = 0; i < objJSON.length; i++){
      if(objJSON[i].name == tdx.Object.obj.id || objJSON[i].name.indexOf(tdx.Object.obj.id)>=0){
        if(objJSON[i].selected){
          objJSON[i].meta = smetadata;
        } else {
          tmp_meta = objJSON[i].meta;
          tmp_meta = UpdateItemValue2(tmp_meta, sitemstr, scodestr, sparam);
          objJSON[i].meta = tmp_meta;
        }
      }            
    }
    sgrpdata = JSON.stringify(objJSON);
    tdx.SetGrpData(sgrpdata);
  }
  
  // emit event
  var param = {
    event:'OnApplyVariation',
    args:''
  };
  //my.namespace.pubOn3dxEvent(JSON.stringify(param));

}


function UpdateItemValue2(smetadata, sitemstr, scodestr, sparam){
  var tdx = document.getElementById("Control1");
	var stoken = smetadata.split(":");
	var selected_value = stoken[0].split("-"); //VALUE
	var selected_code = stoken[1]; //CODE
  var selected_param = stoken[2]; //PARAM
  
	var cur_value = selected_code; //CODESTR
	var cur_token = cur_value.split("-"); //CODE ARR
  var cur_param = selected_param.split("|");
    
  //////// PARAM ////////
  if(sparam){        
    var param_items = sparam.split(";");
    var param_token, param_index, param_value;
    for(var k = 0; k < param_items.length; k++){
        param_token = param_items[k].split("x");
        param_index = parseInt(param_token[0]);
        param_value = param_token[1];
        cur_param[param_index] = param_value;
    }
    var new_param = "";
    for(var k = 0; k < cur_param.length; k++){
        new_param+=cur_param[k]+"|";
    }
    if(new_param) new_param = new_param.substr(0, new_param.length-1);
    selected_param = new_param; //PARAM
  }
    
	//////// CODE ////////    
	if(scodestr){
		var code_items = scodestr.split(";");
		var code_token, code_index, code_value;
		for(var k = 0; k < code_items.length; k++){
			code_token = code_items[k].split("x");
			code_index = parseInt(code_token[0]);
			code_value = code_token[1];
			if(code_value.indexOf("?")>=0){
				if(code_value.indexOf("code(")>=0 || code_value.indexOf("value(")>=0){
					cur_token[code_index] = setCodeValue2(code_index,code_value, cur_token, selected_value);
				} else {
					cur_token[code_index] = setCodeValue(code_value, cur_token);
				}
			} else {
				cur_token[code_index] = code_value;
			}
		}
		var new_value = "";
		for(var k = 0; k < cur_token.length; k++){
			new_value+=cur_token[k]+"-";
		}
		new_value = new_value.substr(0, new_value.length-1);
		selected_code = new_value; //CODESTR
	}

	///////// VALUE ////////
	var token, value_index;
	var tmp_value, token_value;
	var skey, svalue, sindex;
	var tmp_key;
	if(sitemstr){
		if(sitemstr.indexOf("if(")>=0){
		   token = sitemstr.split("?");
		   tmp_value = token[1];
		   token_value = tmp_value.split(":");
		   tmp_key = token[0];
		   tmp_key = tmp_key.substr(3);
		   tmp_key = tmp_key.substr(0,tmp_key.length-1);
		   token = tmp_key.split("=");
		   skey = token[0];
		   svalue = token[1];
		   if(skey == "code"){
			   token = svalue.split("x");
			   sindex = parseInt(token[0]);
			   svalue = token[1];
			   if(cur_token[sindex] == svalue){
				   token = token_value[0].split("x");
				   value_index = token[0];
			   } else {
				   token = token_value[1].split("x");
				   value_index = token[0];
			   }
			   selected_value[value_index] = token[1];
		   }
        } else if(sitemstr.indexOf("func(")>=0){
            token = sitemstr.split("x");
            value_index = token[0];
            tmp_key = token[1].replace("func(","");
            tmp_key = tmp_key.substr(0,tmp_key.length-1);
            
            var c0 = 0;
            var c1 = 0;
            var c2 = 0;
            var c3 = 0;
            var c4 = 0;
            
            for(var i = 0; i < cur_param.length; i++){
                if(i == 0) c0 = parseInt(cur_param[0],10);
                if(i == 1) c1 = parseInt(cur_param[1],10);
                if(i == 2) c2 = parseInt(cur_param[2],10);
                if(i == 3) c3 = parseInt(cur_param[3],10);
                if(i == 4) c4 = parseInt(cur_param[4],10);
            }
            
            var func_str = tdx.Object.obj.getData("function");            
            func_str = setParamValue(func_str,"");
            if(func_str){
                try{
                    var result_value = eval(func_str);
                    selected_value[value_index] = (result_value < 10)?"0"+result_value:result_value;
                } catch(err){
                    //
                }                
            }
            
		} else {
			token = sitemstr.split(";");
			for(var i = 0; i < token.length; i++){
				if(!token[i]) continue;
				var tmp_token = token[i].split("x");
				value_index = parseInt(tmp_token[0]);
				if(tmp_token[1].indexOf("?")>=0){
					var s_value;
					if(tmp_token[1].indexOf("code(")>=0 || tmp_token[1].indexOf("value(")>=0){
						//s_value = setParamValueValue2(itemindex, tmp_token[1], cur_token, selected_value);
						s_value = setParamValueValue2(value_index, tmp_token[1], cur_token, selected_value);
					} else {
						s_value = setParamValueValue(tmp_token[1], selected_code);
					}
					selected_value[value_index] = s_value;
				} else {
					selected_value[value_index] = tmp_token[1];
				}
			}
		}
	}
  
	smetadata = "";
	for(var i = 0; i < selected_value.length; i++){
		smetadata+=selected_value[i]+"-";
	}
	if(smetadata) smetadata = smetadata.substr(0,smetadata.length-1);
  if(tdx.Object.obj.id.indexOf("kmp")>=0) selected_code = selected_param;
	smetadata = smetadata+":"+selected_code+":"+selected_param;
  
  return smetadata;
}

function setParamValueValue(str0, str1){
	var arr = str1.split("|");
	var token = str0.split("?");
	var s0 = token[0];
	var s1 = token[1];
	token = s0.split("=");
	var index0 = token[0].replace("(","");
	var index1 = token[1].replace(")","");
	index0 = parseInt(index0);
	index1 = parseInt(index1);
	var value0 = arr[index0];
	var value1 = arr[index1];
	token = s1.split(":");
	var newvalue0 = token[0];
	var newvalue1 = token[1];
	if(value0 == value1){
		return newvalue0;
	} else {
		return newvalue1;
	}
}

function setParamValueValue2(index, str, scode, svalue){
	var token = str.split("?");
	var strcondition = token[0];
	strcondition = strcondition.substr(1,strcondition.length-2);
	var strvalue = token[1];
	var sindex, svalve;
	var sflag = false;
	if(strcondition.indexOf("value(")>=0){
		strcondition = strcondition.replace("value(","");
		token = strcondition.split("=");
		sindex = parseInt(token[0].replace(")",""));
		svalve = token[1];
		if(svalue[sindex] == svalve) sflag = true;
	} else if(strcondition.indexOf("code(")>=0){
		strcondition = strcondition.replace("code(","");
		token = strcondition.split("=");
		sindex = parseInt(token[0].replace(")",""));
		svalve = token[1];
		if(scode[sindex] == svalve) sflag = true;
	}
	token = strvalue.split(":");
	var value1 = token[0];
	var value2 = token[1];
	if(sflag){
		return value1;
	} else {
		if(value2.indexOf("NC")>=0){
			return svalue[index];
		} else {
			return value2;
		}
	}
}

function setCodeValue(str, arr){
	var token = str.split("?");
	var s0 = token[0];
	var s1 = token[1];
	token = s0.split("=");
	var index0 = token[0].replace("(","");
	var index1 = token[1].replace(")","");
	index0 = parseInt(index0);
	index1 = parseInt(index1);
	var value0 = arr[index0];
	var value1 = arr[index1];
	token = s1.split(":");
	var newvalue0 = token[0];
	var newvalue1 = token[1];
	if(value0 == value1){
		return newvalue0;
	} else {
		return newvalue1;
	}
}

function setCodeValue2(index, str, scode, svalue){
	var token = str.split("?");
	var strcondition = token[0];
	strcondition = strcondition.substr(1,strcondition.length-2);
	var strvalue = token[1];
	var sindex, svalve;
	var sflag = false;
	if(strcondition.indexOf("value(")>=0){
		strcondition = strcondition.replace("value(","");
		token = strcondition.split("=");
		sindex = parseInt(token[0].replace(")",""));
		svalve = token[1];
		if(svalue[sindex] == svalve) sflag = true;
	} else if(strcondition.indexOf("code(")>=0){
		strcondition = strcondition.replace("code(","");
		token = strcondition.split("=");
		sindex = parseInt(token[0].replace(")",""));
		svalve = token[1];
		if(scode[sindex] == svalve) sflag = true;
	}
	token = strvalue.split(":");
	var value1 = token[0];
	var value2 = token[1];
	if(sflag){
		return value1;
	} else {
		if(value2.indexOf("NC")>=0){
			return scode[index];
		} else {
			return value2;
		}
	}
}

///////////// end new ////////////

var timadd;
function loadRoom(room){
  var tdx = document.getElementById("Control1");
  var filename = gethostname()+'assets/3dx/'+room+'.fls';
  tdx.Reload(filename);
}

function setAddFurniture(item) {
  
  // TODO: loader gif
  /*
  var preloader_html = '<div class="preloader-wrapper small active">';
  preloader_html += '<div class="spinner-layer spinner-green-only">';
  preloader_html += '<div class="circle-clipper left">';
  preloader_html += '<div class="circle"></div>';
  preloader_html += '</div><div class="gap-patch">';
  preloader_html += '<div class="circle"></div>';
  preloader_html += '</div><div class="circle-clipper right">';
  preloader_html += '<div class="circle"></div>';
  preloader_html += '</div>';
  preloader_html += '</div>';
  preloader_html += '</div>';

  var spinner_container_html = '<div class="div-spinner-container">';
  spinner_container_html += preloader_html;
  spinner_container_html += '</div>';

  var divloader = document.createElement('DIV');
  divloader.setAttribute('id','div-loader');
  divloader.className = 'app-div-loader';
  divloader.innerHTML = spinner_container_html;

  document.body.appendChild(divloader);
  */
 
  var tdx = document.getElementById("Control1");
  var furn = Scene.getFurnitureById(item);
  if(typeof furn === 'undefined') {
    Scene.getFurnitureData(item, setAddFurniture);
    return;
  }
  tdx.Object.Set(furn);
  
  let sitem = gDocBase + 'tdx/';
  sitem += item.replace("furn_","");
  //item += '/furn_' + param
  sitem += '/' + item
  sitem += '.3dx';

  addFurniture(sitem);

}

function addFurniture(item){
  
  clearInterval(timadd);

  var tdx = document.getElementById("Control1");
  tdx.EnableControl(0);

  var px, pz;
  if(tdx.ViewMode == 1){
    var xyz = tdx.GetCameraPosRevised();
    var token = xyz.split(",");
    px = parseFloat(token[0]);
    pz = parseFloat(token[2]);
  } else {
    var p = getRoomCenter();
		px = p.x;
		pz = p.y;
  }

  var filename = item;
  var sparam = {
    pos:[px,0,pz],
    rot:[0,0,0],
    scl:[1,1,1],
    siz:[-1,-1,-1],
    towall:-1,
    makegroup:true,
    metadata:""
  };
  var json_param = JSON.stringify(sparam);

  tdx.SetMoveAxis(1,1,1);
  tdx.BeginUpdate();
  tdx.AddObjectWithParameter(filename, json_param);

  timadd = setInterval(function(){
    var tdx = document.getElementById("Control1");
    var flag = tdx.IsBusy();
    if(!flag){
      clearInterval(timadd);
      
      tdx.SetObjectCollision(false);
      tdx.EndUpdate();
      tdx.EnableControl(1);
      
      var variations = tdx.Object.obj.getVariations(); 
      //console.log("variation length:", variations.length);

      var varitems = {};
      if(variations.length > 0) 
      {
        var varkey = variations[0].getAttribute("id");
        var varname = variations[0].getAttribute("name");
        
        //console.log("VAR", varkey, varname);
        varitems = {
          id: varkey,
          name: varname,
          items: []
        }

        var mat = tdx.Object.obj.getMaterial(varkey);
        var items = mat.getElementsByTagName("item");
        
        for(var i = 0; i < items.length; i++) 
        {
          var simg = items[i].firstChild.nodeValue;
          var salt = items[i].getAttribute("alt");
          var stype = items[i].getAttribute("type");
          var smap = items[i].getAttribute("map");

          var svalue = items[i].getAttribute("value");
          var scode = items[i].getAttribute("code");
          var sparam = items[i].getAttribute("param");

          //console.log("-", simg, smap);
          varitems.items.push({
            simg,
            salt,
            stype,
            smap,
            svalue,
            scode,
            sparam
          })
        }

      }

      var sobj = {
        id: tdx.Object.obj.id,
        name: tdx.Object.obj.getSummary('name'),
        price: 123456,
        variations: varitems,
      }
      
      var event = new CustomEvent(
        "tdxEvent", 
        {
            detail: {
                name: `TDXONADDITEM`,
                param: sobj
            },
            bubbles: true,
            cancelable: true
        }
      );
      window.dispatchEvent(event);
    }
  },100);

}

function tdx_InitCallbacks(){
  //console.log('INITCALLBACKS');

  TdxPlayer.OnLoad = TdxOnLoad;
  TdxPlayer.OnInitialized = TdxOnInitialized;
  TdxPlayer.OnMadoriCreated = TdxOnMadoriCreated;
  TdxPlayer.OnClick = TdxOnClick;
  TdxPlayer.OnEventButtonClicked = TdxOnButtonClick;
  TdxPlayer.OnDeselect = TdxOnDeselect;
  TdxPlayer.OnThumbnailMade = TdxOnThumbnailMade;
  TdxPlayer.OnKeyDown = TdxOnKeyDown;
  TdxPlayer.OnViewModeChanged = TdxOnViewModeChanged;
  TdxPlayer.OnReqTransModeChange = TdxOnTransChange;
  TdxPlayer.OnGroupingModeEnd = TdxOnGroupingModeEnd;
  TdxPlayer.OnOPInURMode = TdxOnOPInURMode;
  TdxPlayer.OnCaptureButtonClicked = TdxOnCaptureClicked;

}


function tdx_InitControl1() {
  console.log('INITCONTROL1');

  var tdx = document.getElementById("Control1");

    // check if already initialized
	if (tdx.hasOwnProperty("MessageBox"))
		return;

	tdx.MessageBox = function(title,msg,btn) {
		if (btn==4) {
			return confirm(msg);
		}
		else {
			alert(msg);
		}
	}
	tdx.CreateMadori = TdxPlayer.CreateMadori;
	tdx.SetObjectTexture = TdxPlayer.SetObjectTexture;
	tdx.GetObjectMap = TdxPlayer.GetObjectMap;
	tdx.SetObjectMaterial = function(name,index,val) {
		TdxPlayer.SetObjectMaterial(name,index,parseInt(val));
	}
  tdx.GetVersion = TdxPlayer.GetVersion;
	tdx.GetWalls = TdxPlayer.GetWalls;
	tdx.GetObjectTexture = TdxPlayer.GetObjectTexture;
	tdx.MakeThumbnail = TdxPlayer.MakeThumbnail;
	tdx.SetAttributeMap = TdxPlayer.SetAttributeMap;
  tdx.SetAttributeMaterial = function(name,index,val) {
		TdxPlayer.SetAttributeMaterial(name,index,parseInt(val));
	}

  tdx.ShowOverviewAxis = TdxPlayer.ShowOverviewAxis;
  tdx.HDCapture = TdxPlayer.HDCapture;
  tdx.GetAttributeMap = TdxPlayer.GetAttributeMap;
  tdx.GetObjectSize = TdxPlayer.GetObjectSize;
  tdx.SetObjectSize = TdxPlayer.SetObjectSize;
	tdx.GetChildObjectScale = TdxPlayer.GetChildObjectScale;
	tdx.SetChildObjectScale = TdxPlayer.SetChildObjectScale;
	tdx.GetObjectScale = TdxPlayer.GetObjectScale;
	tdx.SetObjectScale = TdxPlayer.SetObjectScale;
	tdx.AddObjectWithParameter = TdxPlayer.AddObjectWithParameter;
	tdx.SetMap = TdxPlayer.SetMap;
	tdx.EnableControl = TdxPlayer.EnableControl;
	tdx.GetAttributeMetaData = TdxPlayer.GetAttributeMetaData;
	tdx.ExchangeMetaData = TdxPlayer.ExchangeMetaData;
	tdx.SetMyChunk = function(name,contents) {
			var nl = Module.lengthBytesUTF8(name)+1;
			var cl = Module.lengthBytesUTF8(contents)+1;
			var n = Module._malloc(nl);
			var c = Module._malloc(cl);
			Module.stringToUTF8(name,n,nl);
			Module.stringToUTF8(contents,c,cl);
			TdxPlayer.SetMyChunk(n,c);
			Module._free(n);
			Module._free(c);
		}
	tdx.SetFurnInfo = TdxPlayer.SetFurnInfo;
	tdx.SetBkColor = TdxPlayer.SetBkColor;
	tdx.SetSelObj = TdxPlayer.SetSelObj;
	tdx.Attach3DXToWall = TdxPlayer.Attach3DXToWall;
	tdx.NotifyMouseWheel = TdxPlayer.NotifyMouseWheel;
	tdx.SetWallParameter = TdxPlayer.SetWallParameter;
	tdx.CopySelectedObject = TdxPlayer.CopySelectedObject;
	tdx.SetMetaData = TdxPlayer.SetMetaData;
	tdx.RemapObjectTexture = TdxPlayer.RemapObjectTexture;
	tdx.SetTopView = TdxPlayer.SetTopView;
	tdx.GetFLSInfo2 = TdxPlayer.GetFLSInfo2;
	tdx.SetAttributeMap2 = TdxPlayer.SetAttributeMap2;
	tdx.SetObjectMap = TdxPlayer.SetObjectMap;
	tdx.GoForward = TdxPlayer.GoForward;
	tdx.DeselectObject = TdxPlayer.DeselectObject;
	tdx.MapJSON = TdxPlayer.MapJSON;
	tdx.IsBusy = TdxPlayer.IsBusy;
	tdx.Redraw = TdxPlayer.Redraw;
	tdx.GetWallParameter = TdxPlayer.GetWallParameter;
	tdx.EndUpdate = TdxPlayer.EndUpdate;
	tdx.SetObjectMap2 = TdxPlayer.SetObjectMap2;
	tdx.DeleteObject = TdxPlayer.DeleteObject;
	tdx.GetThumbnail = TdxPlayer.GetThumbnail;
	tdx.GetWallExtent = TdxPlayer.GetWallExtent;
	tdx.SetRotationAxis = TdxPlayer.SetRotationAxis;
	tdx.DeleteObjectByNo = TdxPlayer.DeleteObjectByNo;
	tdx.SelectAttribute = TdxPlayer.SelectAttribute;
	tdx.SetObjectCollision = TdxPlayer.SetObjectCollision;
	tdx.GetObjectMaterial = TdxPlayer.GetObjectMaterial;
	tdx.SetAttributeMetaData = TdxPlayer.SetAttributeMetaData;
	tdx.GetObjectCollision = TdxPlayer.GetObjectCollision;
  tdx.GetObjectRotation = TdxPlayer.GetObjectRotation;
	tdx.GetAttributeTexture = TdxPlayer.GetAttributeTexture;
  tdx.GetObjectLock = TdxPlayer.GetObjectLock;
	tdx.SetObjectLock = TdxPlayer.SetObjectLock;
  tdx.GetGrpData = TdxPlayer.GetGrpData;
	tdx.SetGrpData = TdxPlayer.SetGrpData;
  tdx.GetObjectColor = TdxPlayer.GetObjectColor;
	tdx.SetObjectColor = TdxPlayer.SetObjectColor;
	tdx.GetSelAttr = TdxPlayer.GetSelAttr;
	tdx.GetSceneInfo = TdxPlayer.GetSceneInfo;
  tdx.SetSceneInfo = TdxPlayer.SetSceneInfo;
	tdx.PlayAnimationOfSelected = TdxPlayer.PlayAnimationOfSelected;
	tdx.GetArea = TdxPlayer.GetArea;
	tdx.ResetMap = TdxPlayer.ResetMap;
	tdx.GetMyChunk = TdxPlayer.GetMyChunk;
	tdx.AddObjectAt = TdxPlayer.AddObjectAt;
	tdx.GetObjectPosition = TdxPlayer.GetObjectPosition;
  tdx.SetObjectPosition = TdxPlayer.SetObjectPosition;
  tdx.TurnObject = TdxPlayer.TurnObject;
  tdx.SetCameraRotation = TdxPlayer.SetCameraRotation;
  
  tdx.SetCameraPosRevised = TdxPlayer.SetCameraPosRevised;

	tdx.SetMoveAxis = TdxPlayer.SetMoveAxis;
	tdx.BlinkAttribute = TdxPlayer.BlinkAttribute;
	tdx.SaveFLSLocal = TdxPlayer.SaveFLSLocal;
	tdx.TranslationMode = TdxPlayer.TranslationMode;
	tdx.SetCameraMode = TdxPlayer.SetCameraMode;
	tdx.ResetFloor = TdxPlayer.ResetFloor;
	tdx.GetSelObj = TdxPlayer.GetSelObj;
	tdx.CameraRotationZ = TdxPlayer.CameraRotationZ;
	tdx.CameraRotationX = TdxPlayer.CameraRotationX;
	tdx.CameraRotationY = TdxPlayer.CameraRotationY;
	tdx.GetMetaData = TdxPlayer.GetMetaData;
	tdx.AddHeader = TdxPlayer.AddHeader;
	tdx.Reload = TdxPlayer.Reload;
	tdx.PreSetMetaData = TdxPlayer.PreSetMetaData;
	tdx.BeginUpdate = TdxPlayer.BeginUpdate;
	tdx.GetCameraPosRevised = TdxPlayer.GetCameraPosRevised;
	tdx.UnmapJSON = TdxPlayer.UnmapJSON;
  tdx.GetProperty = TdxPlayer.GetProperty;
  tdx.SetProperty = TdxPlayer.SetProperty;
  tdx.MoveObject = TdxPlayer.MoveObject;
  tdx.Undo = TdxPlayer.Undo;
  tdx.Redo = TdxPlayer.Redo;
  tdx.ApplyVariation = TdxPlayer.ApplyVariation;
  tdx.SetBackDrop = TdxPlayer.SetBackDrop;
  tdx.SetEndpoints = TdxPlayer.SetEndpoints;

	Object.defineProperty(tdx, "RenderingHint", {
		get: function() { return parseInt(TdxPlayer.GetProperty("RenderingHint")); },
		set: function(newVal) { TdxPlayer.SetProperty("RenderingHint", String(newVal)); }
	});
	Object.defineProperty(tdx, "WalkThroughMode", {
		get: function() { return parseInt(TdxPlayer.GetProperty("WalkThroughMode")); },
		set: function(newVal) { TdxPlayer.SetProperty("WalkThroughMode", String(newVal)); }
	});
    Object.defineProperty(tdx, "MoveAboveFloor", {
		get: function() { return TdxPlayer.GetProperty("MoveAboveFloor") == "1"; },
		set: function(newVal) { TdxPlayer.SetProperty("MoveAboveFloor", String(newVal)); }
	});
	Object.defineProperty(tdx, "PickEnable", {
		get: function() { return TdxPlayer.GetProperty("PickEnable") == "1"; },
		set: function(newVal) { TdxPlayer.SetProperty("PickEnable", String(newVal)); }
	});
	Object.defineProperty(tdx, "CameraCollisionEnable", {
		get: function() { return TdxPlayer.GetProperty("CameraCollisionEnable") == "1"; },
		set: function(newVal) { TdxPlayer.SetProperty("CameraCollisionEnable", String(newVal)); }
	});
	Object.defineProperty(tdx, "ExtraUI", {
		get: function() { return parseInt(TdxPlayer.GetProperty("ExtraUI")); },
		set: function(newVal) { TdxPlayer.SetProperty("ExtraUI", String(newVal)); }
	});
	Object.defineProperty(tdx, "FLSVersion", {
		 get: function() { return parseInt(TdxPlayer.GetProperty("FLSVersion")); },
		set: function(newVal) { TdxPlayer.SetProperty("FLSVersion", String(newVal)); }
	});
    Object.defineProperty(tdx, "SaveCamera", {
		get: function() { return TdxPlayer.GetProperty("SaveCamera") == "1"; },
		set: function(newVal) { TdxPlayer.SetProperty("SaveCamera", String(newVal)); }
	});
    Object.defineProperty(tdx, "GroundGrid", {
		get: function() { return TdxPlayer.GetProperty("GroundGrid") == "1"; },
		set: function(newVal) { TdxPlayer.SetProperty("GroundGrid", String(newVal)); }
	});
    Object.defineProperty(tdx, "UseJoinGesture", {
		get: function() { return TdxPlayer.GetProperty("UseJoinGesture") == "1"; },
		set: function(newVal) { TdxPlayer.SetProperty("UseJoinGesture", String(newVal)); }
	});
    Object.defineProperty(tdx, "GroupingMode", {
		get: function() { return TdxPlayer.GetProperty("GroupingMode") == "1"; },
		set: function(newVal) { TdxPlayer.SetProperty("GroupingMode", String(newVal)); }
	});

  tdx_InitProperties();
}

function tdx_InitProperties() {
  console.log('INITPROPERTIES');

  var tdx = document.getElementById("Control1");
	tdx.SetProperty("PutOnFloor", String(true));
  tdx.SetProperty("TatamiSize", String(gDefaultTatamiSize));
	tdx.SetProperty("UsePlayedAnim", String(true));
	tdx.RenderingHint = 2579; //gTDXRenderingHint;
	tdx.WalkThroughMode= gTDXWalkthruMode;
	tdx.PickEnable = 0;
  tdx.GroundGrid = 1;
  tdx.MoveAboveFloor = 1;
	tdx.FLSVersion=2;
	tdx.CameraCollisionEnable = 0;
	tdx.TranslationMode(4);
	tdx.ExtraUI = 175; //175; //63; //31;
  tdx.SaveCamera = 1;

  var gTDXHiddenIcons = "hidewall";
  gTDXHiddenIcons += ",hidefloor";
  gTDXHiddenIcons += ",showbackdrop";
  gTDXHiddenIcons += ",resetcamera";
  gTDXHiddenIcons += ",capture";
  gTDXHiddenIcons += ",print";
  gTDXHiddenIcons += ",grid";
  gTDXHiddenIcons += ",measure";
  gTDXHiddenIcons += ",resetmeasure";
  gTDXHiddenIcons += ",fullscreen";
  
  tdx.SetProperty("HideWallMode", String(true));
  tdx.SetProperty("OverviewWallOpaque", String(true));
  tdx.SetProperty("HideFloorMode",String(true));
  tdx.SetProperty("HiddenIcons", String(gTDXHiddenIcons));
  
  tdx.SetProperty('SupportedViewMode',String(4)); //7
  tdx.SetProperty('ShowCtrlThresh',String(-1));

  /*
  gTDXWallAlpha = 0.4; //0.4;
  gTDXFloorAlpha = 0.2; //0.2; //0.2;
  */
  gTDXWallAlpha = 1.0;
  gTDXFloorAlpha = 1.0;

  if(!gEditMode) tdx.SetProperty("WallAlpha", String(gTDXWallAlpha));
  if(!gEditMode) tdx.SetProperty("FloorAlpha", String(gTDXFloorAlpha));
  
  tdx.SetProperty("StViewWlkScl", String(-1));
  tdx.SetProperty("StViewRotScl", String(-2));
  tdx.SetProperty("InnerViewMode", String(8));
  //tdx.StViewWlkScl = -1;
  //tdx.StViewRotScl = -2;

  if(typeof(tdx.ViewMode) === "undefined"){
    tdx.ViewMode = 0;
  }

  if(typeof(tdx.BackDrop) === "undefined"){
    tdx.BackDrop = "";
  }

  if(typeof(tdx.Object) === "undefined"){        
    tdx.Object = new function(){
      this.obj = null;
      this.Selected = "";
      this.SelectedType = "";
      this.SelectedObject = "";
      this.Parent = -1;
      this.Set = function(){
        this.obj = arguments[0];
        this.Selected = this.obj.id;
        this.SelectedType = this.obj.getFurnitureType();
        this.SelectedObject = this.obj.id;
        var furnset = this.obj.getSummary("furnset");
        furnset = setParamValue(furnset,"no");
        if(furnset == "yes"){
          if(arguments.length > 1) {
            this.SelectedObject = arguments[1];
          }
        }
      };
      this.Clear = function(){
        this.obj = null;
        this.Selected = "";
        this.SelectedType = "";
      };
      return this;
    };
  }

  // let's try to load something
  //tdx.Reload("http://localhost:3000/room000.fls");
  //tdx.Reload("http://localhost:3000/myroom.fls");
  
  // prepare event and send
  var event = new CustomEvent(
    "tdxEvent", 
    {
        detail: {
            name: `TDXONINITIALIZED`,
            param: null
        },
        bubbles: true,
        cancelable: true
    }
  );
  window.dispatchEvent(event);

}

function sendMessage(data) {
  console.log("received message");

  var tdx = document.getElementById("Control1");
  switch(data.action) {
    case "Reload":
      tdx.Reload(data.param);
      break;
    case "Add":
      addFurniture(data.param)
      break;
    case "Variation":
      //selectMatFurniture(data.param)
      //const args = data.param.split(",");
      setSelectMatFurniture(data.param)
      break;
    default:
  }
}

function setApplyVariation(item) {
  var varkey = "";
  var sitem = item.param.simg;
  var stype = parseInt(item.param.stype);
  var smap = item.param.smap;
  var stdt = "";
  var svalue = item.param.svalue;
  var scode = item.param.scode;
  var sparam = item.param.sparam;

  selectMatFurniture(varkey, sitem, stype, smap, stdt, svalue, scode, sparam);

}

function getMessage(data) {
  //console.log("received command");
  //console.log(gDocBase);

  var tdx = document.getElementById("Control1");
  switch(data.action) {
    case "LOAD-ROOM":
      tdx.Reload(gDocBase + 'tdx/' + data.param + '.fls');
      break;
    case "ADD-ITEM":
      setAddFurniture("furn_" + data.param);
      break;
    case "APPLY-VARIATION":
      setApplyVariation(data.param);
      break;
    case "APPLY-FLOOR":
      setApplyFloor(data.param);
      break;
    case "APPLY-WALL":
      setApplyWall(data.param);
      break;
    default:
      //
  }
}

function setApplyWall(data){
  var tdx = document.getElementById("Control1");
  var scene = JSON.parse(tdx.MapJSON());
  var madori = scene.tdxs[0];
  var walls = madori.walls2;

  var stexture = data.id + ".jpg";
  var stdt = data.tdt;

  var variation = [];
  for(var n = 0; n < walls.length; n++) {
    var attrib = walls[n].name;
    var arr = [];
    /*arr[0] = attrib+"_R";
    arr[1] = attrib+"_F";
    arr[2] = attrib+"_L";
    arr[3] = attrib+"_C";
    arr[4] = attrib+"_B";
    arr[5] = attrib+"_T";*/
    arr[0] = attrib+"_R";

    for(var i = 0; i < arr.length; i++){
      var variation0 = {
          "obj":-1,
          "atr":arr[i],
          "map":[
              {
                  "ind": 0,
                  "img": stexture,
                  "tdt": stdt
              },
              {
                  "ind": 10,
                  "img": "nospec.jpg",
                  "tdt": "madori.3dt"
              }
          ],
          "mat":[
              {
                  "ind": 4,
                  "val": 0
              }
          ]
      };
      var baseboard0 = {
        "obj":-1,
        "atr":arr[i]+"_b",
        "map":[
            {
                "ind": 0,
                "img": stexture,
                "tdt": stdt
            },
            {
                "ind": 10,
                "img": "nospec.jpg",
                "tdt": "madori.3dt"
            }
        ],
        "mat":[
            {
                "ind": 4,
                "val": 0
            }
        ]
      };
      variation.push(variation0);
      variation.push(baseboard0);
    }
  }
  
  var str_variation = JSON.stringify(variation);
  
  //console.log(str_variation);

  tdx.BeginUpdate();
  tdx.ApplyVariation(str_variation);
  tdx.EndUpdate();
  
}

function setApplyFloor(data) {
  //console.dir(data);

  var stexture = data.id + ".jpg";
  var stdt = data.tdt;

  var tdx = document.getElementById("Control1");
  var variation = [
    {
        "obj": -1,
        "atr": "floor00",
        "map":[
            {
                "ind": 0,
                "img": stexture,
                "tdt": stdt
            }
        ],
        "mat":[
            {
                "ind":6,
                "val":3
            },
            {
                "ind":7,
                "val":5
            }
        ]
    }
  ];

  console.dir(variation)

  var str_variation = JSON.stringify(variation);
  tdx.BeginUpdate();
  tdx.ApplyVariation(str_variation);
  tdx.EndUpdate();
  
}


/*
event handlers
*/
function TdxOnInitialized(){
  //console.log("ONINITIALIZED");

  tdx_InitControl1();

  //my.namespace.publicFunc();

}

function TdxOnLoad(){
  //console.log("TDXONLOAD");
  
  var tdx = document.getElementById("Control1");
  if(tdx.style.visibility !== "visible") {
    tdx.style.visibility = "visible";
    resizeplayer();
  }

  if(gReadOnly) tdx.SetProperty('readonlymode',String(2));

  //tdx.SetProperty('showctrlthresh',String(gThreshWidth));
  //tdx.SetProperty('supportedviewmode',String(gSupportedView));
  //tdx.SetProperty('hidewallmode',String(gHideWallMode));

  // set background color
  tdx.SetBkColor(1,0x00ffffff);
  tdx.SetBkColor(0,0x00c0c0c4);

  // set initial view
  //tdx.SetCameraMode(2);
  //tdx.SetTopView(1);
  //tdx.TranslationMode(1);
  //tdx.ViewMode = 1;
  var innerview = tdx.GetProperty("InnerViewMode");
  if(typeof(innerview) === "undefined"){
    innerview = 0;
  }
  if(innerview == 0){
    tdx.ViewMode = 1;
  } else {
    tdx.ViewMode = 0;
  }

  if(tdx.BackDrop){
    tdx.SetBackDrop(tdx.BackDrop,0,0,1,1,0);
    tdx.BackDrop = "";
  }

  /*
  clearInterval(timcheck);
  timcheck = setInterval(function(){
    var tdx = document.getElementById("Control1");
    var flag = tdx.IsBusy();
    if(flag){
      tdx.EnableControl(0);
    } else {
      clearInterval(timcheck);
      tdx.EnableControl(1);

      var param = {
        event:'OnLoad',
        args:''
      };
      my.namespace.pubOn3dxEvent(JSON.stringify(param));
    }
  },100);
  */
  var param = {
    event:'OnLoad',
    args:''
  };
  //my.namespace.pubOn3dxEvent(JSON.stringify(param));

  // prepare event and send
  var event = new CustomEvent(
    "tdxEvent", 
    {
        detail: {
            name: `TDXONLOAD`,
            param: null
        },
        bubbles: true,
        cancelable: true
    }
  );
  window.dispatchEvent(event);
}

//var timcheck;

function TdxOnMadoriCreated(){

}

function TdxOnClick(sAttr){
  console.log("TDXONCLICK | " + sAttr);
  
  var tdx = document.getElementById("Control1");
  
  if(sAttr.indexOf("furn_") < 0) {
    tdx.DeselectObject();
    return;
  }
  
  //var tdx = document.getElementById("Control1");
  if(sAttr.indexOf(":")>=0){
		var n = sAttr.indexOf(":");
		sAttr = sAttr.substr(0, n);
	}
  var furn = Scene.getFurnitureById(sAttr);
	if(typeof(furn) === "undefined"){
    Scene.getFurnitureData(sAttr, TdxOnClick);
    return;
  }
  tdx.Object.Set(furn);
  
  tdx.SetRotationAxis(0,1,0);
  tdx.SetMoveAxis(1,1,1);

  var variations = furn.getVariations(); 
  var varitems = {};
  if(variations.length > 0) 
  {
    var varkey = variations[0].getAttribute("id");
    var varname = variations[0].getAttribute("name");
    
    varitems = {
      id: varkey,
      name: varname,
      items: []
    }

    var mat = furn.getMaterial(varkey);
    var items = mat.getElementsByTagName("item");
    
    for(var i = 0; i < items.length; i++) 
    {
      var simg = items[i].firstChild.nodeValue;
      var salt = items[i].getAttribute("alt");
      var stype = items[i].getAttribute("type");
      var smap = items[i].getAttribute("map");

      var svalue = items[i].getAttribute("value");
      var scode = items[i].getAttribute("code");
      var sparam = items[i].getAttribute("param");

      varitems.items.push({
        simg,
        salt,
        stype,
        smap,
        svalue,
        scode,
        sparam
      })
    }

  } else {
    varitems = {
      id: "",
      name: "",
      items: []
    }
  }

  var sobj = {
    id: furn.id,
    name: furn.getSummary('name'),
    price: 123456,
    variations: varitems,
  }

  // prepare event and send
  var event = new CustomEvent(
    "tdxEvent", 
    {
        detail: {
            name: `TDXONCLICK`,
            param: sobj
        },
        bubbles: true,
        cancelable: true
    }
  );
  window.dispatchEvent(event);
  

  /*
  if(gReadOnly){
    //tdx.DeselectObject();
    var param = {
      event:'OnClick',
      args:sAttr
    };
    my.namespace.pubOn3dxEvent(JSON.stringify(param));
    return;
  }
  */
  
  /*
  if(!gEditMode || sAttr.indexOf('nwall')>=0){
    if(sAttr.indexOf("furn_")<0 || tdx.GetObjectLock()) {
      tdx.DeselectObject();
      var param = {
        event:'OnClick',
        args:sAttr
      };
      //my.namespace.pubOn3dxEvent(JSON.stringify(param));
      return;
    }
  }

  if(sAttr.indexOf('wall')>=0 && App.SelectedItem){
    TdxMain.addWallFixture(App.SelectedItem);
    return;
  }

  if(sAttr.indexOf(":")>=0){
		var n = sAttr.indexOf(":");
		sAttr = sAttr.substr(0,n);
	}

  var furn = Scene.getFurnitureById(sAttr);
	if(typeof(furn) == "undefined"){
    if(sAttr.indexOf("beam")<0&&sAttr.indexOf("closet")<0&&sAttr.indexOf("fusuma")<0&&sAttr.indexOf("door")<0&&sAttr.indexOf("furn_")<0&&sAttr.indexOf("pillar")<0&&sAttr.indexOf("win")<0&&sAttr.indexOf("wnd")<0) return;
    Scene.getFurnitureData(sAttr, TdxOnClick);
    return;
  }
  
  var furnset = furn.getSummary('furnset');
  furnset = setParamValue(furnset,'');
  if(furnset == 'yes'){
    tdx.Object.Set(furn, sAttr);
  } else {
    tdx.Object.Set(furn);
  }
  
  if(tdx.Object.SelectedType == "door"){
		tdx.SetMoveAxis(3,0,0);
  } else if(tdx.Object.SelectedType == "window"){
    tdx.SetMoveAxis(3,1,0);
  } else {
    tdx.SetMoveAxis(1,1,1);
  }

  var param = {
    event:'OnClick',
    args:sAttr
  };
  //my.namespace.pubOn3dxEvent(JSON.stringify(param));
  */
  
}

function TdxOnButtonClick(butno){
  var tdx = document.getElementById("Control1");
	butno = parseInt(butno);
	if (butno == 2) {
		tdx.CopySelectedObject(-20,0,-20);
    setTimeout(function(){
      // emit event
      var param = {
        event:'OnCopyObject',
        args:''
      };
      //my.namespace.pubOn3dxEvent(JSON.stringify(param));
    },200);
	} else if (butno == 3) {
		if(tdx.MessageBox("Delete","Do you want to delete the selected item？",4)){
      tdx.DeleteObject();
      setTimeout(function(){
        var param = {
          event:'OnDelete',
          args:''
        };
        //my.namespace.pubOn3dxEvent(JSON.stringify(param));
      },100)
    }
	} else if (butno == -8) {
    var ret = parseInt(tdx.Undo());
    if(ret){
      //
    }
  } else if(butno == -9) {
    var ret = parseInt(tdx.Redo());
    if(ret){
      //
    }
  }
}

function TdxOnDeselect(){

  // prepare event and send
  var event = new CustomEvent(
    "tdxEvent", 
    {
        detail: {
            name: `TDXONDESELECT`,
            param: null
        },
        bubbles: true,
        cancelable: true
    }
  );
  window.dispatchEvent(event);

  /*
  try{
    var tdx = document.getElementById("Control1");
    tdx.Object.Clear();
  }catch(err){
    //
  }
  
  setTimeout(function(){
    var param = {
      event:'OnDeselect',
      args:''
    };
    //my.namespace.pubOn3dxEvent(JSON.stringify(param));
  },100)
  */
}

function TdxOnThumbnailMade(){
  var tdx = document.getElementById("Control1");
  var sBase64 = tdx.GetThumbnail();

  if(gCaptureFlag){
    console.log("capture",sBase64);
    gCaptureFlag = false;
    var param = {
      event:'OnCaptureImage',
      args:'data:image/'+gCaptureExt+';base64,'+sBase64
    };
    //my.namespace.pubOn3dxEvent(JSON.stringify(param));
  } else {
    var newHtml = 'data:image/jpg;base64,'+sBase64;
    var mylink = document.createElement("a");
    mylink.setAttribute('download','YourRoom.jpg');
    mylink.href = newHtml;
    document.body.appendChild(mylink);
    mylink.click();
    document.body.removeChild(mylink);
    delete mylink;
  }

  
}

function TdxOnKeyDown(vkey, keydata){
  //
}

document.onkeydown = function(e){
	var shift, ctrl, keycode, alt, target;
	if (e != null) {
    keycode = e.which;
    ctrl	= typeof e.modifiers == 'undefined' ? e.ctrlKey : e.modifiers & Event.CONTROL_MASK;
    shift	= typeof e.modifiers == 'undefined' ? e.shiftKey : e.modifiers & Event.SHIFT_MASK;
    alt = e.altKey;
    target = e.target;
  } else {
    keycode = event.keyCode;
    ctrl	= event.ctrlKey;
    shift	= event.shiftKey;
    alt = event.altKey;
    target = event.target;
	}
  
  if(target.tagName.toUpperCase().indexOf('INPUT')<0){
    if(gReadyState) {
      procKeyDown(keycode,shift,ctrl,alt);
    }
  }
	
};

document.onkeyup = function(e){
  var shift, ctrl, keycode, alt, target;
	if (e != null) {
    keycode = e.which;
    ctrl	= typeof e.modifiers == 'undefined' ? e.ctrlKey : e.modifiers & Event.CONTROL_MASK;
    shift	= typeof e.modifiers == 'undefined' ? e.shiftKey : e.modifiers & Event.SHIFT_MASK;
    alt = e.altKey;
    target = e.target;
  } else {
    keycode = event.keyCode;
    ctrl	= event.ctrlKey;
    shift	= event.shiftKey;
    alt = event.altKey;
    target = event.target;
	}
  
  if(target.tagName.toUpperCase().indexOf('INPUT')<0){
    if(gReadyState) {
      var tdx = document.getElementById("Control1");
      switch(keycode){
        case 66: //a
          displayWebPlayerVersion();
        case 65: //a
            tdx.ShowOverviewAxis(0);
            break;
        default:
      }
    }
  }
}

function procKeyDown(){
  var keycode = (arguments.length>0)?arguments[0]:0;
	var shift = (arguments.length>1)?arguments[1]:false;
	var ctrl = (arguments.length>2)?arguments[2]:false;
  var alt = (arguments.length>3)?arguments[3]:false;

  var tdx = document.getElementById("Control1");
	switch(keycode){
		case 38: //up
			//if(!tdx.Object.Selected || !DetailWindow.visible2){
      if(!tdx.Object.Selected){
				if(ctrl){
					//RotateCamera(1);
				} else if(shift){
					if(gEditMode) MoveCameraHeight(1);
				} else {
					if(gEditMode) tdx.GoForward(10);
				}
			} else {
        if(shift){
          moveObjectUpDown(5);
        } else {
          moveObject(keycode);
        }
      }
			break;
		case 40: //down
			//if(!tdx.Object.Selected || !DetailWindow.visible2){
      if(!tdx.Object.Selected){
				if(ctrl){
					//RotateCamera(0);
				} else if(shift){
					if(gEditMode) MoveCameraHeight(0);
				} else {
					if(gEditMode) tdx.GoForward(-10);
				}
			} else {
				if(shift){
          moveObjectUpDown(-5);
        } else {
          moveObject(keycode);
        }
      }
			break;
		case 37: //left
			//if(!tdx.Object.Selected || !DetailWindow.visible2){
      if(!tdx.Object.Selected){
				if(tdx.ViewMode == 0)  rotateCamView(10);
			} else {
        //if(ctrl){
        if(shift){
          rotateObject(5);
        } else {
          moveObject(keycode);
        }
      }
			break;
		case 39: //right
			//if(!tdx.Object.Selected || !DetailWindow.visible2){
      if(!tdx.Object.Selected){
				if(tdx.ViewMode == 0) rotateCamView(-10);
			} else {
				//if(ctrl){
        if(shift){
          rotateObject(-5);
        } else {
          moveObject(keycode);
        }
      }
			break;
		case 27: //esc

			break;
		case 32: //space

			break;
		case 46: //delete
			//deleteObject();
			break;
		case 8: //mac delete
			//if(browser.mac()) deleteObject();
			break;
		case 90: //z

			break;
		case 88: //x

			break;
		case 67: //c

			break;
		case 86: //v

			break;
		case 65: //a
      tdx.ShowOverviewAxis(1);
			break;
    case 66: //b

			break;
    case 74: //J
      if(ctrl && shift && alt) {
        displayWebPlayerVersion();
      }
      break;
		case 83: //s
      
      break;
		default:
			//
	}

}

function rotateCamView(angle){
	var tdx = document.getElementById("Control1");
	var x = tdx.CameraRotationX();
	var y = tdx.CameraRotationY();
	var z = tdx.CameraRotationZ();
	angle = y + angle;
	tdx.SetCameraRotation(x,angle,z);
	tdx.Redraw();
}

function getObjectByEvent(e){
	var elem = "";
	e = (e) ? e : ((window.event) ? window.event : "");
	if(e) {
		elem = (e.target) ? e.target : e.srcElement;
	}
	return elem;
}

function RotateCamera(n){
	var tdx = document.getElementById("Control1");
	var x = tdx.CameraRotationX();
	var y = tdx.CameraRotationY();
	var z = tdx.CameraRotationZ();
	x = parseFloat(x);
	y = parseFloat(y);
	z = parseFloat(z);
	if(n > 0){
		x += 15;
	} else {
		x -= 15;
	}
	if(x<-90) x = -90;
	if(x > 90) x = 90;
	if(isNaN(x)) x = 0;
	if(isNaN(y)) y = 0;
	if(isNaN(z)) z = 0;
	tdx.SetCameraRotation(x,y,z);
	tdx.Redraw();
}

function MoveCameraHeight(n){
	var tdx = document.getElementById("Control1");
	var xyz = tdx.GetCameraPosRevised();
	var token = xyz.split(",");
	var x = parseFloat(token[0]);
	var y = parseFloat(token[1]);
	var z = parseFloat(token[2]);

	if(n > 0){
		y += 10;
	} else {
		y -= 10;
	}

	if(y<25) y = 25;

	tdx.SetCameraPosRevised(x,y,z);
	tdx.Redraw();
}

function moveObjectUpDown(n){
  var tdx = document.getElementById("Control1");
  if(tdx.Object.SelectedType == "dwall") return;
	var xyz = tdx.GetObjectPosition();
	var token = xyz.split(",");
	var px = parseFloat(token[0]);
	var py = parseFloat(token[1]);
	var pz = parseFloat(token[2]);
	if(tdx.ViewMode == 1) return;
    if(tdx.Object.SelectedType == "door" || tdx.Object.SelectedType == "window") return;
    var placement = tdx.Object.obj.getSummary("placement");
	placement = setParamValue(placement,"floor");
    if(placement == "ceiling") return;
    
    py+=n;
    if(py < 0) py = 0;
    
    tdx.MoveObject(0,n,0);
    
}

function moveObject(n){
	var tdx = document.getElementById("Control1");
	//if(!tdx.Object.Selected || !DetailWindow.visible2){
	if(!tdx.Object.Selected){
		//
	} else {
    if(tdx.Object.SelectedType == "dwall") return;
		moveSelectedItem(n);
	}
}

function rotateObject(n){
  var tdx = document.getElementById("Control1");
	if(tdx.Object.SelectedType == "dwall" || tdx.Object.SelectedType == "door" || tdx.Object.SelectedType == "window" || tdx.Object.SelectedType == "curtain") return;
  tdx.TurnObject(0,n,0);
}

function getMoveAxis(){
	var tdx = document.getElementById("Control1");
	var xyz = tdx.GetObjectRotation();
	var token = xyz.split(",");
	var rx = parseInt(token[0]);
	var ry = parseInt(token[1]);
	var rz = parseInt(token[2]);
	if(ry == 0 || ry == -180 || ry == 180) return "x";
	if(ry == -90 || ry == 90) return "z";
}

function moveSelectedItem(keycode){
	var tdx = document.getElementById("Control1");
	var xyz = tdx.GetObjectPosition();
	var token = xyz.split(",");
	var px = parseFloat(token[0]);
	var py = parseFloat(token[1]);
	var pz = parseFloat(token[2]);
	var cy = tdx.CameraRotationY();
	cy = parseFloat(cy);
	if(tdx.Object.SelectedType == "door"|| tdx.Object.SelectedType == "window"|| tdx.Object.SelectedType == "curtain"){
		var axis = getMoveAxis();
		if(keycode == 38){
			if(axis == "z"&&tdx.ViewMode!==3) {
				pz -= 5;
				
        tdx.MoveObject(0,0,-5);
			}
			if(axis =="x" && tdx.ViewMode == 3){
				px -= 5;
				
        tdx.MoveObject(-5,0,0);
			}
		} else if(keycode == 40){
			if(axis == "z"&&tdx.ViewMode!==3) {
				pz += 5;
				
        tdx.MoveObject(0,0,5);
			}
			if(axis =="x" && App.ViewMode == 3){
				px += 5;
				
        tdx.MoveObject(5,0,0);
			}
		} else if(keycode == 37){
			if(axis == "x"&&tdx.ViewMode!==3) {
				px -= 5;
				
        tdx.MoveObject(-5,0,0);
			}
			if(axis == "z"&&tdx.ViewMode == 3) {
				pz += 5;
				if(axis == "z") {
                    
          tdx.MoveObject(0,0,5);
        }
      }
		} else if(keycode == 39) {
			if(axis == "x"&&tdx.ViewMode!==3) {
				px += 5;
				
        tdx.MoveObject(5,0,0);
			}
			if(axis == "z"&&tdx.ViewMode == 3) {
				pz -= 5;
				if(axis == "z") {
                    
          tdx.MoveObject(0,0,-5);
        }
      }
		}
	} else {
    px = 0;
    py = 0;
    pz = 0;
        
		if(tdx.ViewMode == 3){
			if(keycode == 38) px -= 5;
			if(keycode == 40) px += 5;
			if(keycode == 37) pz += 5;
			if(keycode == 39) pz -= 5;
		} else if(tdx.ViewMode == 1 || tdx.ViewMode == 2) {
			if(keycode == 38) pz -= 5;
			if(keycode == 40) pz += 5;
			if(keycode == 37) px -= 5;
			if(keycode == 39) px += 5;
		} else {
			if(keycode == 38) {
				if((cy <= -135 && cy >= -180) || (cy >= 135 && cy <= 180)){
					pz += 5;
				} else if(cy <= -45 && cy > -135){
					px += 5;
				} else if(cy >= 45 && cy < 135){
					px -= 5;
				} else {
					pz -= 5;
				}
			}
			if(keycode == 40) {
				if((cy <= -135 && cy >= -180) || (cy >= 135 && cy <= 180)){
					pz -= 5;
				} else if(cy <= -45 && cy > -135){
					px -= 5;
				} else if(cy >= 45 && cy < 135){
					px += 5;
				} else {
					pz += 5;
				}
			}
			if(keycode == 37) {
				if((cy <= -135 && cy >= -180) || (cy >= 135 && cy <= 180)){
					px += 5;
				} else if(cy <= -45 && cy > -135){
					pz -= 5;
				} else if(cy >= 45 && cy < 135){
					pz += 5;
				} else {
					px -= 5;
				}
			}
			if(keycode == 39) {
				if((cy <= -135 && cy >= -180) || (cy >= 135 && cy <= 180)){
					px -= 5;
				} else if(cy <= -45 && cy > -135){
					pz += 5;
				} else if(cy >= 45 && cy < 135){
					pz -= 5;
				} else {
					px += 5;
				}
			}
		}
		
    tdx.MoveObject(px,py,pz);
	}
}

function TdxOnViewModeChanged(mode){
	var tdx = document.getElementById("Control1");
  mode = parseInt(mode);
  if(mode == 1){
    tdx.TranslationMode(0);
		tdx.ViewMode = 0;
	} else {
		tdx.TranslationMode(1);
		tdx.ViewMode = 1;
  }

}

function TdxOnTransChange(mode, namae){
	var tdx = document.getElementById("Control1");
	mode = parseInt(mode);
	if(mode == 1){
		TdxOnClick(namae);
		tdx.TranslationMode(1);
	} else {
		tdx.TranslationMode(0);
	}

}

function TdxOnGroupingModeEnd(){

}

function TdxOnOPInURMode(){

}

function TdxOnCaptureClicked(){
  try{
    var width = document.getElementById("tdxplayer-container").offsetWidth;
    var height = document.getElementById("tdxplayer-container").offsetHeight;
    if(width <= 0){
      width = 800;
    }
    if(height <= 0){
      height = 600;
    }
  } catch(err){
    width = 800;
    height = 600;
  }
  var tdx = document.getElementById("Control1");
  tdx.MakeThumbnail(width,height,90,'.jpg');

}

/*
handle onload to initialize player
*/
/*
(function initMPP(){
  //console.log("SET WEBGL PLAYER");

  Scene.init();

  try{
    Module = {
      preRun: [ tdx_InitCallbacks ],
      postRun: [],
      //printErr:function(text){},
      locateFile: function(url){
        return 'assets/js/tdxPlayer-'+gTDXWebGLVersion+'.data';
      },
      canvas: (function(){
        var canvas = document.getElementById("canvas"); 
        return canvas;
      })()
    };
    TdxPlayer = Module;
  } catch(err){
    //console.log("Error:"+err.message);
  }

  if(location.href.indexOf('tdxview')>=0){
    gEditMode = true;
  } else {
    gEditMode = false;
  }
  //console.log('EDITMODE='+gEditMode);

  var ohead = document.getElementsByTagName('HEAD').item(0);
  var oscript = document.createElement('script');
  oscript.language = 'javascript';
  oscript.type = 'text/javascript';
  oscript.src = 'assets/js/tdxPlayer-'+gTDXWebGLVersion+'.js';
  ohead.appendChild(oscript);

})();
*/

function connectPromise() {
  return 123;
}

function callFromReact( param ) {
  console.log("tdxmain function param:" + param);

  var getUrl = window.location;
  gDocBase = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
  console.log("docbase", gDocBase);

  var tdxcontainer = document.getElementById( param );
  var width = tdxcontainer.offsetWidth;
  var height = tdxcontainer.offsetHeight;

  var div = document.createElement("div");
  div.id = "Control1";
  div.style.position = "absolute";
  div.style.left = (0) + "px";
  div.style.top = (0) + "px";
  div.style.width = "100%";
  div.style.height = "100%";
  div.style.cssText = "background-color: red";
  
  var canvas = document.createElement("canvas");
  canvas.id = "canvas";
  canvas.width = width;
  canvas.height = height;
  canvas.style.position = "absolute";
  canvas.style.left = (0) + "px";
  canvas.style.top = (0) + "px";
  canvas.style.width = "100%";
  canvas.style.height = "100%";

  div.appendChild( canvas );
  tdxcontainer.appendChild( div );

  Scene.init();

  try{
    Module = {
      preRun: [ tdx_InitCallbacks ],
      postRun: [],
      locateFile: function(url){
        return './js/tdxPlayer-'+gTDXWebGLVersion+'.data';
      },
      canvas: (function(){
        var canvas = document.getElementById("canvas"); 
        return canvas;
      })()
    };
    TdxPlayer = Module;
  } catch(err){
    console.log("Tdxmain Error:"+err.message);
  }

  gEditMode = false;

  var ohead = document.getElementsByTagName('HEAD').item(0);
  var oscript = document.createElement('script');
  oscript.language = 'javascript';
  oscript.type = 'text/javascript';
  oscript.src = './js/tdxPlayer-' + gTDXWebGLVersion + '.js';
  ohead.appendChild( oscript );

  window.onresize = resizeplayer;
}