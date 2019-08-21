'use strict';

const { Component } = require('@serverless/core');
const Cloudmap = require('./cloudmap');

const region = process.env.AWS_REGION;

class CloudmapComponent extends Component {

  async default(inputs = {}) {
    const { namespace, service } = inputs;

    await Cloudmap.createNamespace({
      name: namespace,
    });

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

    await Promise.all(resources.map(async (instance) => {
      // const lambda = await this.load('@serverless/aws-lambda', instance.name);
      // const f = await lambda({
      //   region,
      //   code: inputs.code,
      //   name: instance.name,
      //   handler: instance.handler,
      // });
      return Cloudmap.createInstance(instance, id);
    }));
  }

  async remove() {
    // @todo
    // Can't delete namespace, could be shared...
    // Delete service
    // Delete instances
  }
}

module.exports = CloudmapComponent;
