chrome.runtime.onMessage.addListener(function (request, _, _) {
	console.debug("Received message to the content script.");

	if (!request.replacement) {
		console.error("Replacement value is empty.");
		return;
	}

	replaceSelectedText(request.replacement, request.selection);
});

function replaceSelectedText(toReplace, originalSelection) {
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
	} else if (
		activeElement.textContent !== undefined ||
		activeElement.textContent !== null
	) {
		// Custom textbox, like Draft.js. Even though it is deprecated, we need to use execCommand here- setting the innerText manually just causes React to override the value.
		const val = activeElement.textContent;

		const selection = originalSelection.trim();
		if (selection) {
			navigator.clipboard.writeText(selection);
			// There is a potential problem here; since we don't have the selection indices (like we do for regular input fields), we have to do a naive string replace.
			// This means that if the selected text is duplicated in the textContent, only the first occurance will be replaced, as we don't know which one is selected.
			const newText = val.replace(selection, toReplace);
			document.execCommand("insertText", false, newText);
		} else {
			document.execCommand("insertText", false, toReplace);
		}
	}
}
