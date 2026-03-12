<template>
	<div class="introText">
		<p>Welcome to my Renshuu learning helper!</p>
		<p>
			This application will teach you kanji and words from your Renshuu schedules one element at a time
			to help with your learning.
		</p>
		<p>
			Once you have learned those terms, head back to
			<a href="https://www.renshuu.org/index.php?page=misc/api">Renshuu</a> and complete the quiz for
			those terms!
		</p>
		<div class="apiKeyInput">
			Api Key:
			<Password
				class="apiKeyInput__inputBox"
				placeholder="Renshuu read-only API key"
				ref="inputText"
				@value-change="(val) => (apiValue = val)"
				:feedback="false"
				fluid
			/>
			<Button :disabled="confirming" @click="testApi"> Submit </Button>
		</div>
		<div v-if="errorMessage" class="badInput">
			{{ errorMessage }}
		</div>
	</div>
</template>
<script setup lang="ts">
import { fetchProfile } from '../../types/profile';
import {
	RenshuuApiKey,
	RenshuuProfile,
	RequestsAllowed,
	RequestsUsed,
} from '../../sharedState/state';
import { Button, Password } from 'primevue';
import { ref, type Ref } from 'vue';

const confirming = ref(false);

const errorMessage: Ref<string | undefined> = ref(undefined);

const apiValue: Ref<string | undefined> = ref(undefined);

async function testApi() {
	if (!apiValue.value) {
		errorMessage.value = `No API key entered!`;
		return;
	}
	confirming.value = true;
	const resultObject = await fetchProfile(apiValue.value);
	confirming.value = false;
	if ('error' in resultObject) {
		errorMessage.value = resultObject.error;
	} else if (
		'api_usage' in resultObject &&
		'calls_today' in resultObject.api_usage &&
		'daily_allowance' in resultObject.api_usage
	) {
		RenshuuApiKey.value = apiValue.value;
		RequestsUsed.value = resultObject.api_usage.calls_today;
		RequestsAllowed.value = resultObject.api_usage.daily_allowance;
		RenshuuProfile.value = resultObject;
	} else {
		errorMessage.value = `Sorry, the application is not able to function due to updated endpoints. Please contact the developer.`;
	}
}
</script>
<style lang="scss" scoped>
@use '../../assets/base.scss';

.introText {
	text-align: center;
	max-width: 40em;
	display: flex;
	flex-direction: column;
	gap: 14px;
}

.apiKeyInput {
	display: flex;
	flex-direction: row;
	gap: 1em;
	align-items: center;

	&__inputBox {
		flex-grow: 1;
	}
}

.badInput {
	color: base.$primary-text;
}
</style>
