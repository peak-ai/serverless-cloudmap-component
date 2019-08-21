# Serverless Cloudmap Component

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
```
