export const timeFormatter = (timestamp: number): string => {
    const seconds = Math.floor(Date.now()/1000 - timestamp)
    if(seconds < 60)
    {
        return `${seconds} seconds ago`;
    }

    const minutes = Math.floor(seconds/60)
    if(minutes < 60)
    {
        return `${minutes} minutes ago`;
    }

    const hours = Math.floor(minutes/60)
    if(hours < 24)
    {
        return `${hours} hours ago`;
    }

    const days = Math.floor(hours/24)
    return `${days} day(s) ago`;
};