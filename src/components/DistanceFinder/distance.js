import { 
  startingLocationElement, 
  calculateDistance, 
  closeDistanceFinder, 
  destinationLocationElement, 
  handleDestinationSearch, 
  handleStartingLocationSearch 
} from "./distanceFinder.js";

import { detailsCloseButton, distanceBox, distanceIcon } from "../Util/DOM.js";
import { successSound } from "../Util/sounds.js";
import { adjustablePointer } from "../AdjPointer/adjustablePointer.js";

// Tracks the currently focused input element (starting or destination location)
let activeInputElement = null;
// Coordinates for the starting and destination locations
let beginningLocation, destinationLocation;
// Button to trigger distance calculation
const findDistanceButton = document.getElementById("find");

/**
 * Sets up event listeners for a search action triggered by an input element and a button.
 * @param {HTMLElement} inputElement - The input element for entering a location.
 * @param {string} buttonId - The ID of the button associated with the search action.
 * @param {Function} searchHandler - The function to execute for the search action.
 */
const setupSearchEventListeners = (inputElement, buttonId, searchHandler) => {
  inputElement.addEventListener("keydown", (event) => {
    if (event.key === "Enter") searchHandler();
  });

  document.getElementById(buttonId)?.addEventListener("click", searchHandler);
};

/**
 * Initializes all event listeners related to the distance finder feature.
 */
export const initialize_DistanceFinder_EventListeners = () => {
  // Opens the distance box and cleans up previous actions
  distanceIcon.addEventListener("click", () => {
    distanceBox.style.display = "block";
    detailsCloseButton?.click(); // Closes the details box if open
    if (adjustablePointer) {
      adjustablePointer.remove(); // Removes any active pointer on the map
      adjustablePointer = null;
    }
    successSound.play(); // Plays a sound to indicate action completion
  });

  // Sets up event listeners for searching starting and destination locations
  setupSearchEventListeners(startingLocationElement, "b-searchbutton", handleStartingLocationSearch);
  setupSearchEventListeners(destinationLocationElement, "d-searchbutton", handleDestinationSearch);

  // Tracks the currently focused input element for starting or destination location
  [startingLocationElement, destinationLocationElement].forEach((inputElement) => {
    inputElement.addEventListener("focus", () => {
      activeInputElement = document.activeElement;

    });
  });

  // Handles selecting a location from the map
  document.getElementById("fromMap")?.addEventListener("click", () => {
    if (!marker) return; // Ensures a marker exists on the map

    try {
      const { lat, lng } = marker.getLatLng();
      activeInputElement.value = `${lat},${lng}`; // Updates the active input with the selected coordinates
      const selectedLocation = { lat, lon: lng };

      // Updates the appropriate variable based on the focused input
      if (activeInputElement.id === "beginning") {
        beginningLocation = selectedLocation;
      } else {
        destinationLocation = selectedLocation;
      }

      successSound.play(); // Plays a sound to confirm selection
    } catch (error) {
      console.error("Error selecting location from map:", error);
      alert("Focus on the starting point or destination then select point on map");
    }
  });

  // Closes the distance finder box
  document.getElementById("closeBtn")?.addEventListener("click", closeDistanceFinder);

  // Adds a keyboard shortcut to trigger the "select from map" action
  distanceBox.addEventListener("keydown", (event) => {
    if (event.altKey && event.key === "l") {
      event.preventDefault();
      document.getElementById("fromMap")?.click(); // Simulates clicking the "fromMap" button
    }
  });

  // Triggers distance calculation when the "find" button is clicked
  findDistanceButton.addEventListener("click", calculateDistance.bind(findDistanceButton));
};

// Initialize all event listeners
