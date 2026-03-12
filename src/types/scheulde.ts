import type { ApiResponse } from './api';

export interface ScheduleContentsApiResponse {
	schedules: ScheduleSummary[];
	contents: ContentsPage;
}

export interface ScheduleContentsResponse extends ScheduleContentsApiResponse {
	cachedContents: ContentsPage[];
	nextPage: () => Promise<undefined | ContentsPage>;
}

export interface ScheduleSummary {
	id: string;
	name: string;
	booktype: 'vocab' | 'kanji' | 'grammar';
	is_frozen: number;
	today: ScheduleToday;
	upcoming: ScheduleUpcoming[];
	terms: ScheduleTerms;
	new_terms: ScheduleNewTerms;
}

export interface ScheduleToday {
	review: number;
	new: number;
}

export interface ScheduleUpcoming {
	days_in_future: string;
	terms_to_review: string;
}

export interface ScheduleTerms {
	total_count: number;
	studied_count: number;
	unstudied_count: number;
	hidden_count: number;
}

export interface ScheduleNewTerms {
	today_count: number | string;
	rolling_week_count: number | string;
}

export interface ContentsPage {
	group: string;
	pg: number;
	total_pg: number;
	result_count: number;
	per_pg: number;
	terms: (KanjiTerm | VocabTerm | GrammarTerm)[];
}

export interface GrammarTerm {
	id: string;
	title_english: string;
	title_japanese: string;
	user_data?: TermUserData;
	meaning: GrammarMeaning;
	meaning_long: GrammarMeaning;
	url: string;
}

export interface GrammarMeaning {
	eng: string;
}

export interface KanjiTerm {
	id: string;
	kanji: string;
	scount: string;
	definition: string;
	onyomi: string;
	kunyomi: string;
	onyomi_marked: string;
	kunyomi_marked: string;
	kanken: string;
	jlpt: string;
	radical_name: string;
	radical: string;
	user_data?: TermUserData;
}

export interface VocabTerm {
	id: string;
	kanji_full: string;
	hiragana_full: string;
	edict_ent: number | null;
	config: unknown[];
	reibuns: string;
	pitch: unknown[];
	typeofspeech: string;
	def: string[] | string;
	user_data?: TermUserData;
}

export interface TermUserData {
	correct_count: number;
	missed_count: number;
	mastery_avg_perc: string;
	study_vectors: Record<string, StudyVector>;
}

export interface StudyVector {
	name: string;
	correct_count: number;
	missed_count: number;
	mastery_perc: number;
	last_quizzed: string;
	next_quiz: string;
}

export async function fetchScheduleContents(
	apiKey: string,
	scheduleId: string,
	page: number = 1
): Promise<ApiResponse<ScheduleContentsApiResponse>> {
	const response = await fetch(
		'https://api.renshuu.org/v1/schedule/' +
			encodeURI(scheduleId) +
			'/list?pg=' +
			encodeURI(page.toString()) +
			'&group=all',
		{
			method: 'GET',
			headers: {
				Authorization: 'Bearer ' + apiKey,
				'Content-Type': 'application/json',
			},
		}
	);
	if (!response.ok) {
		return { error: `API returned code ${response.status}` };
	}
	return response.json() as Promise<ApiResponse<ScheduleContentsApiResponse>>;
}
