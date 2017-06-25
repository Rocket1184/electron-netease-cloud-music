<template>
    <mu-auto-complete icon="search"
        class="appbar-search-field"
        inputClass="appbar-search-input"
        hintText="搜索歌曲、歌单、用户"
        :maxHeight="400"
        openOnFocus
        v-model="searchText"
        :dataSource="searchAutoComplete"
        @input="handleSearchInput()">
    </mu-auto-complete>
</template>

<script>
import ApiRenderer from '../util/apirenderer';
import { searchIconMap } from '../util/searchtype';

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
                        tmp.push(...current.map(e => ({
                            text: e.name,
                            rightIcon: searchIconMap[key]
                        })));
                    }
                }
                this.searchAutoComplete = tmp;
            } else {
                this.searchAutoComplete = [];
            }
        },
        handleSearch() {
            this.$router.push(`/search?q=${this.searchText}`);
        }
    },
    mounted() {
        document.querySelector('.appbar-search-input').onkeydown = ev => {
            if (ev.key === 'Enter') this.handleSearch();
        };
    }
};
</script>

<style lang="less">
.appbar-search-field {
    .mu-text-field {
        color: #FFF;
        margin-bottom: 0;
        -webkit-app-region: no-drag;
        &.focus-state {
            color: #FFF;
        }
        .mu-text-field-hint {
            color: fade(#FFF, 54%);
        }
        .mu-text-field-input {
            color: #FFF;
        }
        .mu-text-field-focus-line {
            background-color: #FFF;
        }
    }
}
</style>
