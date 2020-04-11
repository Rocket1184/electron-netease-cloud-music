<template>
    <mu-menu class="searchbox"
        cover
        placement="left"
        popover-class="searchbox-popover">
        <mu-button icon
            @click="focusInput">
            <mu-icon value="search"></mu-icon>
        </mu-button>
        <template #content>
            <mu-auto-complete dense
                solo
                full-width
                color="secondary"
                icon="search"
                ref="textField"
                placeholder="搜索单曲、歌手、专辑、用户 ..."
                v-model="searchText"
                :filter="filterData"
                @select="handleSearch">
            </mu-auto-complete>
        </template>
    </mu-menu>
</template>

<script>
import Api from '@/api/ipc';

export default {
    data() {
        return {
            searchText: ''
        };
    },
    methods: {
        focusInput() {
            setTimeout(() => this._input.focus(), 200);
        },
        async filterData(query) {
            if (!query) {
                return [];
            }
            const resp = await Api.getSearchSuggest(query, this.$route.query.type);
            if (resp.code !== 200 || !resp.result.allMatch) {
                return [];
            }
            const re = new RegExp(`(${query.trim()})`, 'i');
            return resp.result.allMatch.map(item => ({
                item,
                value: item.keyword,
                highlight: item.keyword.replace(re, '<span class="mu-secondary-text-color">$1</span>')
            }));
        },
        handleSearch() {
            this.$router.push({
                name: 'search',
                query: {
                    ...this.$route.query,
                    keyword: this.searchText
                }
            }).catch(() => { /* noop */ });
        }
    },
    mounted() {
        this._input = this.$refs.textField.$el.querySelector('input');
        this._input.onkeydown = ev => {
            if (ev.key === 'Enter') this.handleSearch();
        };
    }
};
</script>

<style lang="less">
.searchbox {
    height: unset !important;
}
.searchbox-popover {
    width: 340px;
    -webkit-app-region: no-drag;
}
</style>
