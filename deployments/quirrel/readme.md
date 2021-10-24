# Quirrel

Quirrel instance running on fly.io

### Deploy

```shell
flyctl launch --name quirrel-prod
node -e "console.log(crypto.randomBytes(16).toString('hex'))" # copy its output
flyctl secrets set PASSPHRASES= # paste the 32-character long password copied previously
flyctl secrets set REDIS_URL=redis://:REDIS_PASSWORD@cdg.quirrel-redis-prod.internal:6379?family=6
flyctl deploy
```

### Set up with the app

Copy the output of this command below and set it to the app's `QUIRREL_TOKEN` secret

```shell
curl --user ignored:PASSPHRASES_FROM_EARLIER -X PUT https://quirrel-prod.fly.dev/tokens/shellphone
```
