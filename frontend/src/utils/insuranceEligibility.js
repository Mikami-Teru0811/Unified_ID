/**
 * Simple eligibility logic for Tamil Nadu health schemes
 * @param {Object} patient - Basic patient profile data
 * @returns {Object} Eligibility map for each scheme
 */
export function checkEligibility(patient) {
    const { annualIncome, isGovEmployee } = patient;

    return {
        CMCHIS: annualIncome < 72000,
        PMJAY: annualIncome < 100000,
        TN_UHS: isGovEmployee,
        PRIVATE: true // Private insurance is generally open to everyone
    };
}
