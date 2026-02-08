/*
 * COLLECTOR.JS
 */

const collector = {
    init() {
        collector.renderTasks();
    },

    async renderTasks() {
        const main = document.getElementById('main-view');
        main.innerHTML = Utils.getSkeletonList(2);

        const tasks = await API.getCollectorRequests();

        main.innerHTML = `<h2>Pending Collections</h2><br>` +
            (tasks.length ? tasks.map(t => `
            <div class="card animate-fade" id="task-${t.id}">
                <div class="flex-between">
                    <h3>${t.citizen}</h3>
                    <span class="text-sm text-muted">${Utils.formatDate(t.timestamp)}</span>
                </div>
                <p class="mb-4">${t.location} • <strong>${t.type}</strong></p>
                
                <div class="flex-center" style="gap:10px">
                    <input id="w-${t.id}" class="form-input" type="number" placeholder="Weight (kg)">
                    <button class="btn btn-primary" onclick="collector.collect('${t.id}')">Collect</button>
                </div>
            </div>
        `).join('') : `<p class="text-muted">No pending tasks.</p>`);
    },

    async collect(id) {
        const w = document.getElementById(`w-${id}`).value;
        if (!w) return Utils.toast('Please enter weight', 'error');

        const el = document.getElementById(`task-${id}`);
        el.style.opacity = '0.5';

        try {
            await API.collectGarbage(id, w);
            Utils.toast('Collection Recorded');
            el.remove();
        } catch (e) {
            Utils.toast('Failed', 'error');
            el.style.opacity = '1';
        }
    },

    renderMap() {
        const main = document.getElementById('main-view');
        main.innerHTML = `
            <h2>Mission Map</h2>
            <div id="col-map" class="map-widget mt-4" style="height:500px"></div>
        `;

        setTimeout(async () => {
            const map = new MapManager('col-map');
            map.init();

            // Plot Tasks
            const tasks = await API.getCollectorRequests();
            tasks.forEach(t => {
                // Mock LatLng if missing, usually API returns it
                const lat = 27.7172 + (Math.random() - 0.5) * 0.02;
                const lng = 85.3240 + (Math.random() - 0.5) * 0.02;
                map.addMarker(t.id, lat, lng, `<b>${t.citizen}</b><br>${t.type}`);
            });
        }, 100);
    },

    async renderPerformance() {
        const main = document.getElementById('main-view');
        main.innerHTML = `
            <h2>My Performance</h2>
            <div class="stats-grid mt-4 animate-fade">
                <div class="stat-box">
                    <div class="stat-icon"><ion-icon name="trophy"></ion-icon></div>
                    <h3>Rank #1</h3>
                </div>
                <div class="stat-box">
                    <div class="stat-icon" style="background:var(--primary-light)"><ion-icon name="checkmark-circle"></ion-icon></div>
                    <h3>98% Success</h3>
                </div>
            </div>
            
            <div class="card mt-4">
                <h3>Weekly Activity</h3>
                <div class="flex-center" style="height:200px; color:#999; border:2px dashed #eee; border-radius:8px">
                    Chart Visualization Placeholder
                </div>
            </div>
        `;
    }
};
