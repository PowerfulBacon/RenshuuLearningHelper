import './assets/main.scss';

import PrimeVue from 'primevue/config';
import { createApp } from 'vue';
import Aura from '@primeuix/themes/aura';
import App from './App.vue';

const app = createApp(App);
app.use(PrimeVue, {
	theme: {
		preset: Aura,
		options: {
			prefix: 'p',
			darkModeSelector: '.dark',
			cssLayer: false,
		},
	},
});

app.mount('#app');
