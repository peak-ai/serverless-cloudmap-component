# Serverless Cloudmap Component

# MOVED - Please use https://github.com/serverless-components/cloudmap 

The purpose of this library is to register your components within Cloudmap. You can define a namespace, service and include 'instances' within the Cloudmap component. If they don't exist, they'll be created.

You can register any other component as long as the output contains an ARN.

```yaml
name: serverless-cloudmap-component

createUser:
  component: '@serverless/function'
  code: ./src
  handler: index.createUser

fetchUser:
  component: '@serverless/function'
  code: ./src
  handler: index.fetchUser

userTable:
  component: "@serverless/aws-dynamodb"
  inputs:
    attributeDefinitions:
      - AttributeName: id
        AttributeType: S
    keySchema:
      - AttributeName: id
        KeyType: HASH
    region: eu-west-1

UserService:
  component: ../
  inputs:
    service: 'user-service'
    namespace: 'test'
    resources:
      create:
        resource: ${createUser}
      fetch:
        resource: ${fetchUser}
        config:
          some: "other metadata"
      userTable:
        resource: ${userTable}
        config:
          type: "table"
```
