export default function parseTTL(ttl: string) {
	const timeNote = ttl.match(/^\d+(s|m|h|d)$/)?.[1] as
		| 's'
		| 'm'
		| 'h'
		| 'd'
		| undefined;
	const time = parseInt(ttl);

	if (!timeNote) throw new Error('Failed to parse time from string');

	let timeInSeconds = 0;

	switch (timeNote) {
		case 's': // Second
			timeInSeconds = time;
			break;
		case 'm': // Minute
			timeInSeconds = time * 60;
			break;
		case 'h': // hours
			timeInSeconds = time * 60 * 60;
			break;
		case 'd': // Day
			timeInSeconds = time * 60 * 60 * 24;
			break;
	}

	return {
		milliseconds: timeInSeconds * 1000,
		seconds: timeInSeconds,
		minutes: timeInSeconds / 60,
		hours: timeInSeconds / 60 / 60,
		days: timeInSeconds / 60 / 60 / 24,
	};
}
