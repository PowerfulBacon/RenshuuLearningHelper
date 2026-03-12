<template>
	<div class="readingPractice">
		<div class="readingPractice__mnemonic">
			<label for="kunyomiMnemonic">Your Mnemonic:</label>
			<Textarea
				id="kunyomiMnemonic"
				:value="mnemonic"
				@input="$emit('update:mnemonic', ($event.target as HTMLTextAreaElement).value)"
				placeholder="Enter a mnemonic to help you remember this reading..."
				class="readingPractice__mnemonic__input"
			/>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { Textarea } from 'primevue';

defineProps<{
	mnemonic: string;
}>();

defineEmits<{
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
</style>
