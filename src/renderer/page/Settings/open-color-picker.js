import Vue from 'vue';

import ColorPicker from './ColorPicker.vue';

const ColorPickerConstructor = Vue.extend(ColorPicker);

export function openColorPicker() {
    return new Promise((resolve, reject) => {
        let picker = new ColorPickerConstructor({
            el: document.createElement('div')
        });
        document.body.appendChild(picker.$el);
        Vue.nextTick(() => picker.open = true);
        picker.$on('select', color => resolve(color));
        picker.$on('close', () => {
            picker.open = false;
            reject();
            setTimeout(() => {
                picker.$el.parentNode.removeChild(picker.$el);
                picker.$destroy();
                picker = null;
            }, 1000);
        });
    });
}
