import { removeResults } from './doSearch.js';

export function generalEvents(event) { //for general events, always bind this to document, this function closes the search results when clicked outside the search results
  if (
    !(
      event.target.closest('.box-input') ||
      event.target.closest('#search-results')
    )
  ) {
    removeResults();
  }
}
