import { ref, type Ref } from 'vue';
import type { KanjiTerm, VocabTerm, GrammarTerm } from '../../../types/scheulde';
import { shuffle } from '../../../types/helpers';
import { StudyTermType, type StudyTerm } from '../types';
import { fetchWord } from '../../../types/words';
import { RenshuuApiKey } from '../../../sharedState/state';

function parseKunyomiReading(reading: string): { base: string; verbs: string[] }[] {
	const items = reading.split(',').map((item) => item.trim());
	const grouped: { [key: string]: string[] } = {};

	for (const item of items) {
		if (item.includes('.')) {
			const [base, verb] = item.split('.');
			if (base && verb) {
				if (!grouped[base]) {
					grouped[base] = [];
				}
				grouped[base].push(verb);
			}
		} else {
			if (!grouped[item]) {
				grouped[item] = [];
			}
		}
	}

	return Object.entries(grouped).map(([base, verbs]) => ({ base, verbs }));
}

export function formatKunyomiReading(reading: string): string {
	const items = reading.split(',').map((item) => item.trim());
	const groupedByReading: { [key: string]: string[] } = {};

	for (const item of items) {
		if (item.includes('.')) {
			const [base, verb] = item.split('.');
			if (base && verb) {
				if (!groupedByReading[base]) {
					groupedByReading[base] = [];
				}
				groupedByReading[base].push(verb);
			} else {
				if (!groupedByReading[item]) {
					groupedByReading[item] = [];
				}
			}
		} else {
			if (!groupedByReading[item]) {
				groupedByReading[item] = [];
			}
		}
	}

	return Object.entries(groupedByReading)
		.map(([base, verbs]) => (verbs.length === 0 ? base : `${base} (${verbs.join(', ')})`))
		.join(', ');
}

export function useStudyQueue() {
	const studyQueue: Ref<StudyTerm[]> = ref([]);

	async function buildQueue(terms: (KanjiTerm | VocabTerm | GrammarTerm)[]) {
		const unstudied = [...terms];
		shuffle(unstudied);

		const newQueue: StudyTerm[] = [];

		for (const term of unstudied) {
      if ('kanji' in term) {
        newQueue.push({
          source: term,
          kanji: term.kanji,
          studyElement: term.definition,
          type: StudyTermType.Definition,
        });
      }
      else if ('kanji_full' in term) {
        newQueue.push({
          source: term,
          kanji: term.kanji_full.length === 0 ? term.hiragana_full : term.kanji_full,
          studyElement: typeof term.def === 'string' ? term.def : term.def.join(', '),
          type: StudyTermType.Definition,
        });
      } else {
        newQueue.push({
          source: term,
          kanji: term.title_japanese,
          studyElement: term.meaning.eng,
          type: StudyTermType.Definition,
        });
      }
		}

		for (const term of unstudied) {
			if ('kanji' in term) {
				newQueue.push({
					source: term,
					kanji: term.kanji,
					studyElement: term.onyomi,
					type: StudyTermType.Onyomi,
				});
      }
      if ('kanji_full' in term) {
        if (term.kanji_full.length !== 0) {
          newQueue.push({
            source: term,
            kanji: term.kanji_full,
            studyElement: term.hiragana_full,
            type: StudyTermType.Kunyomi,
          });
        }
      }
		}

		for (const term of unstudied) {
			if ('kanji' in term) {
				const parsed = parseKunyomiReading(term.kunyomi);

				const nonVerbReadings = parsed.filter((p) => p.verbs.length === 0).map((p) => p.base);
				if (nonVerbReadings.length > 0) {
					newQueue.push({
						source: term,
						kanji: term.kanji,
						studyElement: nonVerbReadings.join(','),
						type: StudyTermType.Kunyomi,
					});
				}

				for (const item of parsed) {
					for (const verb of item.verbs) {
						// Get the meaning of this word
						const termDefinition = await fetchWord(RenshuuApiKey.value!, term.kanji + verb, 1);
						// Abort
						if ('error' in termDefinition) {
							newQueue.push({
								source: term,
								kanji: term.kanji + verb,
								studyElement: item.base + verb,
								type: StudyTermType.Kunyomi,
							});
						} else {
							if (termDefinition.words.length > 0) {
								const firstWord = termDefinition.words[0]!;
								newQueue.push({
									source: firstWord,
									kanji: firstWord.kanji_full,
									studyElement: typeof firstWord.def === 'string' ? firstWord.def : firstWord.def.join(','),
									type: StudyTermType.Definition,
								});
								newQueue.push({
									source: firstWord,
									kanji: firstWord.kanji_full,
									studyElement: firstWord.hiragana_full,
									type: StudyTermType.Kunyomi,
								});
							} else {
								newQueue.push({
									source: term,
									kanji: term.kanji + verb,
									studyElement: item.base + verb,
									type: StudyTermType.Kunyomi,
								});
							}
						}
					}
				}
			}
		}

		studyQueue.value = newQueue;
	}

	return { studyQueue, buildQueue };
}
