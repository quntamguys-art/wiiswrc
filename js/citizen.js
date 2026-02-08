/*
 * CITIZEN.JS
 * Advanced Citizen Module
 */

const citizen = {
    username: null,
    trackerInterval: null,
    mapManager: null,

    init(u) {
        citizen.username = u;
        citizen.renderHome();
    },

    async renderHome() {
        const main = document.getElementById('main-view');
        main.innerHTML = Utils.getSkeletonList(1);

        const stats = await API.getCitizenStats(citizen.username);

        main.innerHTML = `
            <h2 class="animate-fade">Dashboard</h2>
            
            <div class="stats-grid animate-fade">
                <div class="stat-box">
                    <div class="stat-icon"><ion-icon name="wallet"></ion-icon></div>
                    <div>
                        <div class="text-lg font-bold">${stats.points}</div>
                        <div class="text-sm text-muted">Credits Earned</div>
                    </div>
                </div>
                <div class="stat-box">
                    <div class="stat-icon" style="background:#DBEAFE; color:var(--secondary)"><ion-icon name="trash"></ion-icon></div>
                    <div>
                        <div class="text-lg font-bold">${stats.totalKg} kg</div>
                        <div class="text-sm text-muted">Waste Contribution</div>
                    </div>
                </div>
            </div>

            <div class="card animate-slide">
                <div class="flex-between mb-4">
                    <h2>Live Tracking</h2>
                    <span class="text-sm text-primary flex-center"><span class="status-dot" style="margin-right:5px"></span> Live</span>
                </div>
                <div id="citizen-map" class="map-widget"></div>
                <p class="text-sm text-muted">Tracking Collector: <strong>Ram (Truck #1)</strong></p>
            </div>

            <div class="card">
                <h2>Report Garbage</h2>
                <form id="report-form" onsubmit="citizen.submitReport(event)">
                    <div class="mb-4">
                        <label class="text-sm font-bold">Type</label>
                        <select id="r-type" class="form-select mt-2">
                            <option>Plastic</option>
                            <option>Organic</option>
                            <option>E-Waste</option>
                        </select>
                    </div>
                     <div class="mb-4">
                        <label class="text-sm font-bold">Locality</label>
                        <input id="r-loc" class="form-input mt-2" placeholder="e.g. Baneshwor" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-full">Submit Report</button>
                </form>
            </div>
        `;

        // Init Map
        if (citizen.trackerInterval) clearInterval(citizen.trackerInterval);

        setTimeout(() => {
            citizen.mapManager = new MapManager('citizen-map');
            citizen.mapManager.init();

            // Start Tracking Simulation
            citizen.trackerInterval = setInterval(async () => {
                const trucker = await API.getNearbyCollector();
                citizen.mapManager.addMarker('c1', trucker.lat, trucker.lng, trucker.name, 'collector');
            }, 3000);
        }, 100);
    },

    async submitReport(e) {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.innerHTML = 'Submitting...';

        try {
            await API.submitReport({
                citizen: citizen.username,
                type: document.getElementById('r-type').value,
                location: document.getElementById('r-loc').value
            });
            Utils.toast('Report Sent Successfully!');
            e.target.reset();
        } catch (err) {
            Utils.toast('Error sending report', 'error');
        } finally {
            btn.innerHTML = 'Submit Report';
        }
    },

    async renderHistory() {
        const main = document.getElementById('main-view');
        main.innerHTML = Utils.getSkeletonList(3);

        const list = await API.getCitizenRequests(citizen.username);

        main.innerHTML = `<h2>Request History</h2><br>` + list.map(r => `
            <div class="card flex-between animate-slide">
                <div>
                    <strong>${r.type}</strong> <span class="text-sm text-muted">• ${Utils.formatDate(r.timestamp)}</span>
                    <div class="text-sm">${r.location}</div>
                </div>
                <div class="text-right">
                    <span class="text-sm font-bold ${r.status === 'verified' ? 'text-primary' : 'text-danger'}">${r.status.toUpperCase()}</span>
                    ${r.weight ? `<div>${r.weight} kg</div>` : ''}
                </div>
            </div>
        `).join('');
    },

    // --- Marketplace ---
    async renderMarketplace() {
        const main = document.getElementById('main-view');
        main.innerHTML = Utils.getSkeletonList(2);

        const items = await API.getMarketplaceItems();
        const stats = await API.getCitizenStats(citizen.username);

        main.innerHTML = `
            <div class="flex-between">
                <h2>♻️ EcoMarket</h2>
                <div class="status-badge status-verified flex-center" style="font-size:1rem; padding: 8px 15px;">
                    <ion-icon name="wallet" style="margin-right:8px"></ion-icon> ${stats.points} Pts
                </div>
            </div>
            <p class="text-muted mb-4">Redeem your hard-earned points for eco-friendly products.</p>
            
            <div class="stats-grid">
                ${items.map(i => `
                    <div class="card animate-fade flex-col flex-center" style="text-align:center">
                        <div style="font-size:3rem; margin-bottom:10px">${i.image}</div>
                        <h3>${i.name}</h3>
                        <p class="text-primary font-bold mb-4">${i.cost} Pts</p>
                        <button class="btn ${stats.points >= i.cost ? 'btn-primary' : 'btn-danger'}" 
                                style="width:100%" 
                                onclick="citizen.handleRedeem(${i.cost}, '${i.name}')"
                                ${stats.points < i.cost ? 'disabled' : ''}>
                                ${stats.points >= i.cost ? 'Redeem Now' : 'Need More Pts'}
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    },

    async handleRedeem(cost, name) {
        if (!confirm(`Redeem ${name} for ${cost} points?`)) return;

        const res = await API.redeemItem(citizen.username, cost, name);
        if (res.success) {
            Utils.toast(`Successfully redeemed ${name}!`);
            citizen.renderMarketplace(); // Refresh UI
        } else {
            Utils.toast(res.msg, 'error');
        }
    },

    // --- AI Waste Guide ---
    renderAI() {
        const main = document.getElementById('main-view');
        main.innerHTML = `
            <h2>🤖 AI Waste Segregator</h2>
            <p class="text-muted mb-4">Upload a photo of your trash, and our AI will tell you how to dispose of it.</p>
            
            <div class="card animate-slide" style="max-width: 500px; margin: 0 auto; text-align: center;">
                <div id="ai-preview" style="height: 200px; background: #f1f5f9; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; border: 2px dashed #cbd5e1;">
                    <span class="text-muted">No Image Selected</span>
                </div>
                
                <input type="file" id="ai-file" class="hidden" accept="image/*" onchange="citizen.handleAIPreview(event)">
                <button onclick="document.getElementById('ai-file').click()" class="btn btn-secondary w-full mb-4">
                    <ion-icon name="camera"></ion-icon> Select Image
                </button>
                
                <button id="ai-analyze-btn" onclick="citizen.analyzeImage()" class="btn btn-primary w-full" disabled>
                    Analyze Waste
                </button>
            </div>

            <div id="ai-result" class="hidden mt-4">
                <!-- Result injected here -->
            </div>
        `;
    },

    handleAIPreview(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('ai-preview').innerHTML = `<img src="${e.target.result}" style="max-height:100%; max-width:100%; border-radius:8px">`;
                document.getElementById('ai-analyze-btn').disabled = false;
            };
            reader.readAsDataURL(file);
        }
    },

    async analyzeImage() {
        const btn = document.getElementById('ai-analyze-btn');
        const resDiv = document.getElementById('ai-result');

        btn.innerHTML = 'Analyzing...';
        btn.disabled = true;
        resDiv.classList.add('hidden');

        const result = await API.analyzeWasteImage();

        resDiv.innerHTML = `
            <div class="card animate-fade" style="border-left: 5px solid var(--primary)">
                <h3>${result.type} <span class="text-sm font-normal text-muted">(${result.conf} Confidence)</span></h3>
                <p class="mt-2"><strong>Tip:</strong> ${result.tip}</p>
                <div class="mt-2 status-badge ${result.recyclable ? 'status-verified' : 'status-rejected'}" style="display:inline-block">
                    ${result.recyclable ? '✅ Recyclable' : '❌ Non-Recyclable'}
                </div>
            </div>
        `;
        resDiv.classList.remove('hidden');
        btn.innerHTML = 'Analyze Again';
        btn.disabled = false;
    },

    // --- Complaints ---
    async renderComplaints() {
        const main = document.getElementById('main-view');
        main.innerHTML = Utils.getSkeletonList(1);

        const history = await API.getComplaints(citizen.username);

        main.innerHTML = `
            <h2>📢 Complaints & Feedback</h2>
            
            <div class="card mt-4">
                <h3>Submit New Complaint</h3>
                <form onsubmit="citizen.submitComplaint(event)">
                    <textarea id="comp-text" class="form-input mt-2" rows="3" placeholder="Describe the issue (e.g. Bin overflowing at Park Ave)..." required></textarea>
                    <button type="submit" class="btn btn-danger mt-2">Report Issue</button>
                </form>
            </div>

            <h3>History</h3>
            <div class="mt-4">
                ${history.length ? history.map(h => `
                    <div class="card animate-fade" style="padding: 15px;">
                        <div class="flex-between">
                            <strong>${Utils.formatDate(h.date)}</strong>
                            <span class="status-badge status-pending">${h.status}</span>
                        </div>
                        <p class="mt-2">${h.text}</p>
                    </div>
                `).join('') : '<p class="text-muted">No complaints filed.</p>'}
            </div>
        `;
    },

    async submitComplaint(e) {
        e.preventDefault();
        const text = document.getElementById('comp-text').value;
        const btn = e.target.querySelector('button');

        btn.innerHTML = 'Sending...';
        await API.submitComplaint({ username: citizen.username, text });

        Utils.toast('Complaint Registered');
        citizen.renderComplaints(); // Redirect to list which essentially is "renderComplaints" or we can make a reusable
    },

    // --- Profile ---
    async renderProfile() {
        const main = document.getElementById('main-view');
        main.innerHTML = Utils.getSkeletonList(1);
        const stats = await API.getCitizenStats(citizen.username);

        main.innerHTML = `
            <h2>My Profile</h2>
            <div class="card mt-4 animate-fade">
                <div class="flex-center flex-col mb-4">
                    <div style="width:80px; height:80px; background:var(--primary-light); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:2rem;">👤</div>
                    <h3 class="mt-2">${citizen.username}</h3>
                    <p class="text-muted">Eco-Warrior Level 1</p>
                </div>

                <form onsubmit="citizen.updateProfile(event)">
                    <div class="mb-4">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" value="${citizen.username.toLowerCase()}@example.com">
                    </div>
                    <div class="mb-4">
                        <label class="form-label">Phone</label>
                        <input type="tel" class="form-input" value="+977-9800000000">
                    </div>
                    <button type="submit" class="btn btn-primary w-full">Update Profile</button>
                </form>

                <div class="mt-4" style="border-top:1px solid #eee; padding-top:20px">
                    <h4>Impact Stats</h4>
                    <div class="flex-between mt-2">
                        <span>Total Recycled:</span>
                        <strong>${stats.totalKg} kg</strong>
                    </div>
                    <div class="flex-between mt-2">
                         <span>Carbon Saved:</span>
                        <strong>${(stats.totalKg * 1.5).toFixed(1)} kg CO2</strong>
                    </div>
                </div>
            </div>
        `;
    },

    async updateProfile(e) {
        e.preventDefault();
        Utils.toast('Profile Updated Successfully!');
    },

    // --- Notifications ---
    async renderNotifications() {
        const main = document.getElementById('main-view');
        main.innerHTML = Utils.getSkeletonList(2);

        const announcements = await API.getAnnouncements();
        // Also get complaints with replies
        const complaints = await API.getComplaints(citizen.username);
        const resolved = complaints.filter(c => c.status === 'Resolved');

        let html = `<h2>Notifications</h2><div class="mt-4">`;

        if (announcements.length === 0 && resolved.length === 0) {
            html += `<p class="text-muted">No new notifications.</p>`;
        } else {
            html += announcements.map(a => `
                <div class="card animate-slide" style="border-left:4px solid var(--accent)">
                    <div class="flex-between">
                        <h4>📢 ${a.title}</h4>
                        <small class="text-muted">${Utils.formatDate(a.date)}</small>
                    </div>
                    <p class="mt-2">${a.msg}</p>
                </div>
            `).join('');

            html += resolved.map(r => `
                 <div class="card animate-slide" style="border-left:4px solid var(--primary)">
                    <div class="flex-between">
                        <h4>✅ Complaint Resolved</h4>
                        <small class="text-muted">${Utils.formatDate(r.date)}</small>
                    </div>
                    <p class="mt-2 text-muted">Original: ${r.text}</p>
                    <p class="mt-2"><strong>Admin Reply:</strong> ${r.reply}</p>
                </div>
            `).join('');
        }

        html += `</div>`;
        main.innerHTML = html;
    }
};
