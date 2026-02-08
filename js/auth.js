/* 
 * AUTH.JS
 * Updated for New UI
 */

const auth = {
    role: 'citizen',

    selectRole: (r) => {
        auth.role = r;
        document.querySelectorAll('.auth-box .btn').forEach(b => {
            b.classList.remove('btn-secondary');
            b.classList.add('btn-white');
        });
        const active = document.getElementById(`role-${r}`);
        active.classList.remove('btn-white');
        active.classList.add('btn-secondary');
    },

    login: async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const btn = e.target.querySelector('button');

        btn.innerHTML = `<div class="spinner" style="width:20px; height:20px; border-width:2px;"></div>`;

        try {
            const res = await API.login(username, auth.role);
            if (res.success) {
                const session = { username, role: auth.role };
                localStorage.setItem('eco_session', JSON.stringify(session));
                Utils.toast(`Welcome back, ${username}!`);
                auth.initApp(session);
            }
        } catch (err) {
            Utils.toast('Login Failed', 'error');
        } finally {
            btn.innerHTML = 'Access Dashboard';
        }
    },

    checkSession: () => {
        const s = localStorage.getItem('eco_session');
        if (s) auth.initApp(JSON.parse(s));
    },

    initApp: (session) => {
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('app-section').classList.remove('hidden');

        document.getElementById('nav-user-name').innerText = session.username;
        document.getElementById('nav-user-role').innerText = session.role;

        // Setup Nav
        auth.buildNav(session.role);

        // Init Module
        if (session.role === 'citizen') citizen.init(session.username);
        if (session.role === 'collector') collector.init();
        if (session.role === 'admin') admin.init();
    },

    logout: () => {
        localStorage.removeItem('eco_session');
        window.location.reload();
    },

    buildNav: (role) => {
        const menu = document.getElementById('sidebar-nav');
        const mob = document.getElementById('mobile-nav');

        const items = role === 'citizen' ? [
            { name: 'Home', icon: 'home', action: 'citizen.renderHome()' },
            { name: 'Scan Waste (AI)', icon: 'camera', action: 'citizen.renderAI()' },
            { name: 'Marketplace', icon: 'cart', action: 'citizen.renderMarketplace()' },
            { name: 'History', icon: 'time', action: 'citizen.renderHistory()' },
            { name: 'Notifications', icon: 'notifications', action: 'citizen.renderNotifications()' },
            { name: 'Profile', icon: 'person', action: 'citizen.renderProfile()' }
        ] : role === 'collector' ? [
            { name: 'Tasks', icon: 'list', action: 'collector.renderTasks()' },
            { name: 'Map', icon: 'map', action: 'collector.renderMap()' },
            { name: 'Performance', icon: 'trending-up', action: 'collector.renderPerformance()' }
        ] : [ // Admin
            { name: 'Stats', icon: 'bar-chart', action: 'admin.renderStats()' },
            { name: 'Users', icon: 'people', action: 'admin.renderUsers()' },
            { name: 'Feedback', icon: 'chatbubbles', action: 'admin.renderFeedback()' },
            { name: 'Announcements', icon: 'megaphone', action: 'admin.renderAnnouncements()' },
            { name: 'Marketplace', icon: 'cart', action: 'admin.renderMarketplaceAdmin()' },
            { name: 'IoT Bins', icon: 'hardware-chip', action: 'admin.renderIoT()' },
            { name: 'Verify', icon: 'checkmark-done', action: 'admin.renderVerify()' }
        ];

        menu.innerHTML = items.map(i => `
            <li class="nav-item">
                <a class="nav-link" onclick="${i.action}">
                    <ion-icon name="${i.icon}-outline"></ion-icon> ${i.name}
                </a>
            </li>
        `).join('');

        mob.innerHTML = items.map(i => `
            <button class="nav-icon-btn" onclick="${i.action}">
                <ion-icon name="${i.icon}-outline"></ion-icon>
                <span>${i.name}</span>
            </button>
        `).join('');
    }
};
