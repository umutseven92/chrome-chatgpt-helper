chrome.runtime.onMessage.addListener(function (request, _, _) {
	console.debug("Received message to the content script.");

	if (!request.replacement) {
		console.error("Replacement value is empty.");
		return;
	}

	replaceSelectedText(request.replacement);
});

function replaceSelectedText(toReplace) {
	const activeElement = document.activeElement;

	if (activeElement.value) {
		// Regular input, textarea. We have the selectionStart and selectionEnd info, and we can just set the value.
		if (activeElement.selectionStart >= 0 && activeElement.selectionEnd >= 0) {
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
	} else {
		// A custom text input field, probably something like Draft.js.
		// While `execCommand` is deprecated, as of writing (2024) there is still no replacement,
		// and since there are so many apps / services that depend on it, it is unlikely to be removed anytime soon.
		// One exception to this is Reddit; since Reddit is a horrible website that refuses to follow established standards,
		// `execCommand` breaks backspace & deletion in their "fancy" text editor. Literally nothing works, not `execComand`,
		// not `dispatchEvent`, nothing. The only thing that can be done is do switch to the Markdown editor, paste, and then
		// go back.

		document.execCommand("insertText", false, toReplace);
	}
}
