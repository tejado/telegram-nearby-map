# How to use the docker version

## build it
docker build -t telegram-map .

## run it 
docker run --rm -ti -e PORT=3000 -e HOST=0.0.0.0 -e TELEGRAM_API_ID=<your-api-id> -e TELEGRAM_API_HASH=<your-api-hash> -p 3000:3000 telegram-map


## Tips

Run it this way is safer as it will ask for your phone number and confirmation code every time the app starts.
