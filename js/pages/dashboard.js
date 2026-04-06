// js/pages/dashboard.js
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', async function () {

        // Verificar sesión
        const user = await AuthService.restoreSession();
        if (!user) { window.location.href = 'index.html'; return; }

        // Verificar espacio
        const space = await SpaceService.getCurrentSpace(user.id);
        if (!space) { window.location.href = 'vinculacion.html'; return; }

        // Datos básicos
        const name    = user.user_metadata?.display_name || 'Usuario';
        const initial = name[0]?.toUpperCase() || '?';
        const members = await SpaceService.getMembers(space.id);
        const partner = members.find(m => m.id !== user.id);

        // Actualizar UI
        document.getElementById('headerAvatar').textContent  = initial;
        document.getElementById('sbAvatarMe').textContent    = initial;
        document.getElementById('sbAvatarPartner').textContent = partner?.name?.[0]?.toUpperCase() || '?';
        document.getElementById('sbSpaceName').textContent   = space.name;
        document.getElementById('sbCode').textContent        = space.code;
        document.getElementById('headerDate').textContent    = new Date().toLocaleDateString('es', { day:'numeric', month:'short' });

        // Contenido principal
        document.getElementById('content').innerHTML = `
            <div style="text-align:center;padding:40px 20px">
                <div style="font-size:48px;margin-bottom:16px">🙏</div>
                <h2 style="font-size:22px;font-weight:800;margin-bottom:8px">¡Hola, ${name}!</h2>
                <p style="color:var(--sub);font-size:14px;margin-bottom:24px">
                    Bienvenido a tu Rincón de Fe y Amor
                </p>
                ${partner ? `
                    <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r-lg);padding:16px;margin-bottom:16px">
                        <div style="font-size:12px;color:var(--sub);margin-bottom:4px">Vinculado con</div>
                        <div style="font-size:16px;font-weight:700;color:var(--red2)">❤️ ${partner.name}</div>
                    </div>` : `
                    <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r-lg);padding:16px;margin-bottom:16px">
                        <div style="font-size:13px;color:var(--sub)">Tu código para vincular tu pareja:</div>
                        <div style="font-size:20px;font-weight:800;letter-spacing:3px;color:var(--red2);font-family:monospace;margin-top:8px">${space.code}</div>
                    </div>`}
                <p style="color:var(--muted);font-size:13px">Los módulos estarán disponibles próximamente 🚀</p>
            </div>`;

        // Sidebar — hamburger
        const sidebar  = document.getElementById('sidebar');
        const overlay  = document.getElementById('overlay');
        const hamburger= document.getElementById('hamburgerBtn');

        hamburger?.addEventListener('click', () => {
            sidebar.classList.add('open');
            overlay.classList.add('open');
        });
        overlay?.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
        });

        // Copiar código
        document.getElementById('sbCopyBtn')?.addEventListener('click', () => {
            navigator.clipboard?.writeText(space.code).then(() => {
                const btn = document.getElementById('sbCopyBtn');
                btn.textContent = '✅';
                setTimeout(() => { btn.textContent = '📋'; }, 2000);
            });
        });

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', async () => {
            if (!confirm('¿Cerrar sesión?')) return;
            SpaceService.clearCache();
            await AuthService.logout();
            window.location.href = 'index.html';
        });

        console.log('✅ Dashboard listo');
    });
})();