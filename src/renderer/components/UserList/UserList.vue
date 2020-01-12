<template>
    <mu-list class="u-list"
        textline="two-line">
        <UserItem v-for="u in users"
            :key="u.userId"
            :user="u"></UserItem>
    </mu-list>
</template>

<script>
import UserItem from './UserItem.vue';

export default {
    props: {
        users: {
            type: Array,
            default: () => []
        }
    },
    components: {
        UserItem
    }
};
</script>
