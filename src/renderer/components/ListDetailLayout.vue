<template>
    <div class="ld-layout"
        :class="$props.class">
        <div class="ld-list">
            <mu-list v-if="showBack">
                <ListItemBack></ListItemBack>
            </mu-list>
            <div v-if="showTip"
                class="tip">
                <mu-icon :value="tipIcon"
                    color="grey"
                    :size="128"></mu-icon>
                <p>{{tipText}}</p>
            </div>
            <CenteredLoading v-else-if="listLoading"></CenteredLoading>
            <slot v-else
                name="list"></slot>
        </div>
        <div class="ld-detail">
            <CenteredLoading v-if="detailLoading"></CenteredLoading>
            <!-- default slot -->
            <slot v-else></slot>
        </div>
    </div>
</template>

<script>
import ListItemBack from '@/components/ListItemBack.vue';
import CenteredLoading from '@/components/CenteredLoading.vue';

export default {
    props: {
        listLoading: {
            required: false,
            type: Boolean,
            default: false
        },
        detailLoading: {
            required: false,
            type: Boolean,
            default: false
        },
        showBack: {
            required: false,
            type: Boolean,
            default: false
        },
        showTip: {
            required: false,
            type: Boolean,
            default: false
        },
        tipIcon: {
            required: false,
            type: String,
            default: 'nature_people'
        },
        tipText: {
            required: false,
            type: String,
            default: ''
        }
    },
    components: {
        ListItemBack,
        CenteredLoading
    }
};
</script>

<style lang="less">
.ld-layout {
    display: flex;
    flex-direction: row;
    height: 100%;
    .ld-list {
        flex: 1;
        height: 100%;
        overflow: auto;
        box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        .tip {
            height: 100%;
            color: grey;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .mu-item-title {
            font-size: 14px;
        }
    }
    .ld-detail {
        flex: 3;
        height: 100%;
        overflow: auto;
    }
}
</style>
