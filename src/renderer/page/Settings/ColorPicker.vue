<template>
    <mu-dialog dialog-class="color-picker"
        title="选择颜色"
        :width="500"
        :open="open"
        @close="handleClose">
        <div class="slide-anim-container">
            <transition :name="transitionName">
                <div :key="activeGroup"
                    class="buttons-wrapper">
                    <template v-if="activeGroup < 0">
                        <mu-button v-for="(group, index) in ColorGroups"
                            fab
                            :color="group.primary"
                            :key="group.primary"
                            @click="handleGroup(index)">
                        </mu-button>
                    </template>
                    <template v-else>
                        <mu-button class="color-picker__back"
                            fab
                            color="transparent"
                            textColor="grey"
                            @click="handleGroup(-1)">
                            <mu-icon value="arrow_back"></mu-icon>
                        </mu-button>
                        <mu-button v-for="color in ColorGroups[activeGroup].varieties"
                            fab
                            :key="color"
                            :color="color"
                            @click="handleSelect(color)"></mu-button>
                    </template>
                </div>
            </transition>
        </div>
        <template #actions>
            <mu-button flat
                color="primary"
                @click="handleClose">关闭</mu-button>
        </template>
    </mu-dialog>
</template>

<script>
import { Colors } from 'muse-ui';

const ColorBlockList = [
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

/** @type { [string, string][] }  */
const ColorEntries = Object.entries(Colors)
    .filter(([key]) => typeof key === 'string' && !ColorBlockList.includes(key));

const ReColorName = /^[a-zA-Z]+$/;

const ColorGroups = ColorEntries
    .filter(([key]) => ReColorName.test(key))
    .map(([key, value]) => {
        const re = new RegExp(`^${key}A?[0-9]+$`);
        return {
            primary: value,
            varieties: ColorEntries.filter(q => re.test(q[0])).map(q => q[1])
        };
    });

export default {
    data() {
        return {
            open: false,
            activeGroup: -1,
            transitionName: ''
        };
    },
    computed: {
        ColorGroups() { return ColorGroups; }
    },
    methods: {
        handleGroup(g) {
            this.transitionName = g < 0 ? 'slide-right' : 'slide-left';
            this.activeGroup = g;
        },
        handleClose() {
            this.$emit('close');
        },
        handleSelect(color) {
            this.$emit('select', color);
            this.handleClose();
        }
    }
};
</script>

<style lang="less">
.color-picker {
    .slide-anim-container {
        min-height: 192px;
    }
    .buttons-wrapper {
        .color-picker__back {
            vertical-align: top;
        }
        .mu-fab-button {
            margin: 0 8px 8px 0;
        }
    }
}
</style>
