<script setup>
defineProps({ playing: Boolean });
defineEmits(['toggle']);
</script>

<template>
<button id="music-toggle" class="music-toggle" type="button" data-idle-hide aria-label="播放或暂停音乐" :aria-pressed="playing" title="音乐" @click="$emit('toggle')"><span aria-hidden="true">♪</span></button>
</template>
