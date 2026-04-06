// js/pages/register.js
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        const el = {
            form    : document.getElementById('registerForm'),
            name    : document.getElementById('displayName'),
            email   : document.getElementById('email'),
            pwd     : document.getElementById('password'),
            confirm : document.getElementById('confirmPassword'),
            btn     : document.getElementById('registerBtn'),
            msg     : document.getElementById('messageContainer'),
            strength: document.getElementById('passwordStrength')
        };

        function showMsg(text, type = 'error') {
            if (!el.msg) return;
            el.msg.innerHTML = `<div class="message message-${type}">${text}</div>`;
        }

        function setLoading(on) {
            el.btn.disabled    = on;
            el.btn.textContent = on ? 'Cargando...' : 'Registrarme';
        }

        function updateStrength() {
            if (!el.pwd || !el.strength) return;
            const s = Validators.getPasswordStrength(el.pwd.value);
            el.strength.innerHTML = `<span class="strength-${s.level}">${s.message}</span>`;
        }

        async function handleRegister() {
            const name    = el.name?.value.trim();
            const email   = el.email?.value.trim();
            const pwd     = el.pwd?.value;
            const confirm = el.confirm?.value;

            const v = Validators.validateRegisterForm(name, email, pwd, confirm);
            if (!v.valid) { showMsg(v.message); return; }

            setLoading(true);
            try {
                const r = await AuthService.register(email, pwd, name);
                if (!r.success) { showMsg(r.error); return; }

                // Con verificación de email activa, no hay sesión aún
                // El usuario debe confirmar su email primero
                showMsg('✅ ¡Cuenta creada! Revisa tu correo y confirma tu email para continuar.', 'success');
                el.form.reset();

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

        el.form?.addEventListener('submit', (e) => { e.preventDefault(); handleRegister(); });
        el.pwd?.addEventListener('input', updateStrength);

        checkSession();
    });
})();
