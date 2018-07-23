<template>
    <mu-auto-complete dense
        icon="search"
        class="appbar-search-field"
        placeholder="搜索歌曲、歌单、用户"
        :max-height="400"
        v-model="searchText"
        :data="searchAutoComplete"
        @input="handleSearchInput()">
    </mu-auto-complete>
</template>

<script>
import { stringify } from 'querystring';
import ApiRenderer from '@/util/apiRenderer';

export default {
    data() {
        return {
            searchText: '',
            searchAutoComplete: [],
        };
    },
    methods: {
        async handleSearchInput() {
            const resp = await ApiRenderer.getSearchSuggest(this.searchText);
            if (resp.code === 200) {
                let tmp = [];
                for (const key in resp.result) {
                    const current = resp.result[key];
                    if (Array.isArray(current) && typeof current[0] === 'object') {
                        tmp.push(...current.map(e => e.name));
                    }
                }
                this.searchAutoComplete = tmp;
            } else {
                this.searchAutoComplete = [];
            }
        },
        handleSearch() {
            const qs = stringify({
                keyword: this.searchText
            });
            this.$router.push(`/search?${qs}`);
        }
    },
    mounted() {
        document.querySelector('.appbar-search-field input').onkeydown = ev => {
            if (ev.key === 'Enter') this.handleSearch();
        };
    }
};
</script>

<style lang="less">
.appbar-search-field {
    width: 400px;
    margin-bottom: 0;
    .mu-input {
        -webkit-app-region: no-drag;
    }
}
</style>
