export function calculateDeductions(
    totalPoints: number,
    easyGames: number,
    mediumGames: number,
    hardGames: number
) {
    const ratio = { easy: 1, medium: 2, hard: 3 };

    const totalWeight = (easyGames * ratio.easy) +
        (mediumGames * ratio.medium) +
        (hardGames * ratio.hard);

    if (totalWeight === 0) {
        return { easyDeduction: 0, mediumDeduction: 0, hardDeduction: 0 };
    }
    if ((easyGames === 0) && (mediumGames === 0) && (hardGames === 0)) {
        return { easyDeduction: 0, mediumDeduction: 0, hardDeduction: 0 };
    }

    const baseUnit = totalPoints / totalWeight;

    return {
        easyDeduction: baseUnit * ratio.easy,
        mediumDeduction: baseUnit * ratio.medium,
        hardDeduction: baseUnit * ratio.hard
    };
}