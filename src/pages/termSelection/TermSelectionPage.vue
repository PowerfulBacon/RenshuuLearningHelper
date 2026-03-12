<template>
	<div class="termSelectionPage">
		<div class="termSelectionPage__header">
			<Button @click="emit('return')" class="termSelectionPage__backButton" rounded>
				<CornerDownLeft />
			</Button>
			<h1>Select Terms to Study</h1>
			<p>Choose which terms you'd like to review in this session</p>
		</div>

		<div class="termSelectionPage__controls">
			<div class="termSelectionPage__buttons">
				<Button
					@click="selectAlreadyStudied"
					:outlined="filterType !== 'studied'"
					label="Already Studied"
				/>
				<Button @click="selectNextSet" :outlined="filterType !== 'nextSet'" label="Next Set" />
				<Button @click="selectAll" :outlined="filterType !== 'all'" label="All" />
				<Button @click="selectNone" outlined label="None" />
			</div>
			<Button
				@click="startStudy"
				label="Start"
				class="termSelectionPage__startButton"
				:disabled="selectedTermIds.size === 0"
			/>
		</div>

		<div class="termSelectionPage__termsList">
			<div
				v-for="term in allTerms"
				:key="`${term.id}`"
				class="termSelectionPage__termItem"
				:class="{ 'termSelectionPage__termItem--selected': selectedTermIds.has(getTermId(term)) }"
				@click="toggleTerm(term)"
			>
				<div class="termSelectionPage__checkbox">
					<input
						type="checkbox"
						:checked="selectedTermIds.has(getTermId(term))"
						@change="toggleTerm(term)"
					/>
				</div>
				<div class="termSelectionPage__termContent">
					<div class="termSelectionPage__termMain">
						<template v-if="'kanji' in term">
							<span class="termSelectionPage__kanji">{{ term.kanji }}</span>
						</template>
						<template v-else-if="'vocabulary' in term">
							<span class="termSelectionPage__vocabulary">{{ term.vocabulary }}</span>
						</template>
						<template v-else-if="'grammar' in term">
							<span class="termSelectionPage__grammar">{{ term.grammar }}</span>
						</template>
					</div>
					<div class="termSelectionPage__termMeta">
						<span v-if="'kanji' in term" class="termSelectionPage__definition">
							{{ term.definition }}
						</span>
						<span
							v-else-if="'kanji_full' in term"
							class="termSelectionPage__definition"
							v-for="def in term.def"
							:key="def"
						>
							{{ def }}
						</span>
						<span v-else-if="'title_english' in term" class="termSelectionPage__definition">
							{{ term.meaning }}
						</span>
						<span class="termSelectionPage__status">
							{{ getTermStatus(term) }}
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, type Ref } from 'vue';
import { Button } from 'primevue';
import type { ScheduleContentsResponse } from '@/types/scheulde';
import type { GrammarTerm, KanjiTerm, VocabTerm } from '@/types/scheulde';
import { CornerDownLeft } from 'lucide-vue-next';

const props = defineProps<{
	schedule: ScheduleContentsResponse;
}>();

const emit = defineEmits<{
	startStudy: [selectedTermIds: Set<string>];
	return: [];
}>();

type FilterType = 'all' | 'studied' | 'nextSet' | 'none';
const filterType: Ref<FilterType> = ref('all');
const selectedTermIds: Ref<Set<string>> = ref(new Set());

const allTerms = computed(() => {
	return props.schedule.cachedContents.flatMap((x) => x.terms);
});

function getTermId(term: GrammarTerm | KanjiTerm | VocabTerm): string {
	return term.id;
}

function getTermStatus(term: GrammarTerm | KanjiTerm | VocabTerm): string {
	if (!term.user_data) {
		return 'Not studied';
	}
	const correct = term.user_data.correct_count || 0;
	const missed = term.user_data.missed_count || 0;
	return `${correct} correct, ${missed} missed`;
}

function isStudied(term: GrammarTerm | KanjiTerm | VocabTerm): boolean {
	return !!(term.user_data && (term.user_data.correct_count || term.user_data.missed_count));
}

function isNextSet(term: GrammarTerm | KanjiTerm | VocabTerm): boolean {
	return (
		!term.user_data || (term.user_data?.correct_count === 0 && term.user_data?.missed_count === 0)
	);
}

function selectAlreadyStudied() {
	filterType.value = 'studied';
	selectedTermIds.value.clear();
	allTerms.value.forEach((term) => {
		if (isStudied(term)) {
			selectedTermIds.value.add(getTermId(term));
		}
	});
}

function selectNextSet() {
	filterType.value = 'nextSet';
	selectedTermIds.value.clear();
	let selected = 0;
	allTerms.value.forEach((term) => {
		if (isNextSet(term) && selected < 6) {
			selectedTermIds.value.add(getTermId(term));
			selected++;
		}
	});
}

function selectAll() {
	filterType.value = 'all';
	selectedTermIds.value.clear();
	allTerms.value.forEach((term) => {
		selectedTermIds.value.add(getTermId(term));
	});
}

function selectNone() {
	filterType.value = 'none';
	selectedTermIds.value.clear();
}

function toggleTerm(term: GrammarTerm | KanjiTerm | VocabTerm) {
	const termId = getTermId(term);
	if (selectedTermIds.value.has(termId)) {
		selectedTermIds.value.delete(termId);
	} else {
		selectedTermIds.value.add(termId);
	}
}

function startStudy() {
	emit('startStudy', selectedTermIds.value);
}
</script>

<style lang="scss" scoped>
@use '../../assets/base.scss';

.termSelectionPage {
	display: flex;
	flex-direction: column;
	height: 100%;
	width: 100%;
	padding: 30px;
	gap: 30px;

	&__header {
		text-align: center;
		position: relative;

		h1 {
			font-size: 2em;
			margin: 0;
			margin-bottom: 10px;
		}

		p {
			margin: 0;
			opacity: 0.8;
		}
	}

	&__backButton {
		position: absolute;
		left: 0;
		top: 0;
	}

	&__controls {
		display: flex;
		flex-direction: column;
		gap: 15px;
		align-items: center;
	}

	&__buttons {
		display: flex;
		flex-direction: row;
		gap: 15px;
		flex-wrap: wrap;
		justify-content: center;
	}

	&__startButton {
		margin-top: 10px;
	}

	&__termsList {
		flex: 1;
		overflow-y: auto;
		border: 1px solid base.$border;
		border-radius: 8px;
		padding: 15px;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 8px;
		background-color: base.$background-soft;
	}

	&__termItem {
		display: flex;
		align-items: center;
		flex-grow: 1;
		gap: 15px;
		padding: 12px;
		border-radius: 6px;
		cursor: pointer;
		transition: background-color 0.2s;
		background-color: base.$background-mute;

		&:hover {
			background-color: rgba(255, 255, 255, 0.08);
		}

		&--selected {
			background-color: rgba(59, 130, 246, 0.2);
		}
	}

	&__checkbox {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;

		input {
			width: 20px;
			height: 20px;
			cursor: pointer;
		}
	}

	&__termContent {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}

	&__termMain {
		display: flex;
		gap: 10px;
		align-items: center;
		flex-wrap: wrap;
	}

	&__kanji {
		font-size: 1.3em;
		font-weight: bold;
	}

	&__vocabulary {
		font-size: 1.1em;
		font-weight: 600;
	}

	&__grammar {
		font-size: 1.1em;
		font-weight: 600;
	}

	&__termMeta {
		display: flex;
		gap: 15px;
		font-size: 0.9em;
		flex-wrap: wrap;
	}

	&__definition {
		color: #9ca3af;
	}

	&__status {
		color: #6b7280;
		font-size: 0.85em;
		font-style: italic;
	}
}
</style>
