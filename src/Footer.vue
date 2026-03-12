<template>
	<div class="footer">
		Created by <a href="https://github.com/powerfulbacon">PowerfulBacon</a>, this application does not
		store any data or contact any site except Renshuu.
		<div class="requestsLeft" v-if="RequestsAllowed && RequestsUsed">
			{{ RequestsAllowed - RequestsUsed }} requests left today, purchase Renshuu pro to increase this
			amount.
		</div>
	</div>
</template>

<script setup lang="ts">
import { RequestsAllowed, RequestsUsed } from './sharedState/state';
</script>

<style scoped lang="scss">
@use 'assets/base.scss';

.footer {
	height: 40px;
	background-color: base.$background-mute;
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
}

.requestsLeft {
	margin-left: 1em;
}
</style>
