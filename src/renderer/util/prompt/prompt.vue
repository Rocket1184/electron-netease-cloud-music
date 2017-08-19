<template>
    <mu-dialog :open="prompt"
        :title="promptTitle">
        <div v-html="promptText"></div>
        <mu-flat-button slot="actions"
            @click="prompt=false"
            primary
            label="取消"></mu-flat-button>
        <mu-flat-button slot="actions"
            primary
            @click="promptAction"
            label="确定"></mu-flat-button>
    </mu-dialog>
</template>

<script>
export default {
    data() {
        return {
            prompt: false,
            promptTitle: '',
            promptText: '',
            promptAction: () => { },
        };
    },
    methods: {
        showPrompt(cfg) {
            this.prompt = true;
            this.promptTitle = cfg.title;
            this.promptText = cfg.text;
            this.promptAction = async () => {
                await cfg.action();
                this.prompt = false;
            };
        }
    }
};
</script>
