<template>
    <mu-dialog dialog-class="color-picker"
        title="选择颜色"
        :width="500"
        :open="open"
        @close="handleClose">
        <div v-show="activeGroup < 0"
            class="buttons-wrapper">
            <mu-button v-for="(group, index) in colorGroups"
                fab
                :color="group.primary"
                :key="group.primary"
                @click.native="activeGroup = index">
            </mu-button>
        </div>
        <div v-if="activeGroup >= 0"
            class="buttons-wrapper">
            <mu-button fab
                color="transparent"
                textColor="grey"
                @click="activeGroup = -1">
                <mu-icon value="undo"></mu-icon>
            </mu-button>
            <mu-button v-for="color in colorGroups[activeGroup].varieties"
                fab
                :key="color"
                :color="color"
                @click="handleSelect(color)"></mu-button>
        </div>
        <template #actions>
            <mu-button flat
                color="primary"
                @click="handleClose">关闭</mu-button>
        </template>
    </mu-dialog>
</template>

<script>
import * as Colors from 'muse-ui/lib/theme/colors';

const vainColors = [
    'black',
    'white',
    'darkBlack',
    'darkWhite',
    'faintBlack',
    'fullBlack',
    'fullWhite',
    'lightWhite',
    'lightBlack',
    'minBlack',
    'transparent'
];

const colorEntries = Object.entries(Colors)
    .filter(p => typeof p[0] === 'string' && !vainColors.includes(p[0]));

let colorGroups = colorEntries
    .filter(p => /^[a-zA-Z]+$/.test(p[0]))
    .map(p => {
        const regexp = new RegExp(`^${p[0]}A?[0-9]+$`);
        return {
            primary: p[1],
            varieties: colorEntries.filter(q => regexp.test(q[0])).map(q => q[1])
        };
    });

export default {
    props: {
        open: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            colorGroups,
            activeGroup: -1
        };
    },
    methods: {
        handleClose() {
            this.$emit('update:open', false);
        },
        handleSelect(color) {
            this.$emit('select', color);
            this.handleClose();
            this.activeGroup = -1;
        }
    }
};
</script>

<style lang="less">
.color-picker {
    .buttons-wrapper {
        display: flex;
        flex-wrap: wrap;
        button {
            margin: 0 8px 8px 0;
        }
    }
}
</style>
