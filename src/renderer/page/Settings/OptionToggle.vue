<template functional>
    <mu-list-item button
        :open="true"
        @click="parent.setByName(props.prop, !parent.settings[props.prop])">
        <mu-list-item-title>{{ props.title }}</mu-list-item-title>
        <mu-list-item-action>
            <mu-switch :inputValue="parent.settings[props.prop]"
                color="secondary"></mu-switch>
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
