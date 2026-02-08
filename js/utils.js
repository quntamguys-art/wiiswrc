/*
 * UTILS.JS
 * Helper functions, Toast Notifications, Skeleton Builders
 */

const Utils = {

    // Toast Notification System
    toast(message, type = 'success') {
        const container = document.getElementById('toast-container') || this._createToastContainer();

        const el = document.createElement('div');
        el.className = `toast ${type}`;

        const icon = type === 'success' ? 'checkmark-circle' : type === 'error' ? 'alert-circle' : 'information-circle';

        el.innerHTML = `
            <ion-icon name="${icon}" style="font-size: 1.5rem; color: inherit;"></ion-icon>
            <div>
                <strong style="display:block; font-size: 0.9em; text-transform: uppercase;">${type}</strong>
                <span>${message}</span>
            </div>
        `;

        container.appendChild(el);

        // Remove after 3s
        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(-10px)';
            setTimeout(() => el.remove(), 300);
        }, 3000);
    },

    _createToastContainer() {
        const div = document.createElement('div');
        div.id = 'toast-container';
        document.body.appendChild(div);
        return div;
    },

    // UI Helpers
    showLoader(elementId) {
        const el = document.getElementById(elementId);
        if (el) el.innerHTML = '<div class="flex-center" style="height: 200px;"><div class="spinner"></div></div>';
    },

    // Skeleton Builder for Lists
    getSkeletonList(count = 3) {
        return Array(count).fill(0).map(() => `
            <div class="card flex-center" style="align-items: flex-start; gap: 1rem;">
                <div class="skeleton" style="width: 50px; height: 50px; border-radius: 8px;"></div>
                <div style="flex: 1;">
                    <div class="skeleton h-4 w-1_2 mb-4"></div>
                    <div class="skeleton h-4 w-full"></div>
                </div>
            </div>
        `).join('');
    },

    // Date Formatter
    formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
};
