<script setup>
import { cn } from "@/lib/utils";

const props = defineProps({
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
});
</script>

<template>
  <div
    data-slot="card-title"
    :class="
      cn(
        'text-lg leading-normal font-bold group-data-[size=sm]/card:text-sm cn-font-heading',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
