'use strict';

const region = process.env.AWS_REGION;

const AWS = require('aws-sdk');
const sd = new AWS.ServiceDiscovery({ region });

const findNamespaceByName = async (name) => {
  const { Namespaces } = await sd.listNamespaces({}).promise();
  const namespace = Namespaces.find((namespace) => {
    return namespace.Name === name;
  });
  return namespace;
};

const findServiceByName = async (name) => {
  const { Services } = await sd.listServices({}).promise();
  const service = Services.find(s => s.Name === name);
  return service;
};

const findInstanceByName = async (name, serviceId) => {
  const  { Instances } = await sd.listInstances({
    ServiceId: serviceId,
  }).promise();
  const instance = Instances.find(i => i.Id === name);
  return instance;
};

const createNamespace = async (namespace) => {
  const exists = await findNamespaceByName(namespace.name);
  if (exists) {
    return;
  }

  const params = { Name: namespace.name };
  return sd.createHttpNamespace(params).promise();
}

const createService = async (service) => {
  const namespace = await findNamespaceByName(service.namespace);
  let { Id } = await findServiceByName(service.name);
  if (!Id) {
    const params = {
      Name: service.name,
      NamespaceId: namespace.Id,
      Description: service.description,
    };
    const srv = await sd.createService(params).promise();
    Id = srv.Id;
  }

  return {
    id: Id,
  };
}

const createInstance = async (instance, serviceId) => {
  const params = {
    Attributes: {
      type: 'function',
      arn: instance.resource.arn,
      ...instance.config,
    },
    InstanceId: instance.name,
    ServiceId: serviceId,
  };
  return sd.registerInstance(params).promise();
};

module.exports = {
  findNamespaceByName,
  findServiceByName,
  findInstanceByName,

  createNamespace,
  createService,
  createInstance,
};
