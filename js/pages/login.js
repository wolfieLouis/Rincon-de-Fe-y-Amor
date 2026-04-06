// js/pages/login.js
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        const el = {
            form    : document.getElementById('loginForm'),
            email   : document.getElementById('email'),
            password: document.getElementById('password'),
            btn     : document.getElementById('loginBtn'),
            msg     : document.getElementById('messageContainer')
        };

        function showMsg(text, type = 'error') {
            if (!el.msg) return;
            el.msg.innerHTML = `<div class="message message-${type}">${text}</div>`;
            if (type !== 'error') setTimeout(() => { el.msg.innerHTML = ''; }, 5000);
        }

        function setLoading(on) {
            el.btn.disabled    = on;
            el.btn.textContent = on ? 'Cargando...' : 'Iniciar sesión';
        }

        async function handleLogin(email, pwd) {
            const v = Validators.validateLoginForm(email, pwd);
            if (!v.valid) { showMsg(v.message); return; }

            setLoading(true);
            try {
                const r = await AuthService.login(email, pwd);
                if (!r.success) { showMsg(r.error); return; }

                if (r.session) AuthService.saveSession(r.session);
                showMsg('✅ ¡Bienvenido! Redirigiendo...', 'success');

                const hasSpace = await SpaceService.hasSpace(r.user.id);
                setTimeout(() => {
                    window.location.href = hasSpace ? 'dashboard.html' : 'vinculacion.html';
                }, 1200);

            } catch (e) {
                showMsg('Error inesperado. Intenta de nuevo.');
            } finally {
                setLoading(false);
            }
        }

        async function checkSession() {
            const user = await AuthService.restoreSession();
            if (!user) return;
            const hasSpace = await SpaceService.hasSpace(user.id);
            window.location.href = hasSpace ? 'dashboard.html' : 'vinculacion.html';
        }

        el.form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleLogin(el.email?.value.trim(), el.password?.value);
        });

        checkSession();
    });
})();