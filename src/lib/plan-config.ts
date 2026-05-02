export type PaidPlanTier = "BASIC" | "ADVANCE";
export type PlanTier = "FREE" | PaidPlanTier;

export const PLAN_VALIDITY_DAYS = 30;
export const PLAN_VALIDITY_MS = PLAN_VALIDITY_DAYS * 24 * 60 * 60 * 1000;

export const FREE_VOICE_TOKEN_LIMIT = 100;
export const BASIC_VOICE_TOKEN_LIMIT = 100;
export const ADVANCE_VOICE_TOKEN_LIMIT = 500;

export const BASIC_PLAN_DOWNLOAD_LIMIT = 20;
export const ADVANCE_PLAN_DOWNLOAD_LIMIT = 50;

export const BASIC_PLAN_PRICE_INR = 39;
export const ADVANCE_PLAN_PRICE_INR = 99;

export function isPaidPlanTier(value: unknown): value is PaidPlanTier {
	return value === "BASIC" || value === "ADVANCE";
}

export function getDownloadLimitForTier(tier: PaidPlanTier) {
	return tier === "ADVANCE" ? ADVANCE_PLAN_DOWNLOAD_LIMIT : BASIC_PLAN_DOWNLOAD_LIMIT;
}

export function getVoiceTokenLimitForTier(tier: PlanTier) {
	if (tier === "ADVANCE") {
		return ADVANCE_VOICE_TOKEN_LIMIT;
	}

	if (tier === "BASIC") {
		return BASIC_VOICE_TOKEN_LIMIT;
	}

	return FREE_VOICE_TOKEN_LIMIT;
}

export function getSubscriptionAmountInPaise(tier: PaidPlanTier) {
	const amountInr = tier === "ADVANCE" ? ADVANCE_PLAN_PRICE_INR : BASIC_PLAN_PRICE_INR;
	return amountInr * 100;
}
