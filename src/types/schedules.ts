import type { ApiResponse } from './api';

export interface Schedule {
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

export async function fetchSchedules(apiKey: string): Promise<ApiResponse<{ schedules: Schedule[] }>> {
	const response = await fetch('https://api.renshuu.org/v1/schedule', {
		method: 'GET',
		headers: {
			Authorization: 'Bearer ' + apiKey,
			'Content-Type': 'application/json',
		},
	});
	if (!response.ok) {
		return { error: `API returned code ${response.status}` };
	}
	return response.json() as Promise<ApiResponse<{ schedules: Schedule[] }>>;
}
