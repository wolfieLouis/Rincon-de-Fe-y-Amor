// js/utils/validators.js
(function () {
    'use strict';

    window.Validators = {

        isValidEmail: function (email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },

        validateEmail: function (email) {
            if (!email?.trim()) return { valid: false, message: 'El correo es requerido' };
            if (!this.isValidEmail(email)) return { valid: false, message: 'Correo inválido' };
            return { valid: true };
        },

        validatePassword: function (pwd) {
            if (!pwd) return { valid: false, message: 'La contraseña es requerida' };
            if (pwd.length < 6) return { valid: false, message: 'Mínimo 6 caracteres' };
            return { valid: true };
        },

        getPasswordStrength: function (pwd) {
            if (!pwd) return { level: 'weak', message: '🔴 Muy débil' };
            let s = 0;
            if (pwd.length >= 6)  s++;
            if (pwd.length >= 10) s++;
            if (/[A-Z]/.test(pwd)) s++;
            if (/[0-9]/.test(pwd)) s++;
            if (/[^A-Za-z0-9]/.test(pwd)) s++;
            if (s <= 2) return { level: 'weak',   message: '🔴 Débil' };
            if (s <= 4) return { level: 'medium',  message: '🟡 Media' };
            return { level: 'strong', message: '🟢 Fuerte' };
        },

        validateRegisterForm: function (name, email, pwd, confirm) {
            if (!name?.trim() || name.length < 2)
                return { valid: false, message: 'El nombre debe tener al menos 2 caracteres' };
            const e = this.validateEmail(email);
            if (!e.valid) return e;
            const p = this.validatePassword(pwd);
            if (!p.valid) return p;
            if (pwd !== confirm) return { valid: false, message: 'Las contraseñas no coinciden' };
            return { valid: true };
        },

        validateLoginForm: function (email, pwd) {
            const e = this.validateEmail(email);
            if (!e.valid) return e;
            if (!pwd) return { valid: false, message: 'La contraseña es requerida' };
            return { valid: true };
        },

        validateSpaceCode: function (code) {
            if (!code?.trim()) return { valid: false, message: 'El código es requerido' };
            const clean = code.trim().toUpperCase();
            if (!/^[A-Z0-9]{6}-[A-Z0-9]{6}$/.test(clean))
                return { valid: false, message: 'Formato inválido. Ejemplo: ABC123-XYZ789' };
            return { valid: true, cleanCode: clean };
        },

        validateCreateSpaceForm: function (name) {
            if (!name?.trim() || name.length < 3)
                return { valid: false, message: 'El nombre debe tener al menos 3 caracteres' };
            return { valid: true };
        },

        validateNewPasswordForm: function (pwd, confirm) {
            const p = this.validatePassword(pwd);
            if (!p.valid) return p;
            if (pwd !== confirm) return { valid: false, message: 'Las contraseñas no coinciden' };
            return { valid: true };
        }
    };

    console.log('✅ Validators cargados');
})();