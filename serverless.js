'use strict';

const { Component } = require('@serverless/core');
const Cloudmap = require('./cloudmap');

const region = process.env.AWS_REGION;

class CloudmapComponent extends Component {

  async default(inputs = {}) {
    const { namespace, service } = inputs;

    this.state.namespace = namespace;
    this.state.service = service;
    await this.save();

    this.context.status('Creating namespace');
    await Cloudmap.createNamespace({
      name: namespace,
    });

    this.context.status('Create service');
    const { id } = await Cloudmap.createService({
      name: service,
      namespace,
    });

    const resources = Object.keys(inputs.resources).map((key) => {
      return {
        ...inputs.resources[key],
        name: key,
      };
    });

    this.context.status('Registering instances');
    await Promise.all(resources.map(async (instance) => {
      return Cloudmap.createInstance(instance, id);
    }));
  }

  async remove() {
    this.context.status('Deleting service');
    const { service } = this.state;
    await Cloudmap.deleteService(service);
  }
}

module.exports = CloudmapComponent;
