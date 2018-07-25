<template>
    <mu-auto-complete dense
        icon="search"
        class="appbar-search-field"
        placeholder="搜索歌曲、歌单、用户"
        v-model="searchText"
        :filter="filterData"
        @select="handleSearch">
    </mu-auto-complete>
</template>

<script>
import { stringify } from 'querystring';
import ApiRenderer from '@/util/apiRenderer';

export default {
    data() {
        return {
            searchText: ''
        };
    },
    methods: {
        async filterData(query) {
            if (query <= 0) {
                return [];
            }
            const resp = await ApiRenderer.getSearchSuggest(query);
            if (resp.code !== 200) {
                return [];
            }
            const tmp = [];
            for (const [k, v] of Object.entries(resp.result)) {
                if (k === 'order') {
                    continue;
                }
                for (const item of v) {
                    const index = item.name.toLowerCase().indexOf(query.toLowerCase());
                    if (index === -1) {
                        tmp.push({
                            value: item.name,
                            item,
                            highlight: item.name
                        });
                        continue;
                    }
                    const before = item.name.substring(0, index);
                    const highlight = item.name.substring(index, index + query.length);
                    const after = item.name.substring(index + query.length);
                    tmp.push({
                        value: item.name,
                        item,
                        highlight: `${before}<span class="mu-secondary-text-color">${highlight}</span>${after}`
                    });
                }
            }
            return tmp;
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
