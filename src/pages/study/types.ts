import type { VocabTerm, GrammarTerm, KanjiTerm } from '@/types/scheulde';

export enum StudyTermType {
	Definition,
	Onyomi,
	Kunyomi,
}

export interface StudyTerm {
	source: VocabTerm | GrammarTerm | KanjiTerm;
	kanji: string;
	studyElement: string;
	type: StudyTermType;
}

export interface ChallengeQuestion {
	term: StudyTerm;
	correctOptions: string[];
	options: string[];
	verbQuestion?: string;
}
