L.AdPointer = L.Layer.extend({
    
    initialize: function(pointer) {
        // Constructor function
        this.pointer=pointer;
        distance= this._fixdist(map.getZoom())/5
        this.distance = distance; // Distance in meters
        var angle= 90  // Angle in degrees from north
        this.angle=angle

    },

    onAdd: function(map) {
        this._map = map;
        this._map.on('click', this._onClick, this);
        var sel="distance"; //selector, angle or distance
        document.addEventListener('keydown', function(event) {

            switch(event.key) {
                case 'a': // Listen to 'w'
                    (sel=="distance")?sel="angle":sel="distance";
                    break;
                case 'w':
                    if (sel=="distance"){
                        AdPointer.distance=AdPointer.distance+(AdPointer._fixdist(map.getZoom())/5);
                        AdPointer._secondoryupdate(AdPointer.primaryMarker.getLatLng())
                    }else{
                        AdPointer.angle=AdPointer.angle+1;
                        AdPointer._secondoryupdate(AdPointer.primaryMarker.getLatLng())
                    }
                    break;
                case 's':
                    if (sel=="distance"){
                        AdPointer.distance=AdPointer.distance-(AdPointer._fixdist(map.getZoom())/5);
                        AdPointer._secondoryupdate(AdPointer.primaryMarker.getLatLng())
                    }else{
                        AdPointer.angle=AdPointer.angle-1;
                        AdPointer._secondoryupdate(AdPointer.primaryMarker.getLatLng())    
                    }
                    break;
            }
        })
        var svgstr = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="6.5" fill="#C60000" stroke="black" stroke-width="2"/>
        </svg>` 
       
       
        var customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: svgstr, // Use the SVG string as the HTML content
            iconSize: [15,15], // Adjust the icon size as needed
            iconAnchor: [6.5,6.5] // Adjust the anchor point as needed
        });
       
            
    
        
            this.primaryMarker = new L.Marker(this.pointer,{ 
                icon: customIcon
            }).addTo(this._map);
        
        
        this.distance=this._fixdist(map.getZoom())
        this.angle=90
        const marker1 = this.primaryMarker
        const marker2 = this._secondoryupdate(this.pointer)
        var markerelement = marker2.getElement()
        var svg = markerelement.querySelector('svg')
        this.line = L.polyline([marker1.getLatLng(), marker2.getLatLng()], {color: 'black', weight: 5}).addTo(map);
        this.secondaryMarker.on('move',function(e){
            AdPointer.angle=AdPointer._getAngle(marker1,marker2)
            svg.setAttribute('transform','rotate('+(AdPointer.angle-90)+')')
            AdPointer.distance=map.distance(marker1.getLatLng(), marker2.getLatLng())
            AdPointer.line.setLatLngs([marker1.getLatLng(), marker2.getLatLng()]);
            AdPointer._updateInfoBox();

        })
        this._updateInfoBox();
    },

    onRemove: function(map) {
        // Method called when the layer is removed from the map
        // Clean up by removing the markers and event listeners
        if (this.primaryMarker) {
            mar = this.primaryMarker.getLatLng()
            this.primaryMarker.remove();
        }
        if (this.secondaryMarker) {
            this.secondaryMarker.remove();
        }
        if (this.line) {
            this.line.remove();
        }
        document.getElementById('infoBox').style.display = 'none';
        //this._map.off('click', this._onClick, this);
    },
    


    _calculateDestination: function(start, distance, angle) {
        
        const earthRadius = 6371e3;
        const δ = distance / earthRadius; // Angular distance in radians
        const θ = angle * (Math.PI / 180); // Convert angle to radians
      
        const φ1 = start.lat * (Math.PI / 180);
        const λ1 = start.lng * (Math.PI / 180);
      
        const φ2 = Math.abs(φ1) === Math.PI / 2
            ? Math.sign(φ1) * (Math.PI / 2 - δ)
            : Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
      
        const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));
      
        return L.latLng(φ2 * (180 / Math.PI), λ2 * (180 / Math.PI));
      },
    
    _getAngle: function(marker1,marker2) {

        const lat1 = marker1.getLatLng().lat;
        const lon1 = marker1.getLatLng().lng;
        const lat2 = marker2.getLatLng().lat;
        const lon2 = marker2.getLatLng().lng;   

        // Convert latitudes and longitudes from degrees to radians
        const lat1Rad = lat1 * (Math.PI / 180);
        const lat2Rad = lat2 * (Math.PI / 180);
        const deltaLonRad = (lon2 - lon1) * (Math.PI / 180);
    
        // Calculate the bearing
        const y = Math.sin(deltaLonRad) * Math.cos(lat2Rad);
        const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
                  Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLonRad);
        let bearing = Math.atan2(y, x) * (180 / Math.PI);
    
        // Normalize the bearing to 0-360 degrees
        bearing = (bearing + 360) % 360;
    
        return bearing;
    },
    _fixdist: function(num) {
        const distanceArray = [1280000,6400000,3200000,1600000,800000,400000,200000,96000,48000,24000,12000,6000,3000,1500,700,350,150,100,50];
        return distanceArray[num];
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
        const idestination = this._calculateDestination(primary, this.distance, this.angle);

        // Add or move the secondary marker
        if (this.secondaryMarker) {
            this.secondaryMarker.setLatLng(idestination);
        } else {
            this.secondaryMarker = new L.marker(idestination,{ icon : arrowIcon, draggable: true}).addTo(this._map);
        }
        this._updateInfoBox();
        return this.secondaryMarker
       
    },

    _updateInfoBox: function() {
        // Only show the box when the secondary marker exists
        if (this.secondaryMarker) { 
          document.getElementById('infoBox').style.display = 'block';
          const distanceInKm = this.distance / 1000; 
          // Update the display:
          document.getElementById('distanceDisplay').textContent = distanceInKm.toFixed(2) + ' KM';
          document.getElementById('angleDisplay').textContent = Math.round(this.angle) + ' degrees';
          document.getElementById('lat').textContent =' Latitude : '+ this.secondaryMarker.getLatLng().lat
          document.getElementById('lng').textContent =' Longitude : '+ this.secondaryMarker.getLatLng().lng
          
        } else {
          document.getElementById('infoBox').style.display = 'none';
        }
      }


});

var AdPointer 
