// js/pages/login.js
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', async function () {

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
        }

        function setLoading(on) {
            el.btn.disabled    = on;
            el.btn.textContent = on ? 'Cargando...' : 'Iniciar sesión';
        }

        // Procesar token pkce que viene del link de confirmación de email
        async function handleEmailConfirmation() {
            try {
                const { data, error } = await window.SupabaseClient.auth.getSession();
                if (error) throw error;
                if (data?.session) {
                    AuthService.saveSession(data.session);
                    showMsg('✅ ¡Email confirmado! Redirigiendo...', 'success');
                    const hasSpace = await SpaceService.hasSpace(data.session.user.id);
                    setTimeout(() => {
                        window.location.href = hasSpace ? 'dashboard.html' : 'vinculacion.html';
                    }, 1200);
                    return true;
                }
            } catch (e) {
                console.error('❌ [login] Error procesando confirmación:', e);
            }
            return false;
        }

        async function handleLogin(email, pwd) {
            const v = Validators.validateLoginForm(email, pwd);
            if (!v.valid) { showMsg(v.message); return; }

            setLoading(true);
            try {
                const r = await AuthService.login(email, pwd);
                if (!r.success) { showMsg(r.error); return; }

                AuthService.saveSession(r.session);
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

        // 1. Verificar si viene del link de confirmación de email
        const confirmed = await handleEmailConfirmation();
        if (confirmed) return;

        // 2. Verificar si ya tiene sesión activa
        const user = await AuthService.restoreSession();
        if (user) {
            const hasSpace = await SpaceService.hasSpace(user.id);
            window.location.href = hasSpace ? 'dashboard.html' : 'vinculacion.html';
            return;
        }

        // 3. Mostrar formulario normal
        el.form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleLogin(el.email?.value.trim(), el.password?.value);
        });
    });
})();
