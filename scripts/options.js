const saveButton = document.getElementById("save");
const addPromptButton = document.getElementById("addPrompt");
const infoMessage = document.getElementById("info");
const keyInput = document.getElementById("oaiKey");
const promptList = document.getElementById("prompts");
const modelSelect = document.getElementById("model");

function saveOptions() {
	const apiKey = document.getElementById("oaiKey").value;
	const prompts = getPromptsFromDocument();

	if (!checkPrompts(prompts)) {
		// There is an error with the prompts.
		return;
	}

	const model = modelSelect.value;

	chrome.storage.sync.set(
		{ oaiKey: apiKey, prompts: prompts, model: model },
		() => {
			reloadContextMenu(prompts);
			setSuccessMessage("Options saved.", 1500);
		}
	);
}

function checkPrompts(prompts) {
	let names = [];

	for (let index = 0; index < prompts.length; index++) {
		const prompt = prompts[index];
		if (!prompt.name || !prompt.body) {
			setErrorMessage("Please make sure there are no empty prompt fields.");
			return false;
		}
		if (names.includes(prompt.name)) {
			setErrorMessage("Please make prompt names are unique.");
			return false;
		}
		names.push(prompt.name);
	}

	return true;
}

function reloadContextMenu(prompts) {
	chrome.contextMenus.removeAll();
	for (let index = 0; index < prompts.length; index++) {
		const prompt = prompts[index];
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

function getPromptsFromDocument() {
	let results = [];

	const promptElems = document.getElementsByClassName("prompt");

	for (let index = 0; index < promptElems.length; index++) {
		const element = promptElems[index];
		const promptName = element.querySelector("input").value;
		const promptBody = element.querySelector("textarea").value;
		results.push({ name: promptName, body: promptBody });
	}

	return results;
}

function restoreOptions() {
	chrome.storage.sync.get(
		{ oaiKey: "", prompts: [], model: "gpt-4" },
		(items) => {
			items.prompts.forEach((prompt) => {
				if (!prompt.name || !prompt.body) {
					// Prompt either has an empty name or an empty body. Should not happen; means we allowed the user to add an empty prompt.
					return;
				}
				addPromptUI(prompt.name, prompt.body);
			});
			
			setDeleteEvents();
			keyInput.value = items.oaiKey;
			modelSelect.value = items.model;
			checkKeyValidity();
		}
	);
}

function setDeleteEvents() {
	const deletePromptButtons = document.querySelectorAll(".deletePrompt");

	deletePromptButtons.forEach((button) => {
		button.addEventListener("click", deletePromptUI);
	});
}

function checkKeyValidity() {
	const key = keyInput.value;
	if (!key) {
		saveButton.disabled = true;
		setErrorMessage("Please add your OpenAI API Key.");
	} else {
		saveButton.disabled = false;
		clearInfoMessage();
	}
}

function setSuccessMessage(text, timeout = -1) {
	infoMessage.classList = [];
	infoMessage.classList.add("success");
	setInfoMessage(text, timeout);
}

function setErrorMessage(text, timeout = -1) {
	infoMessage.classList = [];
	infoMessage.classList.add("error");
	setInfoMessage(text, timeout);
}

function setInfoMessage(text, timeout = -1) {
	infoMessage.textContent = text;

	if (timeout > 0) {
		setTimeout(() => {
			infoMessage.textContent = "";
		}, timeout);
	}
}

function clearInfoMessage() {
	setInfoMessage("");
}

function getPromptUI(name, body) {
	let template = `
        <div class="prompt">
            <div class="pure-g">
                <div class="pure-u-1-1">
                    <div class="pure-form pure-form-stacked padded">
                        <label>Prompt name:</label>
                        <input type="text" value="${name}" />
                        <label>Prompt</label>
                        <textarea rows="5">${body}</textarea>
                        <div class="align-right">
                            <button class="pure-button button-error deletePrompt">Delete Prompt</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
	`;

	return template;
}

function addEmptyPromptUI() {
	addPromptUI("", "");
	setDeleteEvents();
}

function addPromptUI(name, body) {
	const ui = getPromptUI(name, body);
	promptList.innerHTML += ui;
}

function deletePromptUI(event) {
	const promptToRemove =
		event.target.parentElement.parentElement.parentElement.parentElement
			.parentElement;
	promptToRemove.remove();
}

document.addEventListener("DOMContentLoaded", restoreOptions);
saveButton.addEventListener("click", saveOptions);
addPromptButton.addEventListener("click", addEmptyPromptUI);
keyInput.addEventListener("input", checkKeyValidity);
