export const formatTime = (totalSeconds: number) => {
    // console.log(totalSeconds)
    if (isNaN(totalSeconds)) return null;

    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    let time = '';
    if (hours) {
        time += `${hours}:`;
    }
    time += `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    // console.log(time)

    return time;
};

export const secondsToHoursMinutes = (totalSeconds: number) => {
    if (isNaN(totalSeconds)) return null;

    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);

    let time = '';
    if (hours) {
        time += `${hours} hours `;
    }
    time += `${minutes} minutes`;
    // console.log(time)

    return time;
};

export const endsWithAny = (suffixes: string[], str: string) => {
    return suffixes.some((suffix) => str.endsWith(suffix));
};

export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
