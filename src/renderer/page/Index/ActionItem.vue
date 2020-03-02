<template functional>
    <router-link tag="div"
        class="action-item"
        :to="props.to">
        <div class="item-icon mu-primary-text-color">
            <mu-icon :value="props.icon"
                :size="48"></mu-icon>
        </div>
        <p class="item-desc">{{ props.title }}</p>
    </router-link>
</template>

<script>
export default {
    props: {
        to: {
            required: true
        },
        icon: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        }
    }
};
</script>

<style lang="less">
.action-item {
    cursor: pointer;
    .item-icon {
        width: 72px;
        height: 72px;
        box-sizing: border-box;
        border: 2px solid currentColor;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.7;
        transition: 0.5s;
    }
    .item-desc {
        text-align: center;
        margin: 8px 0 0 0;
    }
    &:hover {
        .item-icon {
            // icon color set in @/main.js `MuseUI.theme.addCreateTheme`
            background-color: currentColor;
        }
    }
}
</style>
