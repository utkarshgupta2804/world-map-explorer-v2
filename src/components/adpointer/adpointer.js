let flag2=true
var sel=true
L.AdPointer = L.Layer.extend({
    
    initialize: function(pointer) {
        // Constructor function
        this.pointer=pointer;
        distance= 100
        var distanceO
        this.distanceO=distanceO
        var flatdist =0
        this.flatdist=flatdist
        this.distance = distance; // Distance in meters
        var angle= 0  // Angle in degrees from north
        this.angle=angle

    },

    onAdd: function(map) {
        this._map = map;
        //this._map.on('click', this._onClick, this);
        flag2=true
        // Add a reference to the keydown handler to remove it later
        this._handleKeydown = function(event) {
            switch(event.key) {
                case 'a':
                    sel ? sel = false : sel = true;
                    break;
                case 'w':
                    if (sel) {
                        AdPointer.distance = AdPointer.distance + 10//(AdPointer._fixdist(map.getZoom()) / 5);
                        AdPointer._secondoryupdate(AdPointer.primaryMarker.getLatLng());
                    } else {
                        AdPointer.angle = AdPointer.angle + 1;
                        AdPointer._secondoryupdate(AdPointer.primaryMarker.getLatLng());
                    }
                    break;
                case 's':
                    if (sel) {
                        AdPointer.distance = AdPointer.distance - 10//(AdPointer._fixdist(map.getZoom()) / 5);
                        AdPointer._secondoryupdate(AdPointer.primaryMarker.getLatLng());
                    } else {
                        AdPointer.angle = AdPointer.angle - 1;
                        AdPointer._secondoryupdate(AdPointer.primaryMarker.getLatLng());
                    }
                    break;
                default: return;
            }
            if (flag2) {
                flag2 = false;
                setTimeout(() => {
                    findplacename(AdPointer.secondaryMarker).then(nm => {
                        document.getElementById('placeDisplay').textContent = nm;
                        flag2 = true;
                    });
                }, 650);
            }
        }.bind(this);
    
        document.addEventListener('keydown', this._handleKeydown);
    
        var svgstr = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="7.5" cy="7.5" r="6.5" fill="#C60000" stroke="black" stroke-width="2"/>
            </svg>`;
    
        var customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: svgstr,
            iconSize: [15, 15],
            iconAnchor: [6.5, 6.5]
        });
    
        this.primaryMarker = new L.Marker(this.pointer, { 
            icon: customIcon 
        }).addTo(this._map);
    
        //this.distance = 2000//this._fixdist(map.getZoom());
        this.angle = 0;
        const marker1 = this.primaryMarker;
        const marker2 = this._secondoryupdate(this.pointer);
    
        var markerelement = marker2.getElement();
        var svg = markerelement.querySelector('svg');
        this.line = L.polyline([marker1.getLatLng(), marker2.getLatLng()], {color: 'black', weight: 5}).addTo(map);
    
        this._handleSecondaryMove = function(e) {
            AdPointer.angle = AdPointer._getAngle(marker1, marker2);
            svg.setAttribute('transform', 'rotate(' + (AdPointer.angle) + ')');
            AdPointer.distanceO = marker1.getLatLng().distanceTo(marker2.getLatLng())

            AdPointer.distance = L.point(map.latLngToContainerPoint(marker1.getLatLng())).distanceTo(L.point(map.latLngToContainerPoint(marker2.getLatLng())))
            AdPointer.flatdist = Math.sqrt(Math.pow(AdPointer.secondaryMarker.getLatLng().lat-AdPointer.primaryMarker.getLatLng().lat,2)+Math.pow(AdPointer.secondaryMarker.getLatLng().lng-AdPointer.primaryMarker.getLatLng().lng,2))*40075016.7/360
            AdPointer.line.setLatLngs([marker1.getLatLng(), marker2.getLatLng()]);
            AdPointer._updateInfoBox();
        };
        this._map.on('zoom',function(){
            AdPointer.distance = L.point(map.latLngToContainerPoint(marker1.getLatLng())).distanceTo(L.point(map.latLngToContainerPoint(marker2.getLatLng())))
        })
        this._handleSecondaryMoveEnd = function() {
            setTimeout(() => {
                findplacename(this).then(nm => {
                    document.getElementById('placeDisplay').textContent = nm;
                    flag2 = true;
                });
            }, 500);
        };
    
        this.secondaryMarker.on('move', this._handleSecondaryMove);
        this.secondaryMarker.on('moveend', this._handleSecondaryMoveEnd);
    
        this._updateInfoBox();
        findplacename(this.secondaryMarker).then(nm => {
            document.getElementById('placeDisplay').textContent = nm;
            flag2 = true;
        });
    },
    

    onRemove: function(map) {
        // Remove map event listeners
        //this._map.off('click', this._onClick, this);
        this._map.off('zoom')
        // Remove document event listeners
        document.removeEventListener('keydown', this._handleKeydown);
    
        // Remove the primary marker from the map
        if (this.primaryMarker) {
            this._map.removeLayer(this.primaryMarker);
        }
    
        // Remove the secondary marker from the map
        if (this.secondaryMarker) {
            this.secondaryMarker.off('move', this._handleSecondaryMove);
            this.secondaryMarker.off('moveend', this._handleSecondaryMoveEnd);
            this._map.removeLayer(this.secondaryMarker);
        }
    
        // Remove the polyline from the map
        if (this.line) {
            this._map.removeLayer(this.line);
        }
    
        // Clear the place display element
        document.getElementById('placeDisplay').textContent = '';
        document.getElementById('infoBox').style.display='';
    },
    


    /*_calculateDestination: function(start, distance, angle) {
        
        const earthRadius = 6371e3;
        const δ = distance / earthRadius; // Angular distance in radians
        const θ = (angle+90) * (Math.PI / 180); // Convert angle to radians
      
        const φ1 = start.lat * (Math.PI / 180);
        const λ1 = start.lng * (Math.PI / 180);
      
        const φ2 = Math.abs(φ1) === Math.PI / 2
            ? Math.sign(φ1) * (Math.PI / 2 - δ)
            : Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
      
        const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));
      
        return L.latLng(φ2 * (180 / Math.PI), λ2 * (180 / Math.PI));
      },*/
      _calculateDestination: function(start,d, angle) {
        //const latLng1 = start.getLatLng();
        const point1 = map.latLngToLayerPoint(start);
        const theta = (angle) * (Math.PI / 180)
        const x= d*Math.cos(theta)+point1.x
        const y= d*Math.sin(theta)+point1.y
        const final= map.layerPointToLatLng([x,y])
        this.distanceO = start.distanceTo(final)
        return final
      },
    
      _getAngle: function(marker1, marker2) {
        // Get geographical coordinates
        const latLng1 = marker1.getLatLng();
        const latLng2 = marker2.getLatLng();
        
        // Convert geographical coordinates to pixel coordinates
        const point1 = map.latLngToLayerPoint(latLng1);
        const point2 = map.latLngToLayerPoint(latLng2);
        
        // Calculate differences in pixel coordinates
        const deltaX = point2.x - point1.x;
        const deltaY = point2.y - point1.y;
        
        // Calculate the angle in radians
        let angleRad = Math.atan2(deltaY, deltaX);
        
        // Convert the angle to degrees
        let angleDeg = angleRad * (180 / Math.PI);
        
        // Normalize the angle to be between 0 and 360 degrees
        angleDeg = (angleDeg + 360) % 360;
        
        return angleDeg;
    },
   
    _secondoryupdate: function(primary){
        var arrowhead = `<svg id="mysvg" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)" width="18" height="15" viewBox="0 0 18 15" fill="none">
        <path id="polygon" d="M0.5 0.75L16.7 7.5L0.5 14.25V0.75Z" fill="#005304" stroke="black"/>
        </svg>`   

        var arrowIcon = L.divIcon({
            className: 'arrow-div-icon',
            html: arrowhead, // Use the SVG string as the HTML content
            iconSize: [18,15], // Adjust the icon size as needed
            iconAnchor: [9,7.5] // Adjust the anchor point as needed
        });
        const idestination = this._calculateDestination(primary, this.distance,this.angle);

        // Add or move the secondary marker
        if (this.secondaryMarker) {
            this.secondaryMarker.setLatLng(idestination);
        } else {
            this.secondaryMarker = new L.marker(idestination,{ icon : arrowIcon, draggable: true}).addTo(this._map);
        }
        if((this.secondaryMarker.getLatLng().lat>85)||(this.secondaryMarker.getLatLng().lat<-85)){
            console.log("you are getting to pole")
        }
        if((this.secondaryMarker.getLatLng().lng>180)||(this.secondaryMarker.getLatLng().lnt<-180)){
            console.log("you are crossing map")
        }
        this._updateInfoBox();
        this.flatdist= Math.sqrt(Math.pow(AdPointer.secondaryMarker.getLatLng().lat-AdPointer.primaryMarker.getLatLng().lat,2)+Math.pow(AdPointer.secondaryMarker.getLatLng().lng-AdPointer.primaryMarker.getLatLng().lng,2))*40075016.7/360
        return this.secondaryMarker
       
    },

    _updateInfoBox: function() {
        // Only show the box when the secondary marker exists
        if (this.secondaryMarker) { 
          document.getElementById('infoBox').style.display = 'block';
          const distanceInKm = this.distanceO / 1000;
            const fdist = this.flatdist/1000
          // Update the display:
          document.getElementById('distanceDisplay').textContent = distanceInKm.toFixed(2) + ' KM';
          document.getElementById('flatdistance').textContent = fdist.toFixed(2) + ' KM';
          document.getElementById('angleDisplay').textContent = 360-Math.round(this.angle) + ' degrees';
          document.getElementById('lat').textContent =' Latitude : '+ this.secondaryMarker.getLatLng().lat.toFixed(5)
          document.getElementById('lng').textContent =' Longitude : '+ this.secondaryMarker.getLatLng().lng.toFixed(5)
          

          
        } else {
          document.getElementById('infoBox').style.display = 'none';
        }
      }


});

var AdPointer 
