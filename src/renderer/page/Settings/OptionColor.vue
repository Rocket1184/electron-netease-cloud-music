<template functional>
    <mu-list-item button
        @click="parent.setColorByName(props.prop)">
        <mu-list-item-title>{{ props.title }}</mu-list-item-title>
        <mu-list-item-action>
            <mu-avatar :size="24"
                :color="parent.settings[props.prop]"></mu-avatar>
        </mu-list-item-action>
    </mu-list-item>
</template>

<script>
export default {
    props: {
        title: {
            type: String,
            required: true
        },
        prop: {
            type: String,
            required: true
        }
    }
};
</script>
