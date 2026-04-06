// js/pages/recover.js
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        const el = {
            step1  : document.getElementById('step1'),
            step2  : document.getElementById('step2'),
            form1  : document.getElementById('recoverForm'),
            form2  : document.getElementById('newPasswordForm'),
            sendBtn: document.getElementById('sendEmailBtn'),
            saveBtn: document.getElementById('updatePasswordBtn'),
            email  : document.getElementById('email'),
            pwd    : document.getElementById('newPassword'),
            confirm: document.getElementById('confirmNewPassword'),
            msg    : document.getElementById('messageContainer')
        };

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

        function showStep(n) {
            el.step1.style.display = n === 1 ? 'block' : 'none';
            el.step2.style.display = n === 2 ? 'block' : 'none';
        }

        // Detectar token de recuperación en URL
        function checkHash() {
            const hash    = new URLSearchParams(window.location.hash.substring(1));
            const type    = hash.get('type');
            const access  = hash.get('access_token');
            const refresh = hash.get('refresh_token');

            if (type !== 'recovery' || !access) return;

            showMsg('⏳ Verificando enlace...', 'info');

            window.SupabaseClient.auth.setSession({ access_token: access, refresh_token: refresh })
                .then(({ error }) => {
                    if (error) {
                        showMsg('❌ Enlace inválido o expirado.');
                        showStep(1);
                    } else {
                        showStep(2);
                        showMsg('✅ Ingresa tu nueva contraseña', 'success');
                        window.history.replaceState({}, '', window.location.pathname);
                    }
                });
        }

        // Enviar email
        el.form1?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = el.email?.value.trim();
            const v     = Validators.validateEmail(email);
            if (!v.valid) { showMsg(v.message); return; }

            setLoading(el.sendBtn, true, 'Enviar enlace');
            const r = await AuthService.resetPassword(email);
            setLoading(el.sendBtn, false, 'Enviar enlace de recuperación');

            if (r.success) {
                showMsg('✅ Revisa tu correo y spam.', 'success');
                el.email.value = '';
            } else {
                showMsg(r.error);
            }
        });

        // Actualizar contraseña
        el.form2?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const pwd     = el.pwd?.value;
            const confirm = el.confirm?.value;
            const v       = Validators.validateNewPasswordForm(pwd, confirm);
            if (!v.valid) { showMsg(v.message); return; }

            setLoading(el.saveBtn, true, 'Actualizar');
            const r = await AuthService.updatePassword(pwd);
            setLoading(el.saveBtn, false, 'Actualizar contraseña');

            if (r.success) {
                showMsg('✅ ¡Contraseña actualizada! Redirigiendo...', 'success');
                await AuthService.logout();
                setTimeout(() => { window.location.href = 'index.html'; }, 2000);
            } else {
                showMsg(r.error);
                if (r.error?.includes('expiró')) showStep(1);
            }
        });

        showStep(1);
        checkHash();
    });
})();