/* 
 * Copyright (c) 2023-25 Zendalona
 * This software is licensed under the GPL-3.0 License.
 * See the LICENSE file in the root directory for more information.
  */
import { map } from "../components/map.js";


export function fetchCurrentLocation() {
    map.locate({ setView: true, maxZoom: 16 , enableHighAccuracy: true});
}
