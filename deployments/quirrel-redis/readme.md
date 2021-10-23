# Redis

Redis instance running on fly.io

### How to

```shell
flyctl launch --name quirrel-redis-prod
node -e "console.log(crypto.randomBytes(16).toString('hex'))" # copy its output
flyctl secrets set REDIS_PASSWORD= # paste the 32-character long password copied previously
flyctl volumes create redis_data --region cdg
flyctl deploy
```
