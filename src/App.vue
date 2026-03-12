<template>
	<div class="applicationView">
		<header>
			<Header />
		</header>
		<main>
			<SetupPage v-if="!RenshuuApiKey" />
			<LandingPage v-else />
		</main>
		<footer>
			<Footer />
		</footer>
	</div>
</template>

<script setup lang="ts">
import Footer from './Footer.vue';
import Header from './Header.vue';
import LandingPage from './pages/landing/LandingPage.vue';
import SetupPage from './pages/setup/SetupPage.vue';
import { RenshuuApiKey } from './sharedState/state';
</script>

<style scoped lang="scss">
@use './assets/base.scss';

header {
	height: 45px;
	background-color: base.$primary;
}

main {
	display: flex;
	flex-grow: 1;
	justify-content: center;
	align-items: center;
}

.applicationView {
	height: 100vh;
	width: 100vw;
	display: flex;
	flex-direction: column;
}
</style>
