// timeZone: "UTC" is load-bearing. pubDate values are UTC midnight, so
// formatting them in a negative-offset zone would render the previous day.
const LONG = new Intl.DateTimeFormat("en-US", {
	dateStyle: "long",
	timeZone: "UTC",
});
const MONTH = new Intl.DateTimeFormat("en-US", {
	month: "short",
	year: "numeric",
	timeZone: "UTC",
});

/** "August 4, 2025" */
export const formatDate = (d: Date) => LONG.format(d);

/** "Aug 2025" */
export const formatMonth = (d: Date) => MONTH.format(d);
