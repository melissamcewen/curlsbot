# Facebook Messenger Bot

This example project creates a Facebook Messenger bot, completely
mirroring the quickstart located in [Messenger Platform docs](https://developers.facebook.com/docs/messenger-platform/guides/quick-start).

It's an echo bot that responds to a user's message by repeating their message back to them. It also sends a generic template when a message with "generic" text is received. This project is not dependent on any external libraries and can easily be extended.

![](https://cdn.glitch.com/ca73ace5-3fff-4b8f-81c5-c64452145271%2FmessengerBotGIF.gif)

## Getting Started
To get started you need to:

- Set up your Facebook app on Facebook

- Configure your Facebook App

  The `Callback URL` you set when configuring your app on Facebook is your Glitch project's publish URL with '/webhook' appended. The publish URL is what loads when you click 'Show' and has the format 'https://project-name.glitch.me', so for this example we used 'https://messenger-bot.glitch.me/webhook' for the Callback URL.

  The `Verify Token` is a string you make up - it's just used to make sure it is your Facebook app that your server is interacting with. 

- Copy your app credentials into the `.env` file

For more detailed setup instructions, see [Messenger Platform Quick Start](https://developers.facebook.com/docs/messenger-platform/guides/quick-start).