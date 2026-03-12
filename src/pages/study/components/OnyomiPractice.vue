<template>
	<div class="readingPractice">
		<div class="readingPractice__header">Practice Onyomi</div>
		<div class="readingPractice__options">
			<Button
				v-for="option in options"
				:key="option"
				:variant="selected === option ? 'button' : 'text'"
				:severity="
					feedback !== 'none'
						? option === correctStudyElement
							? 'success'
							: selected === option
								? 'danger'
								: undefined
						: undefined
				"
				@click="$emit('select', option)"
				:disabled="feedback !== 'none'"
			>
				{{ option }}
			</Button>
		</div>
		<div v-if="feedback !== 'none'" class="readingPractice__feedback">
			{{ feedbackMessage }}
		</div>
		<div class="readingPractice__mnemonic">
			<label for="onyomiMnemonic">Your Mnemonic:</label>
			<Textarea
				id="onyomiMnemonic"
				:modelValue="mnemonic"
				@update:modelValue="$emit('update:mnemonic', $event as string)"
				placeholder="Enter a mnemonic to help you remember this reading..."
				class="readingPractice__mnemonic__input"
			/>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { Button, Textarea } from 'primevue';

defineProps<{
	options: string[];
	selected: string;
	feedback: 'none' | 'correct' | 'wrong';
	feedbackMessage: string;
	correctStudyElement: string;
	mnemonic: string;
}>();

defineEmits<{
	(e: 'select', option: string): void;
	(e: 'update:mnemonic', value: string): void;
}>();
</script>

<style lang="scss" scoped>
.readingPractice {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 15px;
	padding: 20px;
	background-color: rgba(255, 255, 255, 0.05);
	border-radius: 8px;
	margin-top: 20px;
	max-width: 40em;
	width: 100%;

	&__header {
		font-size: 1.1em;
		font-weight: 600;
		color: #e5e7eb;
	}

	&__options {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: center;
	}

	&__feedback {
		font-size: 1em;
		font-weight: 600;
		padding: 12px 16px;
		border-radius: 6px;
		text-align: center;
		animation: fadeIn 0.3s ease-in;
		white-space: pre-wrap;
	}

	&__mnemonic {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding-top: 15px;
		border-top: 1px solid rgba(255, 255, 255, 0.1);

		label {
			font-size: 0.95em;
			font-weight: 600;
			color: #d1d5db;
		}

		&__input {
			width: 100%;
			min-height: 80px;
		}
	}
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}
</style>
