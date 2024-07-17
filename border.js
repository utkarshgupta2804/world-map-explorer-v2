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
                if(nm!="sea(mostly)"){
                    borderCheck(0)
                }
                if((within50<=60)&&(nm!=oname)){
                    console.log(`${oname} crossed. ${nm} entered`);
                    var message = new SpeechSynthesisUtterance(`${oname} crossed. ${nm} entered`);
                    speechSynthesis.speak(message);
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
            if(geoLayer){
                geoLayer.remove()
            }
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
              pname=data.features[0].properties.name
              poly=L.geoJson(data)
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
                        console.log("You're going too fast")
                        errorCount=0
                    }
    
                    //alert("Your going too fast")
                }else if(error instanceof TypeError){
                    pname="sea(mostly)"
                    //flag=true
                    //resolve(pname)
                }else{
                    console.error(error)
                }
                //pname="Sea(mostly)"
                pname="sea(mostly)"
                
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
        addpoly()
        //console.log(getZooom())
    }
})