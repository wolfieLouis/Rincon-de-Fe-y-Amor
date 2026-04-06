(function () {
    'use strict';

    const _sb = window.SupabaseClient;
    if (!_sb) { console.error('❌ [AuthService] No client'); return; }

    window.AuthService = {

        register: async function (email, password, displayName) {
            try {
                const { data, error } = await _sb.auth.signUp({
                    email: email.trim().toLowerCase(),
                    password,
                    options: {
                        data: { display_name: displayName.trim() },
                        // ✅ CORREGIDO: apunta a vinculacion.html, no index.html
                        emailRedirectTo: 'https://wolfielouis.github.io/Rincon-de-Fe-y-Amor/index.html'
                    }
                });

                if (error) throw error;
                if (!data?.user) throw new Error('No se recibió usuario');
                if (data.user.identities?.length === 0)
                    return { success: false, error: 'Este correo ya está registrado' };

                return { success: true, user: data.user, session: data.session };

            } catch (e) {
                return { success: false, error: this._err(e) };
            }
        },

        login: async function (email, password) {
            try {
                const { data, error } = await _sb.auth.signInWithPassword({
                    email: email.trim().toLowerCase(),
                    password
                });

                if (error) throw error;
                return { success: true, user: data.user, session: data.session };

            } catch (e) {
                return { success: false, error: this._err(e) };
            }
        },

        logout: async function () {
            try {
                await _sb.auth.signOut();
                sessionStorage.clear();
                localStorage.removeItem('currentSpace');
                return { success: true };
            } catch (e) {
                return { success: false, error: e.message };
            }
        },

        getSession: async function () {
            try {
                const { data } = await _sb.auth.getSession();
                return data?.session || null;
            } catch { return null; }
        },

        getCurrentUser: async function () {
            try {
                const { data: { user } } = await _sb.auth.getUser();
                return user || null;
            } catch { return null; }
        },

        restoreSession: async function () {
            try {
                const { data } = await _sb.auth.getSession();
                if (data?.session?.user) return data.session.user;
                return null;
            } catch { return null; }
        },

        saveSession: function (session) {
            if (!session) return;
            sessionStorage.setItem('rf_at', session.access_token);
            sessionStorage.setItem('rf_rt', session.refresh_token);
        },

        resetPassword: async function (email) {
            try {
                const { error } = await _sb.auth.resetPasswordForEmail(
                    email.trim().toLowerCase(),
                    { redirectTo: 'https://wolfielouis.github.io/Rincon-de-Fe-y-Amor/recover.html' }
                );
                if (error) throw error;
                return { success: true };
            } catch (e) {
                return { success: false, error: this._err(e) };
            }
        },

        updatePassword: async function (password) {
            try {
                const { error } = await _sb.auth.updateUser({ password });
                if (error) throw error;
                return { success: true };
            } catch (e) {
                return { success: false, error: this._err(e) };
            }
        },

        _err: function (e) {
            const map = {
                'Invalid login credentials': 'Correo o contraseña incorrectos',
                'User already registered':   'Este correo ya está registrado',
                'Email not confirmed':        'Confirma tu correo primero',
                'Invalid token':              'El enlace expiró, solicita uno nuevo'
            };
            const msg = e.message || 'Error desconocido';
            return Object.entries(map).find(([k]) => msg.includes(k))?.[1] || msg;
        }
    };

    console.log('✅ [AuthService] Cargado');
})();
