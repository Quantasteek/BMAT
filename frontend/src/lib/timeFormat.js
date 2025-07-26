const timeFormat = (minutes)=>{
    // Handle cases where minutes is undefined, null, or not a number
    if (!minutes || isNaN(minutes) || typeof minutes !== 'number') {
        return 'N/A';
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;    
}

export default timeFormat;