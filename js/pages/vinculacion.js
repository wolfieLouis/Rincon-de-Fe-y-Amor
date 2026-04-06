(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', async function () {

        const _sb = window.SupabaseClient;

        const el = {
            joinForm  : document.getElementById('joinForm'),
            createForm: document.getElementById('createForm'),
            joinBtn   : document.getElementById('joinBtn'),
            createBtn : document.getElementById('createBtn'),
            soloBtn   : document.getElementById('soloModeBtn'),
            joinCode  : document.getElementById('joinCode'),
            spaceName : document.getElementById('spaceName'),
            msg       : document.getElementById('messageContainer')
        };

        let currentUser = null;

        function showMsg(text, type = 'error') {
            if (!el.msg) return;
            el.msg.innerHTML = `<div class="message message-${type}">${text}</div>`;
            if (type !== 'error') setTimeout(() => { el.msg.innerHTML = ''; }, 5000);
        }

        function setLoading(btn, on, text) {
            if (!btn) return;
            btn.disabled    = on;
            btn.textContent = on ? 'Cargando...' : text;
        }

        // ── PASO 1: Manejar ?code= de confirmación de email (PKCE flow) ───
        const params = new URLSearchParams(window.location.search);
        const code   = params.get('code');

        if (code) {
            showMsg('Confirmando tu cuenta...', 'info');
            try {
                const { error } = await _sb.auth.exchangeCodeForSession(code);
                if (error) {
                    showMsg('El enlace expiró o ya fue usado. Por favor regístrate de nuevo.');
                    return;
                }
                // Limpiar el ?code= de la URL sin recargar la página
                window.history.replaceState({}, '', window.location.pathname);
            } catch (e) {
                showMsg('Error al confirmar la cuenta. Intenta de nuevo.');
                return;
            }
        }

        // ── PASO 2: Verificar sesión activa ───────────────────────────────
        showMsg('Verificando sesión...', 'info');
        currentUser = await AuthService.restoreSession();

        if (!currentUser) {
            window.location.href = 'index.html';
            return;
        }

        el.msg.innerHTML = '';

        // ── PASO 3: Si ya tiene espacio, ir al dashboard ──────────────────
        const hasSpace = await SpaceService.hasSpace(currentUser.id);
        if (hasSpace) {
            showMsg('Ya tienes un espacio. Redirigiendo...', 'info');
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
            return;
        }

        // ── UNIRSE ────────────────────────────────────────────────────────
        el.joinForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const code = el.joinCode?.value.trim();
            const v    = Validators.validateSpaceCode(code);
            if (!v.valid) { showMsg(v.message); return; }

            setLoading(el.joinBtn, true, 'Unirme');
            const r = await SpaceService.joinSpace(v.cleanCode, currentUser.id);
            setLoading(el.joinBtn, false, 'Unirme a espacio existente');

            if (r.success) {
                showMsg('✅ ¡Vinculado! Redirigiendo...', 'success');
                setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
            } else {
                showMsg(r.error);
            }
        });

        // ── CREAR ─────────────────────────────────────────────────────────
        el.createForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = el.spaceName?.value.trim();
            const v    = Validators.validateCreateSpaceForm(name);
            if (!v.valid) { showMsg(v.message); return; }

            setLoading(el.createBtn, true, 'Crear');
            const r = await SpaceService.createSpace(name, currentUser.id);
            setLoading(el.createBtn, false, 'Crear mi espacio');

            if (r.success) {
                showMsg(`✅ Espacio creado. Código: ${r.data.code}`, 'success');
                setTimeout(() => { window.location.href = 'dashboard.html'; }, 2000);
            } else {
                showMsg(r.error);
            }
        });

        // ── MODO SOLO ─────────────────────────────────────────────────────
        el.soloBtn?.addEventListener('click', async () => {
            if (!confirm('¿Crear espacio individual? Podrás vincular tu pareja después.')) return;

            setLoading(el.soloBtn, true, 'Modo solo');
            const r = await SpaceService.createSoloSpace(currentUser.id, currentUser.email);
            setLoading(el.soloBtn, false, '📖 Modo solo (espacio individual)');

            if (r.success) {
                showMsg('✅ Modo solo activado. Redirigiendo...', 'success');
                setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
            } else {
                showMsg(r.error);
            }
        });
    });
})();
