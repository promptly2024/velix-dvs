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

/*
Inputs: Total Points = 30, Easy = 5, Medium = 2, Hard = 1

Step 1 (Total Parts):

Easy shares: 5×1=5

Medium shares: 2×2=4

Hard shares: 1×3=3

Sum: 5+4+3=12

Step 2 (Base Unit / Easy):

30/12=2.5

Step 3 (Others):

Easy: 2.5

Medium: 2.5×2=5

Hard: 2.5×3=7.5

Check: (5×2.5)+(2×5)+(1×7.5)=12.5+10+7.5=30 (Correct)
*/