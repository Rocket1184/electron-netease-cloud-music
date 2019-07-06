<template>
    <ListDetailLayout class="fav-djradio"
        :listLoading="listLoading"
        :detailLoading="detailLoading"
        tipText="登录后查看订阅的主播电台"
        :showTip="!user.loginValid">
        <template #list>
            <mu-list>
                <AvatarListItem v-for="r in user.djradios"
                    :key="r.id"
                    :img="r.picUrl"
                    :title="r.name"
                    :subTitle="`${r.dj.nickname} / ${r.programCount} 期`"
                    @click="handleClick(r.id)">
                </AvatarListItem>
            </mu-list>
        </template>
        <DjRadioDetail :djradio="djradio"></DjRadioDetail>
    </ListDetailLayout>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import Api from '@/api/ipc';

import { SET_LOGIN_VALID } from '@/store/mutation-types';
import DjRadioDetail from '@/components/DjRadioDetail/DjRadioDetail.vue';
import AvatarListItem from '@/components/AvatarListItem.vue';
import ListDetailLayout from '@/components/ListDetailLayout.vue';

export default {
    data() {
        return {
            djradio: null,
            listLoading: true,
            detailLoading: true
        };
    },
    computed: {
        ...mapState(['user']),
    },
    methods: {
        ...mapActions([
            'updateUserRadios'
        ]),
        async loadDjRadio(id) {
            this.detailLoading = true;
            const resp = await Api.getDjRadioDetail(id);
            this.djradio = resp.data;
            this.detailLoading = false;
        },
        async fetchData() {
            this.listLoading = true;
            await this.updateUserRadios();
            this.listLoading = false;
            const r = this.user.djradios[0];
            if (r && r.id) {
                this.loadDjRadio(r.id);
            }
        },
        handleClick(id) {
            this.loadDjRadio(id);
        }
    },
    mounted() {
        if (this.user.loginValid) {
            this.fetchData();
        } else {
            this.$store.subscribe(({ type, payload }) => {
                if (type === SET_LOGIN_VALID && payload === true) {
                    this.fetchData();
                }
            });
        }
    },
    components: {
        DjRadioDetail,
        AvatarListItem,
        ListDetailLayout
    }
};
</script>
