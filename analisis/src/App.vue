<script setup lang="ts">
import { onMounted } from 'vue';
import { useEventStore } from './stores/eventStore';
import { useAuthStore } from './stores/AuthStore';

const eventStore = useEventStore();
const authStore = useAuthStore();

onMounted(() => {
  authStore.initAuth();
  eventStore.loadEvents();
});
</script>

<template>
  <router-view></router-view>
</template>