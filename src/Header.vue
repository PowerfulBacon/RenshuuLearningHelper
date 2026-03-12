<template>
	<div class="header">
		<Button @click="leaveApplication"> Exit </Button>
		<div class="grow" />
		<Button @click="toggleLightMode">
			<Moon v-if="!isLightMode" />
			<Sun v-else />
		</Button>
	</div>
</template>

<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next';
import Button from 'primevue/button';
import { ref } from 'vue';
import { RenshuuApiKey, RenshuuProfile, RequestsAllowed, RequestsUsed } from './sharedState/state';

const isLightMode = ref(false);

function toggleLightMode() {
	isLightMode.value = !isLightMode.value;
	document.getElementById('appRoot')?.classList.remove(isLightMode.value ? 'dark' : 'light');
	document.getElementById('appRoot')?.classList.add(isLightMode.value ? 'light' : 'dark');
}

function leaveApplication() {
	RenshuuApiKey.value = undefined;
	RequestsUsed.value = undefined;
	RequestsAllowed.value = undefined;
	RenshuuProfile.value = undefined;
}
</script>

<style scoped lang="scss">
@use 'assets/base.scss';

.header {
	height: 45px;
	background-color: base.$background-mute;
	display: flex;
	flex-direction: row;
	gap: 2em;
	align-items: center;
	padding: 4px;
}

.name {
	justify-self: center;
}

.grow {
	flex-grow: 1;
}
</style>
