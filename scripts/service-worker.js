async function contextClick(info) {
	console.debug("Content menu item has been clicked.");

	if (info.menuItemId === "edit-prompts") {
		chrome.runtime.openOptionsPage();
		return;
	}

	if (!info.editable) {
		// There is no editable text.
		return;
	}

	let selection = "";

	if (info.selectionText) {
		selection = info.selectionText.trim();
	}

	const apiKey = await chrome.storage.sync.get(["oaiKey"]);
	if (!apiKey.oaiKey) {
		// The OpenAI API Key is not set.
		chrome.runtime.openOptionsPage();
		return;
	}
	const model = await chrome.storage.sync.get(["model"]);

	const fullPrompt = await getFullPrompt(info.menuItemId, selection);

	if (fullPrompt === "") {
		// Prompt is empty, probably was not found in the storage. Should never happen.
		return;
	}

	const apiResult = await makeAPICall(fullPrompt, apiKey.oaiKey, model.model);

	if (apiResult.status !== 200) {
		console.error("Error while calling ChatGPT.", apiResult);
		return;
	}

	const res = await apiResult.json();
	const replacement = res.choices[0].message.content;

	await sendMessageToReplace(replacement, selection);
}

async function makeAPICall(fullPrompt, apiKey, model) {
	const response = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model: model,
			messages: [
				{
					role: "user",
					content: fullPrompt,
				},
			],
		}),
	});

	return response;
}

async function getFullPrompt(promptID, selection) {
	const prompts = await getPromptsFromStorage();
	for (let index = 0; index < prompts.length; index++) {
		const prompt = prompts[index];
		if (prompt.name === promptID) {
			return prompt.body.replace("$selection", selection);
		}
	}

	return "";
}

async function sendMessageToReplace(replacement, selection) {
	console.debug(
		"Sending message from the service worker to the content script."
	);

	const [tab] = await chrome.tabs.query({
		active: true,
		lastFocusedWindow: true,
	});
	await chrome.tabs.sendMessage(tab.id, {
		replacement: replacement,
		selection: selection,
	});
}

async function getPromptsFromStorage() {
	const result = await chrome.storage.sync.get(["prompts"]);
	return result.prompts;
}

async function init() {
	const initialPrompts = await getPromptsFromStorage();

	if (initialPrompts == null || initialPrompts == []) {
		console.debug("Initialising initial prompts.");
		chrome.storage.sync.set({
			prompts: [
				{
					name: "Rewrite Professionally",
					body: "Please rewrite the following in a professional manner: $selection",
				},
				{
					name: "Rewrite Casually",
					body: "Please rewrite the following in a casual manner: $selection",
				},
				{
					name: "Fix typos",
					body: "Please rewrite the following with all the typos fixed: $selection",
				},
				{
					name: "Cat Joke",
					body: "Please give me a funny joke about cats.",
				},
			],
		});
	}
	console.debug("Initialising model configuration.");

	const result = await chrome.storage.sync.get(["model"]);
	if (!result.model) {
		chrome.storage.sync.set({ model: "gpt-4" });
	}

	console.debug("Initialising context menu.");
	const prompts = await getPromptsFromStorage();

	for (let index = 0; index < prompts.length; index++) {
		const prompt = prompts[index];
		if (!prompt.name || !prompt.body) {
			// Prompt either has an empty name or an empty body. Should not happen; means we allowed the user to add an empty prompt.
			return;
		}
		chrome.contextMenus.create({
			title: prompt.name,
			contexts: ["editable"],
			id: prompt.name,
		});
	}

	chrome.contextMenus.create({
		title: "Edit prompts..",
		contexts: ["all"],
		id: "edit-prompts",
	});
}

chrome.contextMenus.onClicked.addListener(contextClick);
chrome.runtime.onInstalled.addListener(init);
