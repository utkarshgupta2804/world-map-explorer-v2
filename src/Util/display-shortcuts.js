import { handleKeyDownK } from "./key-shortcuts.js";

export const keys = document.createElement('div');
keys.id = 'keys';
keys.setAttribute('role', 'alert');
keys.setAttribute('aria-label', 'keys');

export const keysText = document.createElement('p');
keysText.setAttribute("tabindex", 1);
keysText.setAttribute("aria-atom","true");
keysText.id = 'keysTextc';
const keysTextContainer = document.createElement('div');
keysTextContainer.id='keysText';
keysText.innerHTML = `<h2>Keyboard Shortcuts for World Map Explorer</h2>
<p>Use browse mode to navigate throgh each list item following using arrow keys</p>
<ol>
    <li><strong>Alt + M</strong>: Focus on the map</li>
    <li><strong>ORCA Modifier + A</strong>: Switch between browse mode and focus mode in Ubuntu</li>
    <li><strong>NVDA Modifier + Space</strong>: Turn on/off scan mode in Windows</li>
    <li>Use <strong>Arrow Keys</strong> to navigate using marker</li>
    <li><strong>Alt + S</strong>: Toggle search bar</li>
    <li><strong>F</strong>: Announce the name of the current location of marker</li>
    <li><strong>Shift + F</strong>: Announce the coordinates of the current location</li>
    <li><strong>Enter</strong>: Select the current location of the pointer</li>
    <li><strong>+ or =</strong>: Zoom in</li>
    <li><strong>-</strong>: Zoom out</li>
    <li><strong>Z</strong>: Know the distance traveled by the cursor in one key press</li>
    <li><strong>A</strong>: Announce the altitude of the current place</li>
    <li><strong>L</strong>: Reset the cursor to the user's location (if location permission is enabled)</li>
    <li><strong>Shift + Up</strong>: Know the distance to the northern border</li>
    <li><strong>Shift + Down</strong>: Know the distance to the southern border</li>
    <li><strong>Shift + Right</strong>: Know the distance to the eastern border</li>
    <li><strong>Shift + Left</strong>: Know the distance to the western border</li>
    <li><strong>J</strong>: Activate adjustable pointer or marker</li>
    <li><strong>UpArrow and DownArrow</strong> (when adjustable pointer is active): Increase or decrease distance</li>
    <li><strong>LeftArrow and RightArrow</strong> (when adjustable pointer is active): Increase or decrease angle</li>
    <li><strong>F</strong>: Announce details of the place indicated by the adjustable pointer</li>
    <li><strong>Alt + L</strong>: Select the current location as the initial or final location in distance finder</li>
    <li><strong>Enter</strong> (when adjustable pointer is active): Move the marker to the location pointed by the adjustable pointer</li>
    <li><strong>Alt + K</strong> To check keyboard shortcuts anytime</li>
    <li><strong>Ctrl + Alt + G</strong> To turn on distance finder</li>
</ol>
`;


const closeButtonK = document.createElement('button');
closeButtonK.id = 'close-button-k';
closeButtonK.setAttribute('aria-label', 'Close keys');
closeButtonK.textContent = 'X';

  closeButtonK.addEventListener('click', () => {
    document.removeEventListener('keydown', handleKeyDownK);
    keys.remove();
    closeSound.play()
  });
  
  keysText.appendChild(closeButtonK);
  
  keysTextContainer.appendChild(keysText);
  keys.appendChild(keysTextContainer);
