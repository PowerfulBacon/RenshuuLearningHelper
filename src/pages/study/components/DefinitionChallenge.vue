<template>
	<div class="challengeOptions">
		<Button
			v-for="option in options"
			:key="option"
			:variant="selected.includes(option) ? 'button' : 'text'"
			:severity="
				revealed.length > 0 && correctOptions.includes(option) !== selected.includes(option)
					? 'danger'
					: undefined
			"
			@click="$emit('toggle', option)"
		>
			{{ option }}
		</Button>
	</div>
</template>

<script lang="ts" setup>
import { Button } from 'primevue';

defineProps<{
	options: string[];
	correctOptions: string[];
	selected: string[];
	revealed: string[];
}>();

defineEmits<{
	(e: 'toggle', option: string): void;
}>();
</script>

<style lang="scss" scoped>
.challengeOptions {
	padding-top: 40px;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 15px;
	max-width: 40em;
	justify-content: center;
	align-items: center;
}
</style>
