import { notifyLoading, notifySreenReader } from "../utils/accessibility.js";
import { keyboardselect } from "../utils/keydown-helpers.js";
import { successSound } from "../utils/sounds.js";
import { geocodingAPI, headerofNominatim } from "../utils/to-km-or-meter.js";

var placeIds = [];

let cancelSearch = false; // Flag to cancel the operation from outside
let searchLoadingInterval; // To store the interval globally for cancellation

export function performSearch(inputField, excludedPlaceIds = []) {
  return new Promise((resolve, reject) => {
    const query = inputField.value.trim();
    const loadingMessage = `<li style="justify-content: center;"><i class="fas fa-circle-notch fa-spin"></i></li>`;

    // Clear results if query length is insufficient
    if (query.length <= 2) {
      removeResults();
      return;
    }

    // Initialize the search results container
    let resultsContainer = initializeResultsContainer(inputField);

    // Display loading indicator
    resultsContainer.innerHTML = loadingMessage;

    // Start loading indication
    searchLoadingInterval = setInterval(() => {
      notifyLoading();
    }, 2000);

    // Create a timeout that will reject after 15 seconds
    const timeoutPromise = new Promise((_, rejectTimeout) => {
      setTimeout(() => {
        if (!cancelSearch) {
          removeResults();
          rejectTimeout(new Error("Search timed out after 15 seconds"));
        }
      }, 15000);
    });

    // Fetch search results with timeout and cancellation handling
    const fetchPromise = fetchSearchResults(query, excludedPlaceIds)
      .then((data) => {
        if (cancelSearch) return; // If cancelled, exit early
        clearInterval(searchLoadingInterval); // Clear the loading interval
        renderSearchResults(data, resultsContainer, inputField, resolve); // Process and display results
      })
      .catch((error) => {
        if (cancelSearch) return; // If cancelled, exit early
        clearInterval(searchLoadingInterval); // Clear the loading interval
        console.error("Error fetching search results:", error);
        reject(error);
      });

    // Use Promise.race to ensure the function exits after 15 seconds
    Promise.race([fetchPromise, timeoutPromise])
      .finally(() => {
        clearInterval(searchLoadingInterval); // Ensure the interval is cleared in all cases
      });
  });
}

// Function to cancel the search
function cancelPerformSearch() {
  cancelSearch = true; // Set flag to true to cancel the operation
  if (searchLoadingInterval) {
    clearInterval(searchLoadingInterval); // Clear the loading interval
  }
}

  
  // Initializes the search results container
  function initializeResultsContainer(inputField) {
    let container = inputField.nextElementSibling;
    if (!container || container.tagName !== "UL") {
      container = document.createElement("ul");
      container.id = "search-results";
      container.tabIndex = 7;
      container.setAttribute("aria-label", "Select your result");
      inputField.parentElement.parentNode.insertBefore(
        container,
        inputField.parentNode.nextSibling
      );
    }
    container.parentElement.addEventListener("keydown", keyboardselect);
    return container;
  }
  
  // Fetches search results from the API
  function fetchSearchResults(query, excludedPlaceIds) {
    const url = `${geocodingAPI}/search?q=${encodeURIComponent(
      query
    )}&format=jsonv2&exclude_place_ids=${encodeURIComponent(excludedPlaceIds)}`;
  
    return fetch(url,headerofNominatim).then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
  }
  
  // Renders search results in the results container
  function renderSearchResults(data, container, inputField, resolve) {
    successSound.play();
    notifySreenReader("Select from result");
    container.innerHTML = "";
  
    if (data.length === 0) {
      addNoResultsMessage(container);
      return;
    }
  
    let currentPlaceIds = data.map((result, index) => {
      const listItem = createResultListItem(result, () => resolve(result));
      container.appendChild(listItem);
      return result.place_id;
    });
    placeIds = placeIds.concat(currentPlaceIds);
  
    addMoreResultsOption(container, inputField, placeIds, resolve);
  }
  
  // Adds a "No Results Found" message
  function addNoResultsMessage(container) {
    const noResultsItem = document.createElement("li");
    noResultsItem.textContent = "No results found";
    container.appendChild(noResultsItem);
  }
  
  // Adds a "More Results" option
  function addMoreResultsOption(container, inputField, placeIds, resolve) {
    const moreResultsItem = document.createElement("li");
    moreResultsItem.textContent = "More results";
    moreResultsItem.tabIndex = 1;
    moreResultsItem.addEventListener("click", () => {
    removeResults();
      performSearch(inputField, placeIds).then(resolve);
      inputField.focus();
      container.scrollTop = 0;
    });
    container.appendChild(moreResultsItem);
  }
  
  // Creates a search result list item
  function createResultListItem(result, onClick) {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <span style="color: grey; display: flex;">${result.type}&nbsp</span>
      ${result.display_name}`;
    listItem.setAttribute("aria-label", result.display_name);
    listItem.tabIndex = 1;
    listItem.addEventListener("click", onClick);
    return listItem;
  }

  export function removeResults(){
    if(document.getElementById("search-results")){
      document.getElementById("search-results")?.parentElement?.removeEventListener('keydown', keyboardselect)
      document.getElementById("search-results")?.remove();
      cancelPerformSearch();
    }
  }