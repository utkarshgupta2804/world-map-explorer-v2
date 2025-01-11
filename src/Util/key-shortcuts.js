
import { successSound } from "./sounds.js";
import { distanceBox, distanceIcon, input } from "./dom-elements.js";
import { map } from "../components/map.js";
import { keys, keysText } from "./display-shortcuts.js";
import { notifySreenReader } from "./accessibility.js";

let active = -1


export function handleKeyDownOnDocument(event) { //for key shortcuts related to document
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
        //for geting key shortcuts
        document.body.prepend(keys);
        successSound.play();
        document.addEventListener("keydown", handleKeyDownK);

        setTimeout(() => {
            keysText.focus();
        }, 0);
    }
    if (event.altKey && event.code == "KeyM") {
        //for stating altitude
        map.getContainer().focus();
    }
    if (event.ctrlKey && event.altKey && event.code == "KeyG") {
        //
        event.preventDefault();

        console.log("gggg");
        distanceIcon.click();
        distanceBox.focus();
    }
};



export function keyboardselect(e){ 
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







export function handleKeyDownK(event) {
    if (event.keyCode === 9) {
      event.preventDefault();
        if(document.activeElement.id === 'keysTextc'){
          closeButtonK.focus();
          console.log('close button focused')
        }
        else{
          keysText.focus();
          console.log('keysText focused')
        }
    }
  }

  export function perKeyDist(){
        perkeydist = (((40075016 * Math.cos((marker.getLatLng().lat * Math.PI) / 180)) /
                    Math.pow(2, map.getZoom() + 8)) *
                10);

  }