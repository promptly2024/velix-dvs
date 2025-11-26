export function calculateDeductions(
    totalPoints: number,
    totalGames: number,
    easyGames: number,
    mediumGames: number,
    hardGames: number
) {
    // Safety: easy + medium + hard = total games check
    if (easyGames + mediumGames + hardGames !== totalGames) {
        throw new Error("Easy + Medium + Hard must equal total games");
    }

    // Per game deduction (base)
    const perGame = totalPoints / totalGames;

    const totalWeight = easyGames + mediumGames + hardGames;

    const wEasy = easyGames / totalWeight;
    const wMedium = mediumGames / totalWeight;
    const wHard = hardGames / totalWeight;

    // Final deduction values
    const easyDeduction = perGame * wEasy;
    const mediumDeduction = perGame * wMedium;
    const hardDeduction = perGame * wHard;

    return {
        easy: easyDeduction,
        medium: mediumDeduction,
        hard: hardDeduction
    };
}
