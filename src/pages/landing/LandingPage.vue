<template>
	<StudyPage v-if="showStudyPage && terms" :terms="terms" @return="handleReturn" />
	<TermSelectionPage
		v-else-if="selectedSchedule"
		:schedule="selectedSchedule"
		@return="selectedSchedule = undefined"
		@startStudy="handleStartStudy"
	/>
	<div class="landingElement" v-else>
		<div class="landingElement__title">{{ helloMessage }}, {{ RenshuuProfile?.real_name }}!</div>
		<div class="landingElement__subtitle">
			Select a schedule to start revising the next terms that you need to learn. Once you have
			completed your studies, head over to <a href="https://www.renshuu.org">Renshuu</a> and complete
			the quiz!
		</div>
		<div class="landingElement__content">
			<template v-if="scheduleError">
				{{ scheduleError }}
			</template>
			<template v-else>
				<div
					class="card"
					:class="{
						card__vocab: schedule.booktype === 'vocab',
						card__kanji: schedule.booktype === 'kanji',
						card__grammar: schedule.booktype === 'grammar',
					}"
					v-for="schedule in schedules"
					:key="schedule.id"
					:title="schedule.booktype"
					@click="loadScheduleDetails(schedule)"
				>
					<div class="card__header">{{ schedule.name }}</div>
					<div>{{ schedule.terms.studied_count }} / {{ schedule.terms.total_count }} studied</div>
					<div>{{ schedule.today.review }} Review, {{ schedule.today.new }} New</div>
				</div>
			</template>
		</div>
	</div>
</template>
<script setup lang="ts">
import type { Schedule } from '../../types/schedules';
import { fetchSchedules } from '../../types/schedules';
import { RenshuuApiKey, RenshuuProfile, RequestsUsed } from '../../sharedState/state';
import { onMounted, ref, type Ref } from 'vue';
import type {
	ContentsPage,
	GrammarTerm,
	KanjiTerm,
	ScheduleContentsResponse,
	VocabTerm,
} from '../../types/scheulde';
import { fetchScheduleContents } from '../../types/scheulde';
import StudyPage from '../study/StudyPage.vue';
import TermSelectionPage from '../termSelection/TermSelectionPage.vue';

let helloMessage = 'こんにちは';

onMounted(() => {
	const now = new Date();
	if (now.getHours() >= 4 && now.getHours() < 12) {
		helloMessage = 'おはよう';
	} else if (now.getHours() >= 12 && now.getHours() <= 7) {
		helloMessage = 'こんにちは';
	} else {
		helloMessage = 'こんばんは';
	}
	loadSchedules();
});

const scheduleError: Ref<string | undefined> = ref(undefined);
const schedules: Ref<undefined | Schedule[]> = ref(undefined);

const selectedSchedule: Ref<undefined | ScheduleContentsResponse> = ref(undefined);
const showStudyPage: Ref<boolean> = ref(false);

async function loadSchedules() {
	const scheduleResult = await fetchSchedules(RenshuuApiKey.value!);
	if ('error' in scheduleResult) {
		scheduleError.value = `Could not fetch schedules, ${scheduleResult.error}.`;
		return;
	}
	schedules.value = scheduleResult.schedules;
	RequestsUsed.value = scheduleResult.api_usage.calls_today;
}

async function loadScheduleDetails(schedule: Schedule, pageNumber: number = 1) {
	const result = await fetchScheduleContents(RenshuuApiKey.value!, schedule.id, pageNumber);
	if ('error' in result) {
		return;
	}
	RequestsUsed.value = result.api_usage.calls_today;
	const enriched: ScheduleContentsResponse = {
		...result,
		cachedContents: [result.contents],
		nextPage: async () => {
			if (
				enriched.cachedContents[enriched.cachedContents.length - 1]?.pg ===
				enriched.cachedContents[enriched.cachedContents.length - 1]?.total_pg
			) {
				return undefined;
			}
			const nextResult = await fetchScheduleContents(
				RenshuuApiKey.value!,
				schedule.id,
				enriched.cachedContents[enriched.cachedContents.length - 1]!.pg + 1
			);
			if ('error' in nextResult) {
				return undefined;
			}
			enriched.cachedContents.push(nextResult.contents);
			return nextResult.contents;
		},
	};
	selectedSchedule.value = enriched;
	let current: ContentsPage | undefined = enriched.contents;
	while (current && current.pg < current.total_pg) {
		current = await enriched.nextPage();
	}
}

const terms: Ref<(KanjiTerm | VocabTerm | GrammarTerm)[] | undefined> = ref(undefined);

function handleStartStudy(selectedTermIds: Set<string>) {
	terms.value = selectedSchedule.value?.cachedContents
		.flatMap((x) => x.terms)
		.filter((x) => selectedTermIds.has(x.id));
	if (!terms.value || terms.value?.length > 0) {
		showStudyPage.value = true;
	}
}

function handleReturn() {
	showStudyPage.value = false;
	selectedSchedule.value = undefined;
}
</script>
<style lang="scss" scoped>
@use '../../assets/base.scss';

.landingElement {
	display: flex;
	flex-direction: column;
	height: 100%;
	width: 100%;
	align-items: center;
	justify-content: space-around;

	&__title {
		font-size: xx-large;
	}

	&__subtitle {
		max-width: 40em;
	}

	&__content {
		height: 0px;
		animation: openAnimation forwards 1s;
		overflow: hidden;
		width: max(90%, calc(100% - 200px));
		padding: 0% 10%;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		background-color: base.$background-soft;
		gap: 20px;
		border-radius: 25px;
	}
}

.card {
	background-color: base.$primary;
	width: 220px;
	height: 140px;
	border-radius: 18px;
	padding: 15px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	text-align: center;
	cursor: pointer;
	color: base.$dark;
	box-shadow: 4px 4px 8px black;
	gap: 4px;
	transition: filter 0.2s;

	&:hover {
		filter: brightness(130%);
	}

	&__header {
		font-weight: bolder;
	}

	&__vocab {
		background-color: #bb84d2;
	}

	&__kanji {
		background-color: #cf9363;
	}

	&__grammar {
		background-color: #89df5b;
	}
}

@keyframes openAnimation {
	0% {
		height: 0%;
	}
	100% {
		height: 80%;
	}
}
</style>
