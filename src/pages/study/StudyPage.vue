<template>
	<div class="studyPage">
		<template v-if="isInChallenge && currentChallenge">
			<div
				class="termPreview"
				:class="{
					'termPreview__challenge--correct': challengeCorrect,
					'termPreview__challenge--wrong': challengeWrong,
					termPreview__kanji: currentChallenge.term.type === StudyTermType.Definition,
					termPreview__onyomi: currentChallenge.term.type === StudyTermType.Onyomi,
					termPreview__kunyomi: currentChallenge.term.type === StudyTermType.Kunyomi,
				}"
			>
				<div />
				<div class="termPreview__term">
					<template v-if="'kanji' in currentChallenge.term">
						<div class="termPreview__term__kanji">{{ currentChallenge.term.kanji }}</div>
					</template>
				</div>
				<div />
			</div>
			<div class="challengeArea">
				<DefinitionChallenge
					v-if="currentChallenge.term.type === StudyTermType.Definition"
					:key="currentChallengeIndex"
					:options="currentChallenge.options"
					:correctOptions="currentChallenge.correctOptions"
					:selected="challengeSelected"
					:revealed="challengeRevealed"
					@toggle="toggleChallengeOption"
				/>
				<OnyomiChallenge
					v-else-if="currentChallenge.term.type === StudyTermType.Onyomi"
					:key="'o' + currentChallengeIndex"
					v-model="onyomiText"
					:challengeCorrect="challengeCorrect"
					:challengeWrong="challengeWrong"
					@submit="submitChallenge"
				/>
				<KunyomiChallenge
					v-else-if="currentChallenge.term.type === StudyTermType.Kunyomi"
					:key="'k' + currentChallengeIndex"
					:options="currentChallenge.options"
					:correctOptions="currentChallenge.correctOptions"
					:selected="challengeSelected"
					:revealed="challengeRevealed"
					:kanjiLabel="currentChallenge.term.kanji"
					v-model="onyomiText"
					:challengeCorrect="challengeCorrect"
					:challengeWrong="challengeWrong"
					@toggle="toggleChallengeOption"
					@submit="submitChallenge"
				/>
				<div class="challengeFeedback" v-if="feedbackMessage">
					{{ feedbackMessage }}
				</div>
				<div class="challengeSubmit">
					<Button @click="submitChallenge"> Submit </Button>
				</div>
				<div class="challengeSubmit">
					<Button @click="skipChallenge"> Skip Challenge </Button>
				</div>
			</div>
		</template>
		<template v-else>
			<div
				class="termPreview"
				:class="{
					termPreview__kanji: !currentTerm || currentTerm?.type === StudyTermType.Definition,
					termPreview__onyomi: currentTerm?.type === StudyTermType.Onyomi,
					termPreview__kunyomi: currentTerm?.type === StudyTermType.Kunyomi,
				}"
			>
				<div
					class="termPreview__directionButton"
					@click="currentTermIndex = Math.max(currentTermIndex - 1, 0)"
				>
					<ChevronLeft />
				</div>
				<div class="termPreview__term" v-if="currentTerm">
					<template v-if="'kanji' in currentTerm">
						<div
							class="termPreview__term__definition"
							v-if="'definition' in currentTerm.source && currentTerm.type !== StudyTermType.Definition"
						>
							{{ currentTerm.source.definition }}
						</div>
						<div class="termPreview__term__kanji">{{ currentTerm.kanji }}</div>
						<div class="termPreview__term__studyType">
							<template v-if="currentTerm.type === StudyTermType.Definition"> Definition </template>
							<template v-if="currentTerm.type === StudyTermType.Onyomi"> Onyomi Reading </template>
							<template v-if="currentTerm.type === StudyTermType.Kunyomi"> Kunyomi Reading </template>
						</div>
						<div class="termPreview__term__definition">
							{{
								currentTerm.type === StudyTermType.Kunyomi
									? formatKunyomiReading(currentTerm.studyElement)
									: currentTerm.studyElement
							}}
						</div>
					</template>
				</div>
				<div class="termPreview__directionButton" @click="onNextTerm">
					<ChevronRight />
				</div>
			</div>
			<div>
				<template v-if="currentTerm && 'kanji' in currentTerm.source">
					<div>JLPT Level: {{ currentTerm.source.jlpt }}</div>
					<div>Radical: {{ currentTerm.source.radical }} ({{ currentTerm.source.radical_name }})</div>
				</template>
			</div>
			<OnyomiPractice
				v-if="currentTerm?.type === StudyTermType.Onyomi"
				:options="onyomiOptions"
				:selected="onyomiSelected"
				:feedback="onyomiFeedback"
				:feedbackMessage="onyomiFeedbackMessage"
				:correctStudyElement="currentTerm.studyElement"
				:mnemonic="mnemonics[getMnemonicKey(currentTerm)] ?? ''"
				@select="submitOnyomiAnswer"
				@update:mnemonic="(v) => (mnemonics[getMnemonicKey(currentTerm!)] = v)"
			/>
			<KunyomiPractice
				v-if="currentTerm?.type === StudyTermType.Kunyomi"
				:mnemonic="mnemonics[getMnemonicKey(currentTerm)] ?? ''"
				@update:mnemonic="(v) => (mnemonics[getMnemonicKey(currentTerm!)] = v)"
			/>
			<div>Progress: {{ currentTermIndex }} / {{ studyQueue.length }}</div>
		</template>
	</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import type { GrammarTerm, KanjiTerm, VocabTerm } from '@/types/scheulde';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { Button } from 'primevue';
import { StudyTermType } from './types';
import { useStudyQueue, formatKunyomiReading } from './composables/useStudyQueue';
import { useChallenge } from './composables/useChallenge';
import { useMnemonics } from './composables/useMnemonics';
import { useOnyomiPractice } from './composables/useOnyomiPractice';
import DefinitionChallenge from './components/DefinitionChallenge.vue';
import OnyomiChallenge from './components/OnyomiChallenge.vue';
import KunyomiChallenge from './components/KunyomiChallenge.vue';
import OnyomiPractice from './components/OnyomiPractice.vue';
import KunyomiPractice from './components/KunyomiPractice.vue';

const props = defineProps<{
	terms: (KanjiTerm | VocabTerm | GrammarTerm)[];
}>();

const emit = defineEmits<{
	(e: 'return'): void;
}>();

const { mnemonics, getMnemonicKey, getMnemonic, loadMnemonics } = useMnemonics();
const { studyQueue, buildQueue } = useStudyQueue();

const currentTermIndex = ref(0);
const currentTerm = computed(() => studyQueue.value[currentTermIndex.value]);

const {
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
} = useChallenge(studyQueue, getMnemonic);

const { onyomiOptions, onyomiSelected, onyomiFeedback, onyomiFeedbackMessage, submitOnyomiAnswer } =
	useOnyomiPractice(studyQueue, currentTerm);

watch(isSessionComplete, (complete) => {
	if (complete) emit('return');
});

function toggleChallengeOption(option: string) {
	if (challengeSelected.includes(option)) {
		challengeSelected.splice(challengeSelected.indexOf(option), 1);
	} else {
		challengeSelected.push(option);
	}
}

function onNextTerm() {
	if (currentTermIndex.value === studyQueue.value.length - 1) {
		checkChallenge(currentTermIndex.value);
	}
	currentTermIndex.value = Math.min(currentTermIndex.value + 1, studyQueue.value.length - 1);
	if (currentTermIndex.value % 3 === 0) {
		checkChallenge(currentTermIndex.value);
	}
}

onMounted(() => {
	loadMnemonics();
	buildQueue(props.terms);
	currentTermIndex.value = 0;
});
</script>

<style lang="scss" scoped>
@use '../../assets/base.scss';

.studyPage {
	position: relative;
	width: 100%;
	height: 100%;

	display: flex;
	flex-direction: column;
	align-items: center;
}

.termPreview {
	width: 100%;
	height: 40%;
	min-height: 200px;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding: 0px 20px;

	&__challenge {
		background-color: base.$challenge;

		&--correct {
			background-color: #186c37 !important;
			transition: background-color 0.2s;
		}

		&--wrong {
			animation: shake 0.5s;
			background-color: #7f1d1d !important;
			transition: background-color 0.2s;
		}
	}
	&__kanji {
		background-color: base.$kanji;
	}
	&__onyomi {
		background-color: base.$onyomi;
	}
	&__kunyomi {
		background-color: base.$kunyomi;
	}

	&__directionButton {
		background-color: #ffffff20;
		height: 80%;
		width: 50px;
		border-radius: 8px;
		box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.298);
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		transition: background-color 0.3s;

		&:hover {
			background-color: #ffffff30;
		}
	}

	&__term {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		&__studyType {
			font-size: 1em;
		}

		&__kanji {
			font-size: 8em;
		}

		&__definition {
			font-size: 2em;
		}
	}
}

.challengeArea {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-around;
	flex-grow: 1;
}

.challengeFeedback {
	font-size: 1.2em;
	font-weight: bold;
	color: #ef4444;
	animation: flashShake 0.6s;
	padding: 20px;
	text-align: center;
}

@keyframes flashShake {
	0% {
		opacity: 1;
		transform: translateX(0);
	}
	10% {
		opacity: 0.5;
		transform: translateX(-8px);
	}
	20% {
		opacity: 1;
		transform: translateX(8px);
	}
	30% {
		opacity: 0.5;
		transform: translateX(-8px);
	}
	40% {
		opacity: 1;
		transform: translateX(0);
	}
	50% {
		opacity: 0.5;
	}
	60% {
		opacity: 1;
	}
	70% {
		opacity: 0.5;
	}
	80% {
		opacity: 1;
	}
	100% {
		opacity: 1;
		transform: translateX(0);
	}
}

@keyframes shake {
	0%,
	100% {
		transform: translateX(0);
	}
	25% {
		transform: translateX(-10px);
	}
	75% {
		transform: translateX(10px);
	}
}
</style>
