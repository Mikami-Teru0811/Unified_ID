/**
 * Simple deterministic recommendation engine for hospitals
 * @param {string} scheme - The selected insurance scheme
 * @param {Array} hospitals - List of empanelled hospitals
 * @returns {Object|null} Recommended hospital based on score
 */
export function recommendHospital(scheme, hospitals) {
    const eligible = hospitals.filter(h =>
        h.schemes.includes(scheme)
    );

    if (!eligible.length) return null;

    return eligible
        .map(h => {
            let score = 0;

            // Logic: Government infrastructure is highly prioritized for cost-efficiency (30pts)
            if (h.isGovernment) score += 30;

            // Emergency readiness is a major safety factor (20pts)
            if (h.hasEmergency) score += 20;

            // Proximity scoring: Max 25pts, decreases with distance
            score += Math.max(0, 25 - h.distanceKm);

            // Historical success adds reliability (Weight: 15%)
            score += h.claimSuccessRate * 0.15;

            return { ...h, score };
        })
        .sort((a, b) => b.score - a.score)[0];
}
