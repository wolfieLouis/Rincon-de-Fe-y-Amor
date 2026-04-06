// js/pages/vinculacion.js
(function () {
    'use strict';

    const _sb = window.SupabaseClient;

    // ── UI helpers ──────────────────────────────────────────────
    function showMsg(msg, type = 'error') {
        const c = document.getElementById('messageContainer');
        if (!c) return;
        c.innerHTML = `<div class="message ${type}">${msg}</div>`;
    }

    function setLoading(btnId, loading, text) {
        const b = document.getElementById(btnId);
        if (!b) return;
        b.disabled = loading;
        b.textContent = loading ? '⏳ Cargando...' : text;
    }

    // ── Procesar token de confirmación en la URL ────────────────
    async function handleAuthToken() {
        const hash = window.location.hash;
        if (!hash || !hash.includes('access_token')) return null;

        try {
            const params = new URLSearchParams(hash.substring(1));
            const access_token  = params.get('access_token');
            const refresh_token = params.get('refresh_token');
            const type          = params.get('type'); // 'signup' | 'recovery' | etc.

            if (!access_token) return null;

            // Si es recuperación de contraseña, redirige a recover
            if (type === 'recovery') {
                window.location.href = 'recover.html' + window.location.hash;
                return 'redirected';
            }

            const { data, error } = await _sb.auth.setSession({ access_token, refresh_token });
            if (error) throw error;

            if (data?.session) {
                AuthService.saveSession(data.session);
                // Limpiar hash de la URL sin recargar
                history.replaceState(null, '', window.location.pathname);
                return data.session.user;
            }
        } catch (e) {
            console.error('❌ [vinculacion] Error procesando token:', e);
        }
        return null;
    }

    // ── Inicializar página ──────────────────────────────────────
    async function init() {
        // 1. Primero procesar token si viene de confirmación de email
        const tokenUser = await handleAuthToken();
        if (tokenUser === 'redirected') return;

        // 2. Obtener sesión activa
        let user = tokenUser || await AuthService.restoreSession();

        if (!user) {
            window.location.href = 'register.html';
            return;
        }

        // 3. Si ya tiene espacio, ir al dashboard
        const hasSpace = await SpaceService.hasSpace(user.id);
        if (hasSpace) {
            window.location.href = 'dashboard.html';
            return;
        }

        // 4. Mostrar bienvenida
        showMsg(`✅ ¡Correo confirmado! Bienvenido/a. Ahora vincula con tu pareja.`, 'success');

        // 5. Registrar eventos
        bindEvents(user);
    }

    // ── Eventos de formularios ──────────────────────────────────
    function bindEvents(user) {

        // — Unirse con código —
        const joinForm = document.getElementById('joinForm');
        if (joinForm) {
            joinForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const code = document.getElementById('joinCode')?.value?.trim().toUpperCase();

                if (!code || code.length < 13) {
                    showMsg('Ingresa un código válido (formato: ABC123-XYZ789)');
                    return;
                }

                setLoading('joinBtn', true, 'Unirme a espacio existente');
                showMsg('');

                const result = await SpaceService.joinSpace(code, user.id);

                if (result.success) {
                    showMsg('✅ ¡Vinculado! Redirigiendo...', 'success');
                    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
                } else {
                    showMsg(result.error || 'Error al unirse al espacio');
                    setLoading('joinBtn', false, 'Unirme a espacio existente');
                }
            });
        }

        // — Crear espacio nuevo —
        const createForm = document.getElementById('createForm');
        if (createForm) {
            createForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('spaceName')?.value?.trim();

                if (!name || name.length < 2) {
                    showMsg('Ingresa un nombre para el espacio (mínimo 2 caracteres)');
                    return;
                }

                setLoading('createBtn', true, 'Crear mi espacio');
                showMsg('');

                const result = await SpaceService.createSpace(name, user.id);

                if (result.success) {
                    showMsg('✅ ¡Espacio creado! Redirigiendo...', 'success');
                    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
                } else {
                    showMsg(result.error || 'Error al crear el espacio');
                    setLoading('createBtn', false, 'Crear mi espacio');
                }
            });
        }

        // — Modo solo —
        const soloBtn = document.getElementById('soloModeBtn');
        if (soloBtn) {
            soloBtn.addEventListener('click', async () => {
                soloBtn.disabled = true;
                soloBtn.textContent = '⏳ Cargando...';
                showMsg('');

                const result = await SpaceService.createSoloSpace(user.id, user.email);

                if (result.success) {
                    showMsg('✅ ¡Espacio individual creado! Redirigiendo...', 'success');
                    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
                } else {
                    showMsg(result.error || 'Error al crear espacio individual');
                    soloBtn.disabled = false;
                    soloBtn.textContent = '📖 Modo solo (espacio individual)';
                }
            });
        }
    }

    // ── Arrancar ────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
