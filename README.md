# Endpoints 

### POST /pages 
- create a new page

### GET /pages/id 
- retrieve page by id
  
### DELETE /pages/id 
- delete a page
### POST /test/pages 
- create a new page with `payId = frankfka$xpring.money`

### POST /test/xpring 
- no content needed to post, just retrieves the xpring request for frankfka$xpring.money

# API Spec 

### Create New Page 
```json
{  
	"payId": "roshan$example.com",  
	"name": "roshan",  
	"customMessage": "hey there",
	"requestedAmount": {
		"value": 300, 
		"currencyCode": "XRP"
	}
}
```

### Retrieve Page by id 
```json
{
    "requestedAmount": {
        "value": 300,
        "currencyCode": "XRP"
    },
    "_id": "5f1dee13b52fad6269ff9bc0",
    "payId": "roshan$example.com",
    "name": "roshan",
    "customMessage": "hey there",
    "paymentOptions": [
        {
            "paymentInfo": {
                "address": "r4dgrsh8RBCSnDr3kZMSMKcpp2WiJ7By3z"
            },
            "_id": "5f1dee13b52fad6269ff9bc1",
            "currencyCode": "XRP",
            "value": 300
        }
    ],
    "__v": 0
}
```