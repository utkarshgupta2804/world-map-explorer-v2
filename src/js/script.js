import { detailsCloseButton } from '../components/DOM.js';
import {mainsearchbar} from '../components/doSearch.js'

document.getElementById("search-input").addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { // Check if the Enter key was pressed
      //event.preventDefault();  // Prevent the default form submission (if needed)
      //console.log(this)
      mainsearchbar()
  
    }
  });
  document.getElementById("searchbutton").addEventListener('click', function(e){
    mainsearchbar()
  
  })

  detailsCloseButton.addEventListener('click', function () {
    closeSound.play()
    document.getElementById("searchdetails").style.display = "none";
    if (geoLayer != null) {
      geoLayer.remove();
    }
    //document.getElementById("searchdetails").innerHTML = "";
  
  })