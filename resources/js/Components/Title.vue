<script setup>
defineProps({
    title: {
        type: String,
    },
    subtitle: {
        type: String,
    },
});
</script>

<template>
    <div class="py-6 flex flex-col">
        <h1 class="text-2xl font-bold text-gray-800">{{ title }}</h1>
        <p class="text-sm text-gray-600">{{ subtitle }}</p>
    </div>
</template>
