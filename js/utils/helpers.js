// js/utils/helpers.js
(function () {
    'use strict';

    window.Helpers = {

        formatDate: function (ts) {
            const diff = Date.now() - ts;
            if (diff < 60000)    return 'Hace unos segundos';
            if (diff < 3600000)  return `Hace ${Math.floor(diff/60000)} min`;
            if (diff < 86400000) return `Hace ${Math.floor(diff/3600000)}h`;
            if (diff < 604800000)return `Hace ${Math.floor(diff/86400000)} días`;
            return new Date(ts).toLocaleDateString('es', { day:'numeric', month:'short' });
        },

        getCurrentDate: function () {
            return new Date().toLocaleDateString('es');
        },

        getCurrentTimestamp: function () {
            return Date.now();
        },

        generateSpaceCode: function () {
            const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
            const r = () => Array.from({length:6}, () => c[Math.floor(Math.random()*c.length)]).join('');
            return `${r()}-${r()}`;
        },

        redirect: function (page, delay = 0) {
            if (delay > 0) setTimeout(() => { window.location.href = page; }, delay);
            else window.location.href = page;
        }
    };

    console.log('✅ Helpers cargados');
})();