/*
 * ADMIN.JS
 * Enhanced with Chart.js and IoT
 */

const admin = {
    chartInstance: null,

    init() {
        admin.renderStats();
    },

    async renderStats() {
        const main = document.getElementById('main-view');
        main.innerHTML = Utils.getSkeletonList(1);

        const s = await API.getAdminStats();

        main.innerHTML = `
            <h2>System Overview</h2>
            <div class="stats-grid mt-4 animate-fade">
                <div class="stat-box">
                    <div class="stat-icon"><ion-icon name="people"></ion-icon></div>
                    <h3>${s.users} Users</h3>
                </div>
                <div class="stat-box">
                    <div class="stat-icon" style="background:var(--primary-light)"><ion-icon name="cube"></ion-icon></div>
                    <h3>${s.collected} kg</h3>
                </div>
                 <div class="stat-box">
                    <div class="stat-icon" style="background:#FEF3C7; color:var(--accent)"><ion-icon name="documents"></ion-icon></div>
                    <h3>${s.requests} Requests</h3>
                </div>
            </div>
            
            <div class="card animate-slide">
                <div class="flex-between mb-4">
                    <h3>Collection Analytics</h3>
                    <select class="form-select" style="width:150px"><option>Last 7 Days</option></select>
                </div>
                <div style="height:300px; position:relative;">
                    <canvas id="adminChart"></canvas>
                </div>
            </div>
        `;

        // Init Chart
        const ctx = document.getElementById('adminChart').getContext('2d');
        if (admin.chartInstance) admin.chartInstance.destroy();

        admin.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: s.chartData.labels,
                datasets: [{
                    label: 'Waste Collected (kg)',
                    data: s.chartData.waste,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Recycled (kg)',
                    data: s.chartData.recycling,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    },

    async renderUsers() {
        const main = document.getElementById('main-view');
        main.innerHTML = Utils.getSkeletonList(2);

        const users = await API.getUsers();

        main.innerHTML = `
            <h2>User Management</h2>
            <div class="card mt-4 animate-fade">
                <table style="width:100%; border-collapse:collapse;">
                    <thead>
                        <tr style="text-align:left; border-bottom:2px solid #eee;">
                            <th style="padding:10px">User</th>
                            <th>Points</th>
                            <th>Kg Saved</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(u => `
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:15px">
                                    <div class="flex-center" style="justify-content:flex-start; gap:10px">
                                        <div style="width:30px; height:30px; background:#e2e8f0; border-radius:50%; display:flex; align-items:center; justify-content:center;">👤</div>
                                        <strong>${u.name}</strong>
                                    </div>
                                </td>
                                <td>${u.points}</td>
                                <td>${u.totalKg}</td>
                                <td>
                                    <button class="btn btn-secondary" style="padding:5px 10px; font-size:0.8rem" onclick="Utils.toast('Reset Password sent!')">Reset</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    async renderIoT() {
        const main = document.getElementById('main-view');
        main.innerHTML = Utils.getSkeletonList(2);

        const bins = await API.getIoTData();

        main.innerHTML = `
            <h2>Smart Bins (IoT)</h2>
            <p class="text-muted mb-4">Real-time fill levels from sensors.</p>
            
            <div class="stats-grid">
                ${bins.map(b => `
                    <div class="card animate-fade flex-col flex-center" style="text-align:center; position:relative; overflow:hidden;">
                        <div style="position:absolute; top:0; left:0; height:100%; width:100%; z-index:0;">
                            <div style="height:100%; width:100%; background:linear-gradient(to top, ${b.level > 80 ? '#FECACA' : '#D1FAE5'} ${b.level}%, transparent ${b.level}%); opacity:0.3"></div>
                        </div>
                        
                        <div style="z-index:1; width:100%">
                            <div class="flex-between w-full mb-4">
                                <span class="status-badge ${b.status === 'Online' ? 'status-verified' : 'status-rejected'}">${b.status}</span>
                                <small>${b.id}</small>
                            </div>
                            <h1 style="font-size:3rem; margin:10px 0;">${b.level}%</h1>
                            <p class="font-bold">${b.location}</p>
                            <p class="text-sm text-muted">${b.level > 90 ? 'CRITICAL FILL' : 'Normal'}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    async renderVerify() {
        const main = document.getElementById('main-view');
        main.innerHTML = Utils.getSkeletonList(3);

        const all = await API.getAllRequests();
        const pending = all.filter(r => r.status === 'collected');

        main.innerHTML = `<h2>Verification Queue</h2><br>` +
            (pending.length ? pending.map(r => `
            <div class="card flex-between animate-slide" id="v-${r.id}">
                <div>
                     <h3>${r.citizen}</h3>
                     <p class="text-sm">${r.weight} kg • ${r.type}</p>
                </div>
                <div class="flex-center" style="gap:5px">
                    <button class="btn btn-primary" onclick="admin.doVerify('${r.id}', true)">Accept</button>
                    <button class="btn btn-danger" onclick="admin.doVerify('${r.id}', false)">Reject</button>
                </div>
            </div>
        `).join('') : `<p>No items to verify.</p>`);
    },

    renderLiveMap() {
        const main = document.getElementById('main-view');
        main.innerHTML = `
            <h2>Live City View</h2>
            <div id="admin-map" class="map-widget mt-4" style="height:500px"></div>
         `;
        setTimeout(() => {
            const m = new MapManager('admin-map');
            m.init();
            m.addMarker('c1', 27.7172, 85.3240, 'Collector 1', 'collector');
            m.addMarker('c2', 27.7200, 85.3300, 'Collector 2', 'collector');

            // Random Citizen Markers
            m.addMarker('u1', 27.7180, 85.3250, 'Citizen Request');
            m.addMarker('u2', 27.7160, 85.3220, 'Citizen Request');
        }, 100);
    },

    async doVerify(id, status) {
        document.getElementById(`v-${id}`).style.opacity = '0.5';
        await API.verifyCollection(id, status);
        Utils.toast(status ? 'Approved & Credits Sent' : 'Rejected');
        admin.renderVerify();
    },

    // --- Feedback Mgmt ---
    async renderFeedback() {
        const main = document.getElementById('main-view');
        main.innerHTML = Utils.getSkeletonList(2);

        const all = await API.getComplaints(); // Get all
        const pending = all.filter(c => c.status === 'Pending');

        main.innerHTML = `
            <h2>Citizens Feedback</h2>
            <div class="mt-4">
                ${pending.length ? pending.map(c => `
                    <div class="card animate-fade" id="comp-${c.id}">
                        <div class="flex-between">
                            <strong>${c.username}</strong>
                            <span class="text-sm text-muted">${Utils.formatDate(c.date)}</span>
                        </div>
                        <p class="mt-2 mb-4">${c.text}</p>
                        <div class="flex-center" style="gap:10px">
                            <input id="reply-${c.id}" class="form-input" placeholder="Wrtie a reply...">
                            <button class="btn btn-primary" onclick="admin.handleReply('${c.id}')">Reply & Close</button>
                        </div>
                    </div>
                `).join('') : '<div class="card"><p class="text-muted">No pending complaints.</p></div>'}
            </div>
            
            <h3 class="mt-4">Resolved History</h3>
            <div class="card mt-2" style="max-height: 200px; overflow-y:auto">
                <ul style="padding-left:20px; color:#666">
                    ${all.filter(c => c.status === 'Resolved').map(c => `<li>${c.text} (Replied)</li>`).join('')}
                </ul>
            </div>
        `;
    },

    async handleReply(id) {
        const txt = document.getElementById(`reply-${id}`).value;
        if (!txt) return Utils.toast('Reply text required', 'error');

        await API.replyToComplaint(id, txt);
        Utils.toast('Reply Sent');
        admin.renderFeedback();
    },

    // --- Announcements ---
    async renderAnnouncements() {
        const main = document.getElementById('main-view');
        main.innerHTML = `
            <h2>Broadcast Announcements</h2>
            <div class="card mt-4">
                <div class="mb-4">
                    <label class="form-label">Title</label>
                    <input id="ann-title" class="form-input" placeholder="e.g. No Pickup Tomorrow">
                </div>
                <div class="mb-4">
                    <label class="form-label">Message</label>
                    <textarea id="ann-msg" class="form-input" rows="4" placeholder="Details..."></textarea>
                </div>
                <button class="btn btn-secondary" onclick="admin.sendBroadcast()">🚀 Send Broadcast</button>
            </div>
            
            <h3 class="mt-4">Previous Broadcasts</h3>
             <div class="mt-2" id="ann-history">...</div>
        `;
        admin.loadAnnHistory();
    },

    async sendBroadcast() {
        const title = document.getElementById('ann-title').value;
        const msg = document.getElementById('ann-msg').value;

        if (!title || !msg) return Utils.toast('Fill all fields', 'error');

        await API.sendAnnouncement(title, msg);
        Utils.toast('Announcement Sent to All Users');
        document.getElementById('ann-title').value = '';
        document.getElementById('ann-msg').value = '';
        admin.loadAnnHistory();
    },

    async loadAnnHistory() {
        const hist = await API.getAnnouncements();
        document.getElementById('ann-history').innerHTML = hist.map(h => `
            <div class="card" style="padding:10px; margin-bottom:10px">
                <strong>${h.title}</strong> - <span class="text-muted">${Utils.formatDate(h.date)}</span>
                <p>${h.msg}</p>
            </div>
        `).join('');
    },

    async renderMarketplaceAdmin() {
        const main = document.getElementById('main-view');
        main.innerHTML = Utils.getSkeletonList(1);

        const items = await API.getMarketplaceItems();

        main.innerHTML = `
            <h2>Manage Marketplace</h2>
            <div class="card mt-4">
                <h3>Add New Product</h3>
                <div class="flex-col mt-2">
                    <input id="mp-name" class="form-input mb-2" placeholder="Product Name">
                    <input id="mp-cost" class="form-input mb-2" type="number" placeholder="Cost (Pts)">
                    <input id="mp-icon" class="form-input mb-2" placeholder="Emoji Icon (e.g. 🎒)">
                    <button class="btn btn-primary" onclick="admin.addItem()">Add Product</button>
                </div>
            </div>
            
            <h3 class="mt-4">Current Inventory</h3>
            <div class="stats-grid mt-2">
                ${items.map(i => `
                    <div class="card flex-center flex-col">
                        <div style="font-size:2rem">${i.image}</div>
                        <strong>${i.name}</strong>
                        <span class="text-muted">${i.cost} Pts</span>
                    </div>
                `).join('')}
            </div>
         `;
    },

    async addItem() {
        const name = document.getElementById('mp-name').value;
        const cost = document.getElementById('mp-cost').value;
        const icon = document.getElementById('mp-icon').value;

        if (!name || !cost) return Utils.toast('Review fields', 'error');

        await API.addMarketplaceItem({ name, cost, image: icon || '📦' });
        Utils.toast('Product Added');
        admin.renderMarketplaceAdmin();
    }
};
