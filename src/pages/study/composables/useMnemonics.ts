import { ref, watch, type Ref } from 'vue';
import type { StudyTerm } from '../types';

export function useMnemonics() {
	const mnemonics: Ref<{ [key: string]: string }> = ref({});

	watch(
		mnemonics,
		(newMnemonics) => {
			localStorage.setItem('renshuuMnemonics', JSON.stringify(newMnemonics));
		},
		{ deep: true }
	);

	function getMnemonicKey(term: StudyTerm): string {
		return `${term.kanji}_${term.type}`;
	}

	function getMnemonic(term: StudyTerm): string {
		return mnemonics.value[getMnemonicKey(term)] || '';
	}

	function loadMnemonics() {
		const saved = localStorage.getItem('renshuuMnemonics');
		if (saved) {
			try {
				mnemonics.value = JSON.parse(saved);
			} catch (e) {
				console.error('Failed to load mnemonics from localStorage:', e);
			}
		}
	}

	return { mnemonics, getMnemonicKey, getMnemonic, loadMnemonics };
}
