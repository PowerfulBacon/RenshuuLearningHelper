export type ApiResponse<T> =
	| (T & { api_usage: ApiUsage })
	| {
			error: string;
	  };

export interface ApiUsage {
	calls_today: number;
	daily_allowance: number;
}
