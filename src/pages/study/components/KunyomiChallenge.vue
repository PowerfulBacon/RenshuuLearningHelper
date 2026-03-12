<template>
	<div class="challengeOptions">
		<!-- Verb-based kunyomi: text input -->
		<div v-if="options.length === 0" class="challengeInputContainer">
			<label for="kunyomiInput">What is the reading for {{ kanjiLabel }}?</label>
			<InputText
				ref="inputRef"
				id="kunyomiInput"
				:modelValue="modelValue"
				@update:modelValue="$emit('update:modelValue', $event as string)"
				:class="{ 'input--error': challengeWrong, 'input--success': challengeCorrect }"
				@keyup.enter="$emit('submit')"
				:disabled="challengeCorrect"
			/>
		</div>
		<!-- Non-verb kunyomi: multiple choice -->
		<div v-else>
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
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { Button, InputText } from 'primevue';

const props = defineProps<{
	options: string[];
	correctOptions: string[];
	selected: string[];
	revealed: string[];
	kanjiLabel: string;
	modelValue: string;
	challengeCorrect: boolean;
	challengeWrong: boolean;
}>();

defineEmits<{
	(e: 'toggle', option: string): void;
	(e: 'update:modelValue', value: string): void;
	(e: 'submit'): void;
}>();

const inputRef = ref<{ $el: HTMLInputElement }>();

onMounted(() => {
	if (props.options.length === 0) {
		inputRef.value?.$el.focus();
	}
});
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

.challengeInputContainer {
	display: flex;
	flex-direction: column;
	gap: 10px;
	align-items: center;

	label {
		font-size: 1.1em;
		font-weight: 600;
		color: #e5e7eb;
	}
}

:deep(.input--error) {
	border-color: #dc2626 !important;
	background-color: rgba(220, 38, 38, 0.1) !important;
}

:deep(.input--success) {
	border-color: #16a34a !important;
	background-color: rgba(22, 163, 74, 0.1) !important;
}
</style>
