<script setup>
import { computed } from 'vue';

const props = defineProps({
    title: {
        type: String,
        required: true
    },
    value: {
        type: [String, Number],
        required: true
    },
    subtitle: {
        type: String,
        default: ''
    },
    icon: {
        type: [Object, Function],
        default: null
    },
    variant: {
        type: String,
        default: 'blue', // 'blue', 'orange', 'purple', 'green', 'red', 'gray'
        validator: (val) => ['blue', 'orange', 'purple', 'green', 'red', 'gray'].includes(val)
    },
    iconBorderClass: {
        type: String,
        default: ''
    }
});

const variantStyles = {
    blue: 'border-blue-500 bg-blue-50/40 text-blue-600',
    orange: 'border-orange-400 bg-orange-50/40 text-orange-500',
    purple: 'border-purple-500 bg-purple-50/40 text-purple-600',
    green: 'border-emerald-500 bg-emerald-50/40 text-emerald-600',
    red: 'border-rose-500 bg-rose-50/40 text-rose-600',
    gray: 'border-gray-400 bg-gray-50/40 text-gray-600'
};

const badgeClasses = computed(() => {
    if (props.iconBorderClass) {
        return props.iconBorderClass;
    }
    return variantStyles[props.variant] || variantStyles.blue;
});
</script>

<template>
    <div class="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200">
        <!-- Background Grid Pattern -->
        <div class="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:1.25rem_1.25rem] opacity-30 pointer-events-none"></div>

        <div class="relative z-10 flex flex-col justify-between h-36">
            <!-- Header Section -->
            <div class="flex items-center justify-between">
                <span class="text-lg font-semibold text-gray-900">{{ title }}</span>
                <div 
                    class="flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-colors"
                    :class="badgeClasses"
                >
                    <slot name="icon">
                        <component :is="icon" v-if="icon" class="w-5 h-5 stroke-[2.5]" />
                    </slot>
                </div>
            </div>

            <!-- Content Section -->
            <div>
                <div class="text-3xl font-bold tracking-tight text-gray-900">
                    <slot name="value">{{ value }}</slot>
                </div>
                <p v-if="subtitle || $slots.subtitle" class="text-sm text-gray-900 mt-1">
                    <slot name="subtitle">{{ subtitle }}</slot>
                </p>
            </div>
        </div>
    </div>
</template>
