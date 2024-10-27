# POODL / old book barter demo

This Demo Telegram MiniApp showcases the integration with [@tonconnect/ui-react](https://www.npmjs.com/package/@tonconnect/ui-react) and simple execution of old book shopping with TON POODL tokens.

## Differences
Main changes to original [tma-usdt-payments-demo](https://github.com/ton-community/tma-usdt-payments-demo) are:

1. Integration of externally provided JSON-formatted product lists. Thus, Your app can dynamically load different product catalogues from the backend.

2. UI is adapted to task at hand: distribution of unique physical items (e.g. old books).

## Prerequisites

### Create Mini App

First of all, to correctly display the application and get the most accurate development experience, you
have to create a Telegram Mini App. After completing this step, you will be able to view the application inside 
Telegram.

Here is the short guide on how to do it:

1. Open [@BotFather](https://t.me/BotFather) in Telegram.
2. Send the `/newbot` command to create a new bot.
3. Follow the prompts to set up your bot, providing all necessary information.
4. After the bot is created, send the `/newapp` command to BotFather.
5. Select your bot from the list.
6. Provide all the required information for your Mini App.

### Install Dependencies

To install project dependencies, use the following command:

```bash
yarn install
```

## Running

### Setup Your catalogueUrl
Modify `config.json` in Your dist directory to refer to Url containing Your product catalogue JSON.

```
{
  "catalogueUrl": "https://YOUR_DOMAIN/bookz.json"
}
```

Note: New product catalogue is loaded whenever the user reloads the app. 

An admin can also change the destination of the product catalogue without recompiling the app by simply modifying the entry in `config.json`.

You will find a real-life example `bookz.json` used in AE54 Berlin edition of TON Society Hackathon in `public/bookz.json`.

### Setting Transaction Variables

To configure transaction variables in `src/constants/common-constants.ts`, set the following environment variables:

- `POODL_MASTER_ADDRESS`: The master address of the POODL token.
  - **Mainnet**, POODL `EQBRKQPsq5ADeqOKu47IA5dTnXWcn-V5GX2xcj-imZ3US5eC`. You need to set this address manually 
  for production.
- `INVOICE_WALLET_ADDRESS`: The address of the wallet where POODL will be received upon payment.
  > **Important**: This should be the address of the usual TON wallet, not the POODL jetton wallet. 
  > The address of the POODL jetton wallet will be calculated upon sending.

### Building the Application

To start the application, run:

```bash
npm run build
```

Application's `index.html` and `assets` will be compiled in `dist` sub-directory. 

Configure Your web-server (e.g. nginx) to serve them appropriately.

### Updating Telegram Bot Configuration (Optional)

#### Update the Menu Button URL in Telegram Bot

1. Open [@BotFather](https://t.me/BotFather) in Telegram.
2. Send the `/mybots` command and select your bot.
3. Choose "Bot Settings" then "Menu Button" and finally "Configure menu button".
4. Enter the ngrok or localtunnel URL as the new destination.

#### Update Mini Apps URL in Telegram

1. Open [@BotFather](https://t.me/BotFather) in Telegram.
2. Send the `/myapps` command and select your Mini App.
3. Choose "Edit Web App URL".
4. Enter the URL pointing to Your webserver.

## Advanced

### Returning to the Application (Optional)

To return to the application after interacting with the wallet, you must specify a `twaReturnUrl` in `src/App.tsx`.

Here's a concise guide:

- **twaReturnUrl**: This is the return URL used by Telegram Web Apps. Set it to redirect users back to your application after wallet interaction. Example: `'https://t.me/WebAppWalletBot/myapp'`.

Here is a sample configuration for specifying a return URL:

```jsx
<TonConnectUIProvider
    manifestUrl="https://giver.eu/antik/tonconnect-manifest.json"
    uiPreferences={{ theme: THEME.DARK }}
    actionsConfiguration={{
        twaReturnUrl: 'https://t.me/giver_eu_bot/antik'
    }}
></TonConnectUIProvider>
```

