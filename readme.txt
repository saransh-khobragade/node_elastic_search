search api curl

curl --location --request POST 'localhost:1338/elastic/search' \
--header 'Content-Type: application/json' \
--header 'Content-Type: text/plain' \
--data-raw '{
    "query": {
        "bool": {
            "must": [
                {
                    "fuzzy": {
                        "text": {
                            "value": "ary"
                        }
                    }
                }
            ]
        }
    }
}'


ping curl

curl --location --request GET 'localhost:1338/elastic/ping'

refresh curl

curl --location --request POST 'localhost:1338/elastic/index/refresh'