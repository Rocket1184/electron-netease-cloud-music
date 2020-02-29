<template functional>
    <mu-list-item>
        <mu-list-item-title>{{ props.title }}</mu-list-item-title>
        <mu-list-item-action>
            <mu-select :value="parent.settings[props.prop]"
                @change="parent.setByName(props.prop, $event)">
                <mu-option v-for="p of props.options"
                    :key="p.label"
                    v-bind="p"></mu-option>
            </mu-select>
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
        },
        options: {
            type: Array,
            required: true
        }
    }
};
</script>
