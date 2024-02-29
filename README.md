![Chrome ChatGPT Helper Logo](./images/icon-128.png)


# Chrome ChatGPT Helper

Tired of copy pasting text into ChatGPT? Tired of switching tabs? Do you wish you could just run a prompt within Chrome with just a click? Well now you can!

Chrome ChatGPT helper is a Google Chrome extension that adds customisable ChatGPT prompts to your Chrome right click menu. You can use these prompts to replace your selected text with the prompt of your choosing. Example usages are rewriting your mail in a professional manner, or generating a joke, right inside your text field.

## Configuration

After installing the extension, click on the extension icon on the top right and click **Options**. Alternatively, right click on the web page, and click **Edit Prompts**. This will open the Options page for the extension.

### OpenAI API Key

If your don't have an [OpenAI account](https://platform.openai.com/signup), please create one, generate an [OpenAI API Key](https://platform.openai.com/api-keys), then paste the **Secret Key** here. Keep this key secret!

Make sure you have [enough credits](https://platform.openai.com/account/billing/overview) in your account. It is also a good idea to set [usage limits](https://platform.openai.com/account/limits), so you don't encounter any surprises!

### Model

Choose your model. GPT-4 is smarter, but more expensive than GTP-3.5 Turbo. See [here](https://openai.com/pricing) for pricing details.

### Prompts

Click **Add Prompt** to add a new prompt. Make sure that your prompt names are unique. Click **Delete Prompt** to delete the prompt.

When a prompt is run via the right-click menu, your text selection will be replaced by the prompt result, and your original selection will be copied to the clipboard, so you can press <kbd>Ctrl</kbd> + <kbd>V</kbd> to get it back. You can use _$selection_ inside your prompts to insert the selected text into the prompt, please see the built-in prompts for examples.

Keep in mind that **changes won't be saved until the Save button is clicked!**

## Disclaimer

> [!IMPORTANT]  
> This extension bridges Google Chrome to ChatGPT; we are not responsible for what ChatGPT might generate. You are responsible for any costs incurred by using this extension- this extension is free, but ChatGPT itself isn't. Like [mentioned above](./README.md#openai-api-key), set usage limits to avoid being overcharged. This extension does not collect any data whatsoever, not does it contain any tracking.

## Acknowledgments

* The logo was drawn using Aseprite, and is **not** AI generated.
* [Pure.css](https://purecss.io/) is used in the options page.
