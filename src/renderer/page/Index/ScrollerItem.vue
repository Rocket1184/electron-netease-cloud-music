<template functional>
    <router-link :to="props.to"
        :title="props.title"
        class="scroll-item">
        <div class="cover">
            <img class="img"
                :src="props.img"
                :alt="props.title"
                width="160"
                height="160">
            <div v-if="props.maskIcon"
                class="mask">
                <mu-icon :value="props.maskIcon"
                    :size="16"></mu-icon>
                <span class="text">{{ props.maskText }}</span>
            </div>
        </div>
        <div v-if="itemSubTitle"
            class="caption">
            <div class="title__sup">{{ props.itemTitle }}</div>
            <div class="title__sub">{{ props.itemSubTitle }}</div>
        </div>
        <div class="caption"
            v-else>{{ props.itemTitle }}</div>
    </router-link>
</template>

<script>
export default {
    props: {
        to: {
            required: true
        },
        img: {
            type: String
        },
        title: {
            type: String,
            required: false
        },
        maskIcon: {
            type: String,
            required: false
        },
        maskText: {
            type: String,
            required: false
        },
        itemTitle: {
            type: String,
            required: true
        },
        itemSubTitle: {
            type: String,
            required: false
        }
    }
};
</script>

<style lang="less">
.scroll-item {
    width: 160px;
    height: 210px;
    margin-left: 12px;
    flex-shrink: 0;
    cursor: pointer;
    .cover {
        height: 160px;
        width: 160px;
        position: relative;
        color: #e5e2e5;
        .mask {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            color: currentColor;
            padding: 6px 10px;
            background-color: rgba(0, 0, 0, 0.54);
            .text {
                margin-left: 4px;
                flex-grow: 1;
            }
        }
        .mu-icon {
            vertical-align: text-bottom;
            color: currentColor;
        }
    }
    .caption {
        color: var(--text-color);
        height: 42px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .title__sup,
    .title__sub {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .title__sub {
        opacity: 0.62;
    }
}
</style>
