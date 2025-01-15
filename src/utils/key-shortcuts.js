
import { distanceBox, distanceIcon, input } from "./dom-elements.js";
import { map } from "../components/map.js";
import { displayKeyShortcuts } from "./show-key-shortcuts.js";
import { notifySreenReader } from "./accessibility.js";

let active = -1


export function handleKeyDownOnDocument(event) { //for key shortcuts for the whole application
    if (event.code == "Escape") {
        document.getElementById("closeBtnD").click(); // close search details box
        document.getElementById("closeBtn").click(); // close search details box
        notifySreenReader(`closed`, false, "assertive");
    }
    if (event.altKey && event.code === "KeyS") {
        event.preventDefault();
        // Focus on the search bar element
        input?.focus(); 
    }
    if (event.altKey && event.code == "KeyK") {
      event.preventDefault()
        //for geting key shortcuts
       displayKeyShortcuts()
    }
    if (event.altKey && event.code == "KeyM") {
        //for stating altitude
        map.getContainer().focus();
    }
    if (event.ctrlKey && event.altKey && event.code == "KeyG") {
        //
        event.preventDefault();
        distanceIcon.click();
        distanceBox.focus();
    }
};



export function keyboardselect(e){  //function for arrow key navigation in search results
    if (e.keyCode == 40) {
    e.preventDefault()
      if (active < this.querySelector("#search-results").children.length-1) {
        active++
        this.querySelector("#search-results").children[active].focus()
      }
    }else if(e.keyCode == 38){
    e.preventDefault()
  
      if (active > 0) {
        active--
        this.querySelector("#search-results").children[active].focus()
      }
    }else if(e.keyCode == 13){
    e.preventDefault()
        active=-1
      document.activeElement?.click()
  
    }
  }


export function lockTabKey(event, text, closeButton) {
    if (event.keyCode === 9) {
  
        if(document.activeElement=== text){
          closeButton.focus();
          console.log('close button focused')
      event.preventDefault();
  
        }
        else if(document.activeElement=== closeButton){
          text.focus();
          console.log('message focused')
      event.preventDefault();
  
        }
    }
  }

  export function perKeyDist(){
        perkeydist = (((40075016 * Math.cos((marker.getLatLng().lat * Math.PI) / 180)) /
                    Math.pow(2, map.getZoom() + 8)) *
                10);

  }