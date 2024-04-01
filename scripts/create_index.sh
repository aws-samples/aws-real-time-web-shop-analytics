ES_ENDPOINT=https://localhost:8157

curl --location -k --request PUT ${ES_ENDPOINT}/input_events \
--header 'Content-Type: application/json' \
--data-raw '{
  "mappings": {
    "properties": {
        "sessionId": {"type": "integer"},
        "userId": {"type": "keyword"},
        "productId": {"type": "keyword"},
        "actionType": {"type": "keyword"},
        "dateTime": {"type": "date"}}
    }
  }
}'

curl --location -k --request PUT ${ES_ENDPOINT}/most_popular_products \
--header 'Content-Type: application/json' \
--data-raw '{
  "mappings": {
    "properties": {
        "productId": {"type": "keyword"},
        "count": {"type": "integer"}}
    }
  }
}'

curl --location -k --request PUT ${ES_ENDPOINT}/deduplicated_events \
--header 'Content-Type: application/json' \
--data-raw '{
  "mappings": {
    "properties": {
        "sessionId": {"type": "integer"},
        "userId": {"type": "keyword"},
        "productId": {"type": "keyword"},
        "actionType": {"type": "keyword"},
        "dateTime": {"type": "date"}}
    }
  }
}'

curl --location -k --request PUT ${ES_ENDPOINT}/not_made_purchase_events \
--header 'Content-Type: application/json' \
--data-raw '{
  "mappings": {
    "properties": {
        "sessionId": {"type": "integer"},
        "userId": {"type": "keyword"},
        "productId": {"type": "keyword"},
        "actionType": {"type": "keyword"},
        "dateTime": {"type": "date"}}
    }
  }
}'


