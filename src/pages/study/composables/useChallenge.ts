import { ref, computed, reactive, watch, type Ref, type Reactive } from 'vue';
import * as wanakana from 'wanakana';
import type { KanjiTerm } from '../../../types/scheulde';
import { katakanaToHiraganaText, shuffle } from '../../../types/helpers';
import { StudyTermType, type StudyTerm, type ChallengeQuestion } from '../types';

export function useChallenge(
	studyQueue: Ref<StudyTerm[]>,
	getMnemonic: (term: StudyTerm) => string
) {
	let lastCompletedChallenge = 0;

	const isInChallenge = ref(false);
	const isSessionComplete = ref(false);

	const challengeList: Ref<ChallengeQuestion[]> = ref([]);
	const currentChallengeIndex: Ref<number> = ref(0);
	const currentChallenge = computed(() => challengeList.value[currentChallengeIndex.value]);

	const challengeSelected: Reactive<string[]> = reactive([]);
	const challengeRevealed: Reactive<string[]> = reactive([]);
	const challengeCorrect: Ref<boolean> = ref(false);
	const challengeWrong: Ref<boolean> = ref(false);
	const wrongAttempts: Ref<number> = ref(0);
	const feedbackMessage: Ref<string> = ref('');
	const forceRetypeAnswer: Ref<boolean> = ref(false);
	const allCorrectReadings: Ref<string[]> = ref([]);
	const onyomiText = ref('');

	watch(onyomiText, () => {
		onyomiText.value = wanakana.toHiragana(onyomiText.value, { IMEMode: true });
	});

	watch(currentChallenge, () => {
		if (!currentChallenge.value) {
			isInChallenge.value = false;
			if (lastCompletedChallenge === studyQueue.value.length - 1) {
				isSessionComplete.value = true;
			}
		}
		challengeCorrect.value = false;
		challengeWrong.value = false;
		wrongAttempts.value = 0;
		feedbackMessage.value = '';
		forceRetypeAnswer.value = false;
		allCorrectReadings.value = [];
		onyomiText.value = '';
	});

	function checkChallenge(index: number) {
		if (index <= lastCompletedChallenge) {
			return;
		}
		isInChallenge.value = true;
		lastCompletedChallenge = index;
		const challengeTerms = [...studyQueue.value].splice(Math.max(0, index - 6), Math.min(index, 6));
		challengeList.value = [];
		for (const term of challengeTerms) {
			challengeList.value.push(...buildChallengeQuestion(term, challengeTerms));
		}
		shuffle(challengeList.value);
		currentChallengeIndex.value = 0;
		challengeSelected.splice(0);
		challengeRevealed.splice(0);
	}

	function skipChallenge() {
		challengeList.value.splice(0);
		currentChallengeIndex.value = 0;
	}

	function submitChallenge() {
		if (!currentChallenge.value) return;
		if (challengeCorrect.value) return;

		// Handle text input for onyomi / verb-based kunyomi challenges
		if (
			currentChallenge.value.term.type === StudyTermType.Onyomi ||
			(currentChallenge.value.term.type === StudyTermType.Kunyomi &&
				currentChallenge.value.options.length === 0)
		) {
			const userInput = onyomiText.value.trim();
			const correct = currentChallenge.value.correctOptions;
			const isCorrect = correct.includes(userInput);

			if (isCorrect) {
				if (forceRetypeAnswer.value) {
					forceRetypeAnswer.value = false;
					allCorrectReadings.value = [];
					onyomiText.value = '';
					challengeList.value.push(currentChallenge.value);
					currentChallengeIndex.value++;
				} else {
					challengeCorrect.value = true;
					allCorrectReadings.value = correct;
					feedbackMessage.value =
						correct.length > 1 ? `Correct! All acceptable readings: ${correct.join(', ')}` : 'Correct!';
					setTimeout(() => {
						currentChallengeIndex.value++;
						onyomiText.value = '';
					}, 2000);
				}
			} else {
				if (!forceRetypeAnswer.value) {
					forceRetypeAnswer.value = true;
					challengeWrong.value = true;
					const mnemonic = getMnemonic(currentChallenge.value.term);
					feedbackMessage.value = `Wrong! Type the correct answer: ${correct.join(', ')}${mnemonic ? `\n\nYour mnemonic: ${mnemonic}` : ''}`;
					onyomiText.value = '';
					setTimeout(() => {
						challengeWrong.value = false;
					}, 500);
				} else {
					challengeWrong.value = true;
					const mnemonic = getMnemonic(currentChallenge.value.term);
					feedbackMessage.value = `That's not correct. Try again: ${correct.join(', ')}${mnemonic ? `\n\nYour mnemonic: ${mnemonic}` : ''}`;
					onyomiText.value = '';
					setTimeout(() => {
						challengeWrong.value = false;
					}, 500);
				}
			}
			return;
		}

		// Handle multiple choice for definition / non-verb kunyomi challenges
		const correct = currentChallenge.value.correctOptions;
		const allCorrectSelected =
			correct.every((x) => challengeSelected.includes(x)) &&
			challengeSelected.every((x) => correct.includes(x));

		if (allCorrectSelected) {
			challengeCorrect.value = true;
			setTimeout(() => {
				currentChallengeIndex.value++;
				challengeSelected.splice(0);
				challengeRevealed.splice(0);
				challengeCorrect.value = false;
			}, 1000);
		} else {
			wrongAttempts.value++;
			if (wrongAttempts.value === 1) {
				challengeWrong.value = true;
				const correctCount = challengeSelected.filter((x) => correct.includes(x)).length;
				const totalCorrect = correct.length;
				const totalWrong = challengeSelected.filter((x) => !correct.includes(x)).length;
				const needToSelect = totalCorrect - correctCount;
				if (needToSelect > 0 && totalWrong > 0) {
					feedbackMessage.value = `You selected ${totalWrong} wrong answers, and you need to select ${needToSelect} more correct answer`;
				} else if (needToSelect > 0) {
					feedbackMessage.value = `You need to select ${needToSelect} more`;
				} else {
					feedbackMessage.value = `Deselect ${totalWrong} answer${totalWrong !== 1 ? 's' : ''}`;
				}
				setTimeout(() => {
					challengeWrong.value = false;
				}, 500);
			} else {
				challengeWrong.value = true;
				feedbackMessage.value = '';
				for (const option of correct) {
					if (!challengeRevealed.includes(option)) {
						challengeRevealed.push(option);
					}
				}
				setTimeout(() => {
					challengeWrong.value = false;
				}, 500);
			}
		}
	}

	function buildChallengeQuestion(term: StudyTerm, terms: StudyTerm[]): ChallengeQuestion[] {
		const challenges: ChallengeQuestion[] = [];

		if (term.type === StudyTermType.Definition) {
			let correctTerms = term.studyElement.split(',').map((x) => x.trim());
			const invalidTerms: string[] = [];

			for (const wrongTerm of terms) {
				if (wrongTerm === term || wrongTerm.type !== StudyTermType.Definition) continue;
				wrongTerm.studyElement
					.split(',')
					.map((x) => x.trim())
					.forEach((x) => {
						if (!correctTerms.includes(x)) invalidTerms.push(x);
					});
			}

			if (correctTerms.length > 5) {
				const firstTerms = correctTerms.splice(0, 3);
				shuffle(correctTerms);
				correctTerms = [...firstTerms, correctTerms[0]!, correctTerms[1]!];
			}
			if (invalidTerms.length > 5) {
				shuffle(invalidTerms);
				invalidTerms.splice(5);
			}

			const allTerms = [...correctTerms, ...invalidTerms];
			shuffle(allTerms);
			challenges.push({ term, options: allTerms, correctOptions: correctTerms });
		} else if (term.type === StudyTermType.Onyomi) {
			const readings = term.studyElement.split(',').map((x) => katakanaToHiraganaText(x.trim()));
			challenges.push({ term, options: [], correctOptions: readings });
		} else if (term.type === StudyTermType.Kunyomi) {
			const isVerbBased = term.kanji !== (term.source as KanjiTerm).kanji;

			if (isVerbBased) {
				challenges.push({ term, correctOptions: [term.studyElement], options: [], verbQuestion: '' });
			} else {
				const baseReadings = term.studyElement.split(',').map((x) => x.trim());
				const invalidReadings: string[] = [];

				for (const wrongStudyTerm of terms) {
					if (wrongStudyTerm === term || wrongStudyTerm.type !== StudyTermType.Kunyomi) continue;
					const isWrongVerbBased = wrongStudyTerm.kanji !== (wrongStudyTerm.source as KanjiTerm).kanji;
					if (isWrongVerbBased) continue;
					wrongStudyTerm.studyElement.split(',').forEach((reading) => {
						const trimmed = reading.trim();
						if (!baseReadings.includes(trimmed) && !invalidReadings.includes(trimmed)) {
							invalidReadings.push(trimmed);
						}
					});
				}

				if (invalidReadings.length > 3) {
					shuffle(invalidReadings);
					invalidReadings.splice(3);
				}

				const allReadings = [...baseReadings, ...invalidReadings];
				shuffle(allReadings);
				challenges.push({ term, correctOptions: baseReadings, options: allReadings });
			}
		}

		return challenges;
	}

	return {
		isInChallenge,
		isSessionComplete,
		currentChallengeIndex,
		currentChallenge,
		challengeSelected,
		challengeRevealed,
		challengeCorrect,
		challengeWrong,
		feedbackMessage,
		onyomiText,
		checkChallenge,
		skipChallenge,
		submitChallenge,
	};
}
