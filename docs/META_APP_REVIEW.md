# Meta App Review

The app uses **Instagram API with Instagram Login** (`graph.instagram.com`). Endpoint names,
scopes and webhook formats in the code were checked against Meta's documentation in
October 2026. Re-check them before you submit; Meta changes these.

## 1. Set up the Meta app

- [ ] Meta developer account, a Meta app, and the **Instagram** product added
- [ ] Business verification started (it can take weeks)
- [ ] In the Instagram product settings ("API setup with Instagram login"):
  - [ ] OAuth redirect URI: `{API_URL}/instagram/callback` (must equal `META_REDIRECT_URI`)
  - [ ] Webhook callback URL: `{API_URL}/webhooks/meta`
  - [ ] Verify token: the value of `META_WEBHOOK_VERIFY_TOKEN`
  - [ ] Webhook fields subscribed: `comments`, `messages`
  - [ ] Deauthorize callback: `{API_URL}/compliance/deauthorize`
  - [ ] Data deletion request callback: `{API_URL}/compliance/data-deletion`
- [ ] App settings: privacy policy `{WEB_URL}/privacy`, terms `{WEB_URL}/terms`,
      data deletion instructions `{WEB_URL}/data-deletion`, app icon, category, contact email
- [ ] `.env`: `META_APP_ID` = the **Instagram** app id, `META_APP_SECRET` = the Instagram app
      secret (both from the Instagram product page, not the Facebook app basics page)

## 2. Permissions to request

| Permission                           | Why the app needs it                                                              | Where it is used                        |
| ------------------------------------ | --------------------------------------------------------------------------------- | --------------------------------------- |
| `instagram_business_basic`           | Read the connected account's id and username; list its posts for the post picker  | Instagram page, automation builder      |
| `instagram_business_manage_comments` | Receive comment webhooks; reply publicly; send the private reply to a commenter   | Comment trigger, public reply, first DM |
| `instagram_business_manage_messages` | Receive DMs; send follow-up messages, buttons, email capture; check follow status | Flows, follow gate, DM keyword trigger  |

## 3. Rules the product already respects

- Only Business or Creator accounts can connect (Instagram Login only allows those).
- One private reply per comment, within 7 days: enforced with a per-comment claim in Redis
  (8 days) plus a unique job id.
- Free-form DMs only within 24 hours of the follower's last message: a flow only sends after
  the follower writes back, and flows expire after 24 hours.
- Our own public replies arrive as comment webhooks too; they are ignored so the bot never
  answers itself.
- Long-lived tokens are refreshed daily when they have under 10 days left; expired ones are
  marked "Needs reconnecting" in the dashboard.

## 4. Demo video checklist

Record one screen video per permission, showing a path a reviewer can repeat:

- [ ] Log in to the app
- [ ] Connect an Instagram Creator account (show the Instagram consent screen and the scopes)
- [ ] Create an automation with a keyword on a post
- [ ] From a second Instagram account, comment the keyword on that post
- [ ] Show the public reply appearing under the comment
- [ ] Show the DM arriving in the second account's inbox
- [ ] Reply to the DM: show the email request, then the contact appearing in Contacts
- [ ] Show a follow gate: not following -> held; follow -> link sent
- [ ] Show Disconnect on the Instagram page and the data deletion page

## 5. Reviewer access

- [ ] A reviewer login (email + password) in the submission notes
- [ ] Step-by-step instructions matching the video
- [ ] Your Instagram account and a second test account added as testers of the app

## Until review is approved

Only accounts added as testers of the Meta app can connect and trigger automations.

## Testing without a real Instagram account

The API reads three optional overrides (`META_GRAPH_URL`, `META_OAUTH_URL`,
`META_AUTHORIZE_URL`) so the whole flow can be pointed at a local fake server. Leave them empty
in every real environment.
