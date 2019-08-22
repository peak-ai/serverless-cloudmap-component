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
  const instances = await findInstancesByServiceId(serviceId);
  return instances.find(i => i.Id === name);
};

const findInstancesByServiceId = async (serviceId) => {
  const { Instances } = await sd.listInstances({
    ServiceId: serviceId,
  }).promise();
  return Instances;
}

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
  let srv = await findServiceByName(service.name);
  if (!srv) {
    const params = {
      Name: service.name,
      NamespaceId: namespace.Id,
      Description: service.description,
    };
    srv = await sd.createService(params).promise();
  }

  return {
    id: srv.Id,
  };
};

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

const deleteService = async (serviceName) => {
  const service = await findServiceByName(serviceName);
  const instances = await findInstancesByServiceId(service.Id);
  await Promise.all(instances.map(deregisterInstance(service.Id)));
  const params = {
    Id: service.Id,
  };

  // Gross :(
  return setTimeout(() => {
    return sd.deleteService(params).promise();
  }, 2000);
};

const deregisterInstance = serviceId => async (instance) => {
  const params = {
    InstanceId: instance.Id,
    ServiceId: serviceId,
  };
  return sd.deregisterInstance(params).promise();
};

module.exports = {
  findNamespaceByName,
  findServiceByName,
  findInstanceByName,

  createNamespace,
  createService,
  createInstance,

  deleteService,
};
