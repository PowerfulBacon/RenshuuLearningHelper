import type { Profile } from '@/types/profile';
import { ref, type Ref } from 'vue';

export const RenshuuApiKey: Ref<string | undefined> = ref(undefined);

export const RequestsUsed: Ref<undefined | number> = ref(undefined);
export const RequestsAllowed: Ref<undefined | number> = ref(undefined);
export const RenshuuProfile: Ref<Profile | undefined> = ref(undefined);
