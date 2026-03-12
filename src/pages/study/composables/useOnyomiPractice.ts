import { ref, watch, type Ref } from 'vue';
import { katakanaToHiraganaText, generateRandomHiragana, shuffle } from '../../../types/helpers';
import { StudyTermType, type StudyTerm } from '../types';

export function useOnyomiPractice(
	studyQueue: Ref<StudyTerm[]>,
	currentTerm: Ref<StudyTerm | undefined>
) {
	const onyomiOptions: Ref<string[]> = ref([]);
	const onyomiSelected: Ref<string> = ref('');
	const onyomiFeedback: Ref<'none' | 'correct' | 'wrong'> = ref('none');
	const onyomiFeedbackMessage: Ref<string> = ref('');

	watch(currentTerm, () => {
		onyomiSelected.value = '';
		onyomiFeedback.value = 'none';
		onyomiFeedbackMessage.value = '';
		if (currentTerm.value?.type === StudyTermType.Onyomi) {
			buildOnyomiOptions();
		}
	});

	function buildOnyomiOptions() {
		if (!currentTerm.value || currentTerm.value.type !== StudyTermType.Onyomi) return;

		const correctKatakana = currentTerm.value.studyElement;
		const correctHiragana = katakanaToHiraganaText(correctKatakana);
		const targetLength = correctKatakana.length;
		const wrongOptions: string[] = [];

		for (const term of studyQueue.value) {
			if (term.type === StudyTermType.Onyomi && term.studyElement !== correctKatakana) {
				const hiraganaOption = katakanaToHiraganaText(term.studyElement);
				if (hiraganaOption.length === targetLength && !wrongOptions.includes(hiraganaOption)) {
					wrongOptions.push(hiraganaOption);
				}
			}
		}

		shuffle(wrongOptions);
		const selectedWrong = wrongOptions.slice(0, 3);

		while (selectedWrong.length < 3) {
			const randomOption = correctKatakana
				.split(',')
				.map((x) => generateRandomHiragana(x.length))
				.join(',');
			if (randomOption !== correctHiragana && !selectedWrong.includes(randomOption)) {
				selectedWrong.push(randomOption);
			}
		}

		const allOptions = [correctHiragana, ...selectedWrong];
		shuffle(allOptions);
		onyomiOptions.value = allOptions;
	}

	function submitOnyomiAnswer(selected: string) {
		if (!currentTerm.value || onyomiFeedback.value !== 'none') return;

		onyomiSelected.value = selected;
		const correctHiragana = katakanaToHiraganaText(currentTerm.value.studyElement);

		if (selected === correctHiragana) {
			onyomiFeedback.value = 'correct';
			onyomiFeedbackMessage.value = 'Correct!';
		} else {
			onyomiFeedback.value = 'wrong';
			onyomiFeedbackMessage.value = `Wrong! The correct answer is ${correctHiragana}`;
		}

		setTimeout(() => {
			onyomiFeedback.value = 'none';
			onyomiSelected.value = '';
		}, 2000);
	}

	return {
		onyomiOptions,
		onyomiSelected,
		onyomiFeedback,
		onyomiFeedbackMessage,
		submitOnyomiAnswer,
	};
}
