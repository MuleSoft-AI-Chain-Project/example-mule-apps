
%dw 2.0
output application/java 
---
[
    {
        "inputSchema": "{\"type\":\"object\",\"properties\":{\"materialNo\":{\"type\":\"string\",\"description\":\"The material number for querying inventory data\"}},\"required\":[\"materialNo\"],\"additionalProperties\":false}",
        "description": "This tool gets inventory from ERP",
        "name": "get_inventory"
    },
    {
        "inputSchema": "{\"type\":\"object\",\"properties\":{}}",
        "description": "Get all accounts from a CRM",
        "name": "get_accounts"
    }
]