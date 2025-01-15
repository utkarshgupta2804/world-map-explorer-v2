import { clickSound } from '../../utils/sounds.js';
import { findplaceNamAandData } from '../../services/find-place-name-and-data.js';
import { map } from '../map.js';
import { notifySreenReader } from '../../utils/accessibility.js';
import { toKMorMeter } from '../../utils/to-km-or-meter.js';
import { placeappear } from '../../services/fetch-place.js';
import { initializeAdjustablePointer } from './adjustable-pointer.js';

let timeout;//for clearing timeout, for avoiding multiple unnecessary calls
let pressCount = 0; //for counting key press for 'D' key
let lastPressTime = 0; //store last key press time

export function markerShortcuts(event) { //for key shortcuts related to marker, always bind this to marker
  if (event.code == 'KeyD') {
    handleKeyDPress.bind(this)(event);
  }
  if ('KeyJ' == event.code) {
    initializeAdjustablePointer(this.getLatLng());
    event.preventDefault();
  }
  if (event.code == 'KeyF') {
    event.preventDefault();
    findplaceNamAandData.bind(this)(this);
  }
  if (event.code == 'KeyF' && event.shiftKey) {
    event.preventDefault();
    getCoordinates(this);
  }
  if (event.code == 'Enter') {
    pressEnter.bind(this)();
  }
  if (event.shiftKey) {
    if (event.key.startsWith('Arrow')) {
      getBorderDistance.bind(this)(event);
    }
  }
  if (event.code == 'KeyZ') {
    event.preventDefault();
    getScaledDistance.bind(this)();
  }
  if (event.code == 'KeyA') {
    event.preventDefault();
    notifySreenReader(document.getElementById('elevation').innerHTML);
  }
  if (event.key.startsWith('Arrow') && !event.shiftKey) {
    timeout && clearTimeout(timeout);
    timeout = setTimeout(() => {
      findplaceNamAandData
        .bind(this)(this)
        .then((place) => {
          notifySreenReader(place.name, true);
        });
    }, 650);
    if (map) map.panTo(this.getLatLng());
  }
}

export function markerMove(event) { //for key shortcuts related to marker only in free move , not in inbound
  //for key shortcuts related to marker
  if (event.key.startsWith('Arrow') && !event.shiftKey) {
    this.setLatLng(getNextLatLng.bind(this)(event.code));
  }
}
export function InboundMarkerMove(event) { //for key shortcuts related to marker only in inbound
  event.preventDefault();
  if (event.key.startsWith('Arrow') && !event.shiftKey) {
    InboundMarkerMovement.bind(this)(event.code);
  }
}

function InboundMarkerMovement(key) { //detect the border, and blocks movement if it crosses the border
  console.log(key);
  let borderpoints = this._borderPoints;
  const moves = {
    ArrowUp: [0.000001, 0],
    ArrowDown: [-0.000001, 0],
    ArrowLeft: [0, -0.000001],
    ArrowRight: [0, 0.000001],
  };
  const limits = {
    ArrowUp: () =>
      perKeyDist.bind(this)() > this.getLatLng().distanceTo(borderpoints.north),
    ArrowDown: () =>
      perKeyDist.bind(this)() > this.getLatLng().distanceTo(borderpoints.south),
    ArrowLeft: () =>
      perKeyDist.bind(this)() > this.getLatLng().distanceTo(borderpoints.west),
    ArrowRight: () =>
      perKeyDist.bind(this)() > this.getLatLng().distanceTo(borderpoints.east),
  };

  if (limits[key]()) {
    // Call the function to evaluate the condition
    console.log(limits[key]);
    const move = moves[key];
    this.setLatLng([
      this.getLatLng().lat - move[0],
      this.getLatLng().lng - move[1],
    ]);
  } else {
    this.setLatLng(getNextLatLng.bind(this)(key));
  }
}

function getBorderDistance(event) { //for getting distance from border
  const directions = {
    ArrowUp: { point: 'north', label: 'to north' },
    ArrowDown: { point: 'south', label: 'to south' },
    ArrowLeft: { point: 'west', label: 'to west' },
    ArrowRight: { point: 'east', label: 'to east' },
  };

  const direction = directions[event.key];
  if (!direction || !this._borderPoints) return;

  const distance = toKMorMeter(
    this.getLatLng().distanceTo(this._borderPoints[direction.point])
  );
  console.log(distance);
  notifySreenReader(`${distance} ${direction.label}`, true);
}

function getNextLatLng(direction) { //for getting next latlng on any arrow key press
  clickSound.play();
  var center = this.getLatLng();
  console.log(map);
  var point = map.latLngToLayerPoint(center);
  var lat = point.x;
  var lng = point.y;
  let movement = 10; 
  switch (direction) {
    case 'ArrowUp':
      lng -= movement; 
      break;
    case 'ArrowDown':
      lng += movement; 
      break;
    case 'ArrowLeft':
      lat -= movement; 
      break;
    case 'ArrowRight':
      lat += movement; 
      break;
  }

  // Set the new center of the map
  const mar = map.layerPointToLatLng(L.point(lat, lng));
  return mar;
}

function getScaledDistance() { //for getting distance per key press
  try {
    notifySreenReader(
      toKMorMeter(perKeyDist.bind(this)()) + ' per key press',
      true
    );
  } catch (error) {
    alert('Add marker first');
  }
}

function getCoordinates(marker) { //for getting coordinates of the marker
  notifySreenReader(
    marker.getLatLng().lat.toFixed(5) +
      ' Latitude, ' +
      marker.getLatLng().lng.toFixed(5) +
      ' Longitude'
  );
}

export function perKeyDist() {  //for getting distance per key press for mathematical calculations
  return (
    ((40075016 * Math.cos((this.getLatLng().lat * Math.PI) / 180)) /
      Math.pow(2, map.getZoom() + 8)) *
    10
  );
}
function pressEnter() { //for handling enter key press
  timeout && clearTimeout(timeout);
  timeout = setTimeout(() => {
    findplaceNamAandData
      .bind(this)(this)
      .then((place) => {
        notifySreenReader(place.name, true);
        placeappear(place.data);
      });
  }, 650);
}

function handleKeyDPress(event) {
  if (event.code !== 'KeyD') return;

  const now = Date.now();
  if (now - lastPressTime > 500) pressCount = 0; // Reset if timeout
  lastPressTime = now;
  pressCount++;

  const borderpoints = this._borderPoints;
  if (!this._geoJson) {
    console.log('No border found, Please try again');
    return notifySreenReader('No border found, Please try again', true);
  }

  const getDistance = (point) =>
    toKMorMeter(this.getLatLng().distanceTo(borderpoints[point]));

  const distances =
    pressCount === 1
      ? `${getDistance('east')} to east, ${getDistance('west')} to west`
      : `${getDistance('north')} to north, ${getDistance('south')} to south`;

  console.log(distances);
  notifySreenReader(distances, true);

  if (pressCount === 2) pressCount = 0; // Reset after second press
}
