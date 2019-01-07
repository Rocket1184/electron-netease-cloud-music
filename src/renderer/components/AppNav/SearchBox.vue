<template>
    <mu-menu class="searchbox"
        cover
        placement="left"
        popover-class="searchbox-popover">
        <mu-button icon
            @click="focusInput">
            <mu-icon value="search"></mu-icon>
        </mu-button>
        <mu-auto-complete dense
            solo
            full-width
            color="secondary"
            slot="content"
            icon="search"
            ref="textField"
            placeholder="搜索单曲、歌手、专辑、用户 ..."
            v-model="searchText"
            :filter="filterData"
            @select="handleCompleteSelect">
        </mu-auto-complete>
    </mu-menu>
</template>

<script>
import { stringify } from 'querystring';
import Api from '@/util/api';

export default {
    data() {
        return {
            searchText: ''
        };
    },
    methods: {
        focusInput() {
            setTimeout(() => this.$refs.textField.$el.querySelector('input').focus(), 200);
        },
        async filterData(query) {
            if (query <= 0) {
                return [];
            }
            const resp = await Api.getSearchSuggest(query);
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
        },
        handleCompleteSelect(value, item) {
            // event 'select' would be triggered by selecting text in textField
            if (typeof value === 'string' && item.name === value) {
                this.handleSearch();
            }
        }
    },
    mounted() {
        this.$refs.textField.$el.querySelector('input').onkeydown = ev => {
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
