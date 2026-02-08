/* 
 * API.JS (Enhanced)
 * Supports Locations, Delays, and Advanced Mocking
 */

const API = {
    delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    _getDB: () => ({
        requests: JSON.parse(localStorage.getItem('sgc_requests') || '[]'),
        users: JSON.parse(localStorage.getItem('sgc_users') || '{}'),
        // Mock Active Collectors
        collectors: {
            'collector1': { lat: 27.7172, lng: 85.3240, name: 'Ram (Truck #1)' },
            'collector2': { lat: 27.7200, lng: 85.3300, name: 'Sita (Truck #2)' },
        }
    }),

    _saveDB: (db) => {
        localStorage.setItem('sgc_requests', JSON.stringify(db.requests));
        localStorage.setItem('sgc_users', JSON.stringify(db.users));
        // We don't save mock collectors to LS for simplicity, they reset on reload
    },

    // --- Auth ---
    async login(username, role) {
        await this.delay(600);
        return {
            success: true,
            token: 'jwt-' + Date.now(),
            user: { username, role }
        };
    },

    // --- Citizen Features ---
    async getCitizenStats(username) {
        await this.delay(400);
        const db = this._getDB();
        return db.users[username] || { points: 0, totalKg: 0 };
    },

    async getCitizenRequests(username) {
        await this.delay(500);
        const db = this._getDB();
        return db.requests.filter(r => r.citizen === username).reverse();
    },

    async submitReport(data) {
        await this.delay(800);
        const db = this._getDB();

        const newRequest = {
            id: '#' + Math.floor(Math.random() * 9000 + 1000),
            citizen: data.citizen,
            type: data.type,
            location: data.location,
            lat: data.lat || null,
            lng: data.lng || null,
            status: 'pending',
            timestamp: new Date().toISOString(),
            weight: 0
        };

        db.requests.push(newRequest);
        if (!db.users[data.citizen]) db.users[data.citizen] = { points: 0, totalKg: 0 };

        this._saveDB(db);
        return { success: true, request: newRequest };
    },

    async getNearbyCollector(lat, lng) {
        // Mock: Return a specific collector moving randomly
        await this.delay(300);
        const db = this._getDB();

        // Simulate movement
        const c = db.collectors['collector1'];
        c.lat += (Math.random() - 0.5) * 0.001;
        c.lng += (Math.random() - 0.5) * 0.001;

        return c;
    },

    // --- Collector Features ---
    async getCollectorRequests() {
        await this.delay(500);
        const db = this._getDB();
        return db.requests.filter(r => r.status === 'pending');
    },

    async collectGarbage(id, weight) {
        await this.delay(600);
        const db = this._getDB();
        const req = db.requests.find(r => r.id === id);
        if (!req) throw new Error('Not found');

        req.status = 'collected';
        req.weight = parseFloat(weight);
        this._saveDB(db);
        return { success: true };
    },

    // --- Marketplace ---
    async getMarketplaceItems() {
        await this.delay(500);
        return [
            { id: 1, name: "Recycled Notebook", cost: 50, image: "📓" },
            { id: 2, name: "Bamboo Toothbrush", cost: 100, image: "qh" },
            { id: 3, name: "Eco T-Shirt", cost: 500, image: "👕" },
            { id: 4, name: "Solar Lamp", cost: 1000, image: "💡" },
            { id: 5, name: "Compost Bin", cost: 800, image: "🗑️" },
            { id: 6, name: "Metal Straw Set", cost: 150, image: "🥤" }
        ];
    },

    async redeemItem(username, cost, itemName) {
        await this.delay(600);
        const db = this._getDB();

        if (!db.users[username]) return { success: false, msg: 'User not found' };
        if (db.users[username].points < cost) return { success: false, msg: 'Insufficient Points' };

        db.users[username].points -= cost;
        this._saveDB(db);
        return { success: true, newBalance: db.users[username].points };
    },

    async addMarketplaceItem(item) {
        await this.delay(500);
        // In a real app, this would save to DB. For now, we just pretend.
        return { success: true };
    },

    // --- Complaints / Feedback ---
    async submitComplaint(data) {
        await this.delay(600);
        const db = this._getDB();
        // Save to a new collection in LS (simulated)
        const complaints = JSON.parse(localStorage.getItem('sgc_complaints') || '[]');
        complaints.push({
            id: '#' + Math.floor(Math.random() * 9000),
            ...data,
            status: 'Pending',
            date: new Date().toISOString()
        });
        localStorage.setItem('sgc_complaints', JSON.stringify(complaints));
        return { success: true };
    },

    async getComplaints(username) {
        await this.delay(400);
        const all = JSON.parse(localStorage.getItem('sgc_complaints') || '[]');
        return username ? all.filter(c => c.username === username) : all;
    },

    async replyToComplaint(id, replyText) {
        await this.delay(500);
        let all = JSON.parse(localStorage.getItem('sgc_complaints') || '[]');
        const idx = all.findIndex(c => c.id === id);
        if (idx !== -1) {
            all[idx].status = 'Resolved';
            all[idx].reply = replyText;
            localStorage.setItem('sgc_complaints', JSON.stringify(all));
            return { success: true };
        }
        return { success: false };
    },

    // --- Announcements ---
    async getAnnouncements() {
        await this.delay(300);
        return JSON.parse(localStorage.getItem('sgc_announcements') || '[]');
    },

    async sendAnnouncement(title, msg) {
        await this.delay(500);
        const all = JSON.parse(localStorage.getItem('sgc_announcements') || '[]');
        all.unshift({
            id: Date.now(),
            title,
            msg,
            date: new Date().toISOString()
        });
        localStorage.setItem('sgc_announcements', JSON.stringify(all));
        return { success: true };
    },

    // --- User Profile ---
    async updateProfile(username, data) {
        await this.delay(600);
        const db = this._getDB();
        if (db.users[username]) {
            db.users[username] = { ...db.users[username], ...data };
            this._saveDB(db);
            return { success: true };
        }
        return { success: false };
    },

    // --- AI Simulation ---
    async analyzeWasteImage(file) {
        await this.delay(2000); // Simulate processing time
        // Random Mock Result
        const outcomes = [
            { type: "Plastic", conf: "94%", recyclable: true, tip: "Wash and crush before disposal." },
            { type: "Organic", conf: "88%", recyclable: true, tip: "Great for composting!" },
            { type: "E-Waste", conf: "99%", recyclable: false, tip: "Do not bin! Schedule special pickup." }
        ];
        return outcomes[Math.floor(Math.random() * outcomes.length)];
    },

    // --- Admin Features ---
    async getAdminStats() {
        await this.delay(500);
        const db = this._getDB();

        const totalKg = db.requests
            .filter(r => r.status === 'verified')
            .reduce((sum, r) => sum + (r.weight || 0), 0);

        return {
            requests: db.requests.length,
            collected: totalKg,
            users: Object.keys(db.users).length,
            activeCollectors: 2,
            // Mock Chart Data
            chartData: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                waste: [120, 190, 30, 50, 20, 300, 250],
                recycling: [65, 59, 80, 81, 56, 55, 40]
            }
        };
    },

    async getUsers() {
        await this.delay(400);
        const db = this._getDB();
        return Object.entries(db.users).map(([name, data]) => ({
            name, ...data, status: 'Active'
        }));
    },

    async getIoTData() {
        await this.delay(300);
        // Mock Smart Bins
        return [
            { id: 'BIN-01', location: 'Central Park', level: Math.floor(Math.random() * 100), status: 'Online' },
            { id: 'BIN-02', location: 'Market Sq', level: Math.floor(Math.random() * 100), status: 'Online' },
            { id: 'BIN-03', location: 'School Zn', level: Math.floor(Math.random() * 100), status: 'Offline' },
            { id: 'BIN-04', location: 'Hospital', level: Math.floor(Math.random() * 100), status: 'Online' },
        ];
    },

    async getAllRequests() {
        await this.delay(500);
        return this._getDB().requests.reverse();
    },

    async verifyCollection(id, approved) {
        await this.delay(400);
        const db = this._getDB();
        const req = db.requests.find(r => r.id === id);
        if (!req) throw new Error('Not found');

        if (approved) {
            req.status = 'verified';
            const pts = Math.ceil(req.weight * 10);

            if (db.users[req.citizen]) {
                db.users[req.citizen].points += pts;
                db.users[req.citizen].totalKg += req.weight;
            }
        } else {
            req.status = 'rejected';
        }

        this._saveDB(db);
        return { success: true };
    }
};
