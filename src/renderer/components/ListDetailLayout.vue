<template>
    <div class="ld-layout">
        <div class="ld-list">
            <div v-if="showTip"
                class="tip">
                <mu-icon :value="tipIcon"
                    color="grey"
                    :size="128"></mu-icon>
                <p>{{tipText}}</p>
            </div>
            <slot v-else
                name="list"></slot>
        </div>
        <div class="ld-detail">
            <div v-if="loading"
                class="ld-loading">
                <mu-circular-progress color="secondary"
                    :size="60"
                    :stroke-width="5"></mu-circular-progress>
            </div>
            <slot v-else
                name="detail"></slot>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        loading: {
            required: true,
            type: Boolean
        },
        showTip: {
            required: true,
            type: Boolean
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
        .ld-loading {
            display: flex;
            height: 100%;
            justify-content: center;
            align-items: center;
        }
    }
}
</style>
