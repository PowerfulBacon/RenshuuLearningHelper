import type { ApiResponse } from './api';

export interface Profile {
	id: string;
	real_name: string;
	adventure_level: string;
	user_length: string;
	kao: string;
	studied: StudiedStats;
	level_progress_percs: LevelProgress;
	streaks: Streaks;
}

export interface StudiedStats {
	today_all: number;
	today_grammar: number;
	today_vocab: number;
	today_kanji: number;
	today_sent: number;
	today_aconj: number;
	today_conj: number;
	total: number;
	total_vocab: number;
	total_kanji: number;
	total_grammar: number;
	total_sent: number;
}

export interface JLPTLevels {
	n1: number;
	n2: number;
	n3: number;
	n4: number;
	n5: number;
}

export interface LevelProgress {
	vocab: JLPTLevels;
	kanji: JLPTLevels;
	grammar: JLPTLevels;
	sent: JLPTLevels;
}

export interface StreakCategory {
	correct_in_a_row: string;
	correct_in_a_row_alltime: string;
	days_studied_in_a_row: string;
	days_studied_in_a_row_alltime: string;
}

export interface Streaks {
	vocab: StreakCategory;
	kanji: StreakCategory;
	grammar: StreakCategory;
	sent: StreakCategory;
	conj: StreakCategory;
	aconj: StreakCategory;
}

export async function fetchProfile(apiKey: string): Promise<ApiResponse<Profile>> {
	const response = await fetch('https://api.renshuu.org/v1/profile', {
		method: 'GET',
		headers: {
			Authorization: 'Bearer ' + apiKey,
			'Content-Type': 'application/json',
		},
	});
	return response.json() as Promise<ApiResponse<Profile>>;
}
