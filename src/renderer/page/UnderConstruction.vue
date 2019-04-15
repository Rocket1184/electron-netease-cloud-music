<template>
    <ListDetailLayout class="ncm-page"
        showBack>
        <CenteredTip></CenteredTip>
    </ListDetailLayout>
</template>

<script>
import CenteredTip from '@/components/CenteredTip.vue';
import ListDetailLayout from '@/components/ListDetailLayout.vue';

export default {
    components: {
        CenteredTip,
        ListDetailLayout
    }
};
</script>
