let poly
let oname,pname
let flag=true
let wentfar=0
function borderCheck(within50){
    if(poly){
        if(((leafletPip.pointInLayer(marker.getLatLng(),poly).length<=0))&&flag){
            flag=false
            poly.remove()
            oname=pname
            
            addpoly().then((nm) => {
                if(nm.name!="sea(mostly)"){
                    borderCheck(0)
                }
                if((within50<=60)&&(nm!=oname)){
                    if(crossedhigherlevel(oname,pname)){
                        console.log(`${oname.display_name} crossed. ${nm.display_name} entered`);
                        var message = new SpeechSynthesisUtterance(`${oname.display_name} crossed. ${nm.display_name} entered`);
                        speechSynthesis.speak(message);
                    }else{
                        console.log(`${oname.name} crossed. ${nm.name} entered`);
                        var message = new SpeechSynthesisUtterance(`${oname.name} crossed. ${nm.name} entered`);
                        speechSynthesis.speak(message);
                    }
                    if(wentfar>=7){
                        console.log("May be went too far")
                        var war = new SpeechSynthesisUtterance("May be went too far");
                        speechSynthesis.speak(war);
                        wentfar=0
                    }
                }
                // Code to execute after addpoly finishes (success)
              }).catch(error => {
                console.error("Error in addpoly:", error);
              });
              
            
        }else{
            if(!flag){
                wentfar++
            }
        }
        
    }else{
        addpoly()
    }
}
let controller=null
let errorCount=0
function addpoly(){
    
    return new Promise((resolve,reject)=>{
            
            if(controller){
                controller.abort()
            }
            controller = new AbortController();
            const signal = controller.signal;
            //let opsignal= flag? {signal}:{};
            //flag=true
            fetch(`https://nominatim.openstreetmap.org/reverse.php?lat=${marker.getLatLng().lat}&lon=${marker.getLatLng().lng}&zoom=${getZooom()}&format=geojson&polygon_geojson=1&polygon_threshold=${threshold(map.getZoom())}`,{signal})
            .then(response => response.json())
            .then(data => {
                //console.log(data)
              pname=data.features[0].properties
              poly=L.geoJson(data,{
                fillOpacity: 0
              })
              poly.addTo(map)
              poly.bringToBack()
              resolve(pname)
              flag=true

            })
            .catch(error =>{
                if(error instanceof DOMException && error.name === 'AbortError'){
                    //oname=null
                    //flag=true
                    errorCount++
                    if(errorCount>5){
                        console.log("Your going too fast")
                        errorCount=0
                    }
    
                    //alert("Your going too fast")
                }else if(error instanceof TypeError){
                    pname={name:"sea(mostly)",display_name:"sea(mostly)"}
                    //flag=true
                    //resolve(pname)
                }else{
                    console.error(error)
                }
                pname={name:"sea(mostly)",display_name:"sea(mostly)"}
                //pname="Sea(mostly)"
                //pname="sea(mostly)"
                
              flag=true  
              resolve(pname)

            })
        
        
    })
}
function getZooom(){
    if(map.getZoom()>=8){
        return 6
    }else if(map.getZoom() >= 5 && map.getZoom() <= 7){
        return 5
    }else if(map.getZoom()<=4){
        return 2
    }
}
function threshold(x) {
    return 0.002 + (0.02 - 0.002) * (x / 18);
  }
map.on('zoomend',function(e){
    if(poly){
        poly.remove()
        if(marker){
            addpoly()
        }
        //console.log(getZooom())
    }
})
function crossedhigherlevel(cro,ent){
    if(ent.place_rank>=10){
        if (
            (ent.address?.state !== cro.address?.state) ||
            (ent.address?.province !== cro.address?.province) ||
            (ent.address?.country !== cro.address?.country)
          ){
            return true
          }else{
            return false
          } 
    }else if(ent.place_rank>=8){
        if (
            (ent.address?.country !== cro.address?.country)
          ){
            return true
          }else{
            return false
          } 
    }
}