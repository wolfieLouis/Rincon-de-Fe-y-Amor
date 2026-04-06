(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', async function () {

        const _sb = window.SupabaseClient;

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

        // ── PASO 1: ¿Viene un ?code= del link de confirmación? (PKCE) ─────
        const params = new URLSearchParams(window.location.search);
        const code   = params.get('code');

        if (code) {
            showMsg('Confirmando tu cuenta...', 'info');
            try {
                const { data, error } = await _sb.auth.exchangeCodeForSession(code);
                if (error) throw error;

                // Limpiar ?code= de la URL
                window.history.replaceState({}, '', window.location.pathname);

                showMsg('✅ ¡Email confirmado! Redirigiendo...', 'success');
                const hasSpace = await SpaceService.hasSpace(data.session.user.id);
                setTimeout(() => {
                    window.location.href = hasSpace ? 'dashboard.html' : 'vinculacion.html';
                }, 1200);
                return; // Salir — no mostrar el form de login
            } catch (e) {
                console.error('❌ [login] Error confirmando email:', e);
                showMsg('El enlace expiró o ya fue usado. Regístrate de nuevo.');
                return;
            }
        }

        // ── PASO 2: ¿Ya tiene sesión activa? ──────────────────────────────
        const user = await AuthService.restoreSession();
        if (user) {
            const hasSpace = await SpaceService.hasSpace(user.id);
            window.location.href = hasSpace ? 'dashboard.html' : 'vinculacion.html';
            return;
        }

        // ── PASO 3: Mostrar formulario de login ───────────────────────────
        async function handleLogin(email, pwd) {
            const v = Validators.validateLoginForm(email, pwd);
            if (!v.valid) { showMsg(v.message); return; }

            setLoading(true);
            try {
                const r = await AuthService.login(email, pwd);
                if (!r.success) { showMsg(r.error); return; }

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

        el.form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleLogin(el.email?.value.trim(), el.password?.value);
        });
    });
})();
