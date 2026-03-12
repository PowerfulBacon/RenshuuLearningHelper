<template>
	<div class="challengeOptions">
		<div class="challengeInputContainer">
			<label for="onyomiInput">Onyomi Reading:</label>
			<InputText
				ref="inputRef"
				id="onyomiInput"
				:modelValue="modelValue"
				@update:modelValue="$emit('update:modelValue', $event as string)"
				:class="{ 'input--error': challengeWrong, 'input--success': challengeCorrect }"
				@keyup.enter="$emit('submit')"
				:disabled="challengeCorrect"
			/>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { InputText } from 'primevue';

defineProps<{
	modelValue: string;
	challengeCorrect: boolean;
	challengeWrong: boolean;
}>();

defineEmits<{
	(e: 'update:modelValue', value: string): void;
	(e: 'submit'): void;
}>();

const inputRef = ref<{ $el: HTMLInputElement }>();

onMounted(() => {
	inputRef.value?.$el.focus();
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
