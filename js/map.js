/*
 * MAP.JS
 * Wrapper for Leaflet.js interactions
 */

class MapManager {
    constructor(containerId) {
        this.containerId = containerId;
        this.map = null;
        this.markers = {};
        this.userMarker = null;
    }

    init(lat = 27.7172, lng = 85.3240) { // Default: Kathmandu
        if (!document.getElementById(this.containerId)) return;

        // Prevent re-initialization
        if (this.map) {
            this.map.remove();
        }

        this.map = L.map(this.containerId).setView([lat, lng], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(this.map);

        // Fix Leaflet sizing icon issues
        this._fixIcon();
    }

    addMarker(id, lat, lng, popupText, type = 'default') {
        const iconUrl = type === 'collector'
            ? 'https://cdn-icons-png.flaticon.com/512/3721/3721869.png' // Truck Icon
            : 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';

        const customIcon = L.icon({
            iconUrl: iconUrl,
            iconSize: type === 'collector' ? [32, 32] : [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34]
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(this.map);
        if (popupText) marker.bindPopup(popupText);

        this.markers[id] = marker;
        return marker;
    }

    updateMarker(id, lat, lng) {
        if (this.markers[id]) {
            this.markers[id].setLatLng([lat, lng]);
        }
    }

    enableClickToPick(callback) {
        this.map.on('click', (e) => {
            const { lat, lng } = e.latlng;

            // Move User Marker
            if (this.userMarker) this.map.removeLayer(this.userMarker);
            this.userMarker = L.marker([lat, lng]).addTo(this.map);

            callback(lat, lng);
        });
    }

    _fixIcon() {
        // Leaflet default icon path fix for simple implementations
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        });
    }
}
