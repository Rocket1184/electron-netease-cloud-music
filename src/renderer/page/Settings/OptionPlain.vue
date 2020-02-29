<template functional>
    <mu-list-item button
        v-on="{ click: props.handler ? parent[props.handler] : null }">
        <mu-list-item-title>{{ props.title }}</mu-list-item-title>
        <mu-list-item-action v-if="props.data">
            <span class="nowrap">{{ parent[props.data] }}</span>
        </mu-list-item-action>
    </mu-list-item>
</template>

<script>
export default {
    inheritAttrs: false,
    props: {
        title: {
            type: String,
            required: true
        },
        data: {
            type: String,
            default: ''
        },
        handler: {
            type: String,
            default: ''
        }
    }
};
</script>
