chrome.runtime.onMessage.addListener(function (request, _, _) {
	console.debug("Received message to the content script.");

	if (!request.replacement) {
		console.error("Replacement value is empty.");
		return;
	}

	replaceSelectedText(request.replacement);
});

function replaceSelectedText(toReplace) {
	let activeElement = document.activeElement;

	if (activeElement.selectionStart != 0 && activeElement.selectionEnd) {
		// If there is a selection, copy it into the clipboard, so it doens't get lost.
		const selection = activeElement.value
			.slice(activeElement.selectionStart, activeElement.selectionEnd)
			.trim();
		if (selection) {
			navigator.clipboard.writeText(selection);
		}
	}

	activeElement.value =
		activeElement.value.slice(0, activeElement.selectionStart) +
		toReplace +
		activeElement.value.slice(activeElement.selectionEnd);
}
