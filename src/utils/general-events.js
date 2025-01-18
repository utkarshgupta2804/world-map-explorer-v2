/* 
 * Copyright (c) 2023-25 Zendalona
 * This software is licensed under the GPL-3.0 License.
 * See the LICENSE file in the root directory for more information.
  */
import { removeResults } from '../services/do-search.js';

export function closeSearchResultsOnClickOutside(event) { //for general events, always bind this to document, this function closes the search results when clicked outside the search results
  if (
    !(
      event.target.closest('.box-input') ||
      event.target.closest('#search-results')
    )
  ) {
    removeResults();
  }
}

