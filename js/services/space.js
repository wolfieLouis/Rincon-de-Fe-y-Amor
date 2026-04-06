// js/services/space.js
(function () {
    'use strict';

    const _sb = window.SupabaseClient;
    if (!_sb) { console.error('❌ [SpaceService] No client'); return; }

    window.SpaceService = {

        createSpace: async function (name, userId) {
            try {
                const code = this._genCode();

                const { data: space, error: e1 } = await _sb
                    .from('spaces')
                    .insert({ code, name: name.trim(), created_by: userId })
                    .select().single();

                if (e1) throw e1;

                const { error: e2 } = await _sb
                    .from('space_members')
                    .insert({ space_id: space.id, user_id: userId });

                if (e2) throw e2;

                await _sb.from('racha').insert({
                    space_id: space.id, dias: 0, last_date: '', members_checked: {}
                });

                this._cache(space);
                return { success: true, data: space };

            } catch (e) {
                console.error('❌ [SpaceService.createSpace]', e);
                return { success: false, error: e.message };
            }
        },

        joinSpace: async function (code, userId) {
            try {
                const { data: space, error: e1 } = await _sb
                    .from('spaces')
                    .select('*')
                    .eq('code', code.trim().toUpperCase())
                    .single();

                if (e1 || !space) throw new Error('Código inválido o no encontrado');

                const { count } = await _sb
                    .from('space_members')
                    .select('*', { count: 'exact', head: true })
                    .eq('space_id', space.id);

                if (count >= 2) throw new Error('Este espacio ya tiene 2 miembros');

                const { data: exists } = await _sb
                    .from('space_members')
                    .select('id')
                    .eq('space_id', space.id)
                    .eq('user_id', userId)
                    .maybeSingle();

                if (exists) throw new Error('Ya eres miembro de este espacio');

                const { error: e2 } = await _sb
                    .from('space_members')
                    .insert({ space_id: space.id, user_id: userId });

                if (e2) throw e2;

                this._cache(space);
                return { success: true, data: space };

            } catch (e) {
                console.error('❌ [SpaceService.joinSpace]', e);
                return { success: false, error: e.message };
            }
        },

        createSoloSpace: async function (userId, email) {
            const name = email.split('@')[0] + ' (individual)';
            return this.createSpace(name, userId);
        },

        getCurrentSpace: async function (userId) {
            try {
                const cached = this._getCache();
                if (cached) return cached;

                const { data, error } = await _sb
                    .from('space_members')
                    .select('space_id, spaces(*)')
                    .eq('user_id', userId)
                    .maybeSingle();

                if (error || !data) return null;
                const space = data.spaces;
                if (space) this._cache(space);
                return space;

            } catch { return null; }
        },

        hasSpace: async function (userId) {
            const space = await this.getCurrentSpace(userId);
            return space !== null;
        },

        getMembers: async function (spaceId) {
            try {
                const { data, error } = await _sb
                    .from('space_members')
                    .select('user_id, profiles(display_name, email)')
                    .eq('space_id', spaceId);

                if (error) throw error;
                return data.map(m => ({
                    id   : m.user_id,
                    name : m.profiles?.display_name || 'Usuario',
                    email: m.profiles?.email || ''
                }));
            } catch { return []; }
        },

        leaveSpace: async function (spaceId, userId) {
            try {
                const { error } = await _sb
                    .from('space_members')
                    .delete()
                    .eq('space_id', spaceId)
                    .eq('user_id', userId);

                if (error) throw error;
                this.clearCache();
                return { success: true };
            } catch (e) {
                return { success: false, error: e.message };
            }
        },

        _genCode: function () {
            const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
            const r = () => Array.from({length:6}, () => c[Math.floor(Math.random()*c.length)]).join('');
            return `${r()}-${r()}`;
        },

        _cache:    (s) => { try { localStorage.setItem('currentSpace', JSON.stringify(s)); } catch {} },
        _getCache: ()  => { try { const r = localStorage.getItem('currentSpace'); return r ? JSON.parse(r) : null; } catch { return null; } },
        clearCache: ()  => { try { localStorage.removeItem('currentSpace'); } catch {} }
    };

    console.log('✅ [SpaceService] Cargado');
})();