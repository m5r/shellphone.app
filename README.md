# Remixtape

Welcome to Remixtape! 💿📼

Before getting started, make sure you join the community where you can chat with other Remixtape users, ask questions and get help:  
[Remixtape Discord](https://discord.gg/KSP8rvtU4R)

## Getting started

### System requirements

- Node.js >=16
- Docker and docker-compose

### Initial setup

0. Sign up for the third-party services used with this stack.

- [Fly](https://fly.io/) — host the app and its database
- [Stripe](https://stripe.com) — accept payments
- [AWS SES](https://aws.amazon.com/ses) — send emails

1. Grab the code and initialize your project's git repository.

[Generate a GitHub access token](https://github.com/settings/tokens/new?description=Remixtape%20Stack%20Access&scopes=repo)
to use with the `create-remix` CLI

```shell
GITHUB_TOKEN=paste_access_token_here npx create-remix@latest ./shellphoneappremixed --template m5r/remixtape
cd shellphoneappremixed
git init
```

2. Start Stripe CLI, Redis, and Postgres.

```shell
docker-compose up --detach
npx prisma migrate dev && npx prisma db seed
```

Print Stripe CLI's logs with `docker-compose logs stripe` and copy the webhook signing secret over to your `.env` file.

3. 👏 You made it! You're now ready to run your app locally

```shell
npm run dev
```

That's it! You now have your app running locally on http://localhost:3000

### Development

To develop your app, you need to run the development database, the Stripe CLI and the Remix development CLI.
These two commands will take care of it:

```shell
docker-compose up -d
npm run dev
```

### Tests

The codebase comes with Cypress and end-to-end tests to help you get started testing your app
and making sure your app works for your users.  
The `npm run e2e` command will run Cypress and your end-to-end tests,
but you can always open Cypress with `npx cypress open` to write and run your tests interactively.

### Deployment

A Remix app can be deployed in a large and growing list of JavaScript environments.
The simplest and most straightforward option is using the Remix App Server which is basically a Node.js server.  
Deployment to Fly is covered here because it's an *amazing* hosting service, but you can host your Remix app
anywhere you'd like with the provided `Dockerfile`.

#### Setup

Note: make sure you have their CLI `flyctl` installed on your machine.
Their [docs](https://fly.io/docs/getting-started/installing-flyctl/) cover the installation on Linux, macOS, and Windows.

1. Create a Fly app

Initialize your app from the provided `fly.toml` file but do not deploy it just yet.

```shell
flyctl launch --no-deploy --copy-config --name shellphoneappremixed
```

2. Import your environment variables as secrets

You can either import them one by one
```shell
flyctl secrets set APP_BASE_URL=https://shellphoneappremixed.fly.dev
flyctl secrets set INVITATION_TOKEN_SECRET=0ded075524fd19fe467eb00480b8d5d4
# ...
```

Or import them in bulk.
Here `secrets.txt` is a plain text file that contains your secrets in the form of `ENV_NAME=VALUE`,
kind of like your `.env` file but without any comment.
```shell
cat secrets.txt | flyctl secrets import
```

3. Deploy a Postgres instance and attach it to your app

```shell
flyctl postgres create --name shellphoneappremixed-pg
flyctl postgres attach --postgres-app shellphoneappremixed-pg --app shellphoneappremixed
```

4. Deploy a Redis instance

It uses a persistent storage through a Fly storage volume we create, preferably in the same region.  
[BullMQ documentations](https://docs.bullmq.io/guide/connections) recommends setting your Redis instance with
`maxmemory-policy=noeviction` in order to avoid automatic removal of keys which would cause unexpected errors in BullMQ.  
I recommend using `openssl` to generate a strong random.
Keep it somewhere safe, we will need it to connect our app to this Redis instance later.

```shell
flyctl apps create shellphoneappremixed-redis
flyctl volumes create shellphoneappremixed_redis_data -c ./fly.redis.toml
openssl rand -hex 16 # copy its output
flyctl secrets set MAXMEMORY_POLICY="noeviction" -c ./fly.redis.toml
flyctl secrets set REDIS_PASSWORD=paste_redis_password_here -c ./fly.redis.toml
flyctl deploy -c ./fly.redis.toml
```

5. Connect your app to Redis

Last, we need to tell our app how to connect to our Redis instance.
It's time to use that Redis password saved from the previous step!  
We're using our Redis Fly app's .internal address which is formatted like this `{region}.{name}.internal`.

```shell
flyctl secrets set "REDIS_URL=redis://cdg.shellphoneappremixed-redis.internal"
flyctl secrets set "REDIS_PASSWORD=paste_redis_password_here"
```

6. Deploy your app 🚀

```shell
flyctl deploy
```

#### Deploy with GitHub Actions

Once your app is set up with its environment variables and connected to both the database and redis,
setting up automatic deployment is straightforward:

1. Generate a Fly API token in your [Fly account settings](https://web.fly.io/user/personal_access_tokens)
2. Copy it to your GitHub repository's secrets under the name `FLY_API_TOKEN`.

That's a wrap! From now on, pushing code to the `master` branch will automatically deploy your app to Fly.
