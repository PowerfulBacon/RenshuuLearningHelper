import { RequestsUsed } from '../sharedState/state';
import type { ApiResponse } from './api';

const CACHE_STORAGE_KEY = 'word_search_cache';

type WordCache = Record<string, ApiResponse<WordsResponse>>;

let wordCache: WordCache | null = null;

function getCache(): WordCache {
	if (wordCache === null) {
		const stored = localStorage.getItem(CACHE_STORAGE_KEY);
		wordCache = stored ? (JSON.parse(stored) as WordCache) : {};
	}
	return wordCache;
}

function saveCache(cache: WordCache): void {
	localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cache));
}

function getCacheKey(word: string, page: number): string {
	return `${word}:${page}`;
}

export interface WordsResponse {
	words: Word[];
	result_count: number;
	total_pg: number;
	per_pg: number;
	pg: number;
	query: string;
	count: number;
}

export interface Word {
	is_common: boolean;
	kanji_full: string;
	hiragana_full: string;
	id: string;
	reibuns: string;
	aforms: string[];
	edict_ent: number | null;
	config: string[];
	markers: string[];
	pitch: string[];
	notes: string[];
	typeofspeech: string;
	def: string[] | string;
}

export async function fetchWord(
	apiKey: string,
	word: string,
	page: number = 1
): Promise<ApiResponse<WordsResponse>> {
	const cache = getCache();
	const key = getCacheKey(word, page);

	if (key in cache) {
		return cache[key]!;
	}

	const response = await fetch(
		'https://api.renshuu.org/v1/word/search?value=' + encodeURI(word) + '&pg=' + page,
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
	const result = (await response.json()) as ApiResponse<WordsResponse>;
	cache[key] = result;
	saveCache(cache);
	if (!('error' in result)) {
		RequestsUsed.value = result.api_usage.calls_today;
	}
	return result;
}
