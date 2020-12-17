'use strict';

const AWS = require('aws-sdk');

const sqsQueue = new AWS.SQS();
const sqsUrl = process.env['SQS_URL'];

const thundra = require("@thundra/core");
// const thundra = require('../thundra-lambda-agent-nodejs/dist/thundra');
// const TimeAwareSampler = thundra.samplers.TimeAwareSampler;
const config = {};

module.exports.push = thundra(config)(
  (event, _, callback) => {
    const params = {
      MessageBody: event.body,
      QueueUrl: sqsUrl,
    };
    console.log(params);

    sqsQueue.sendMessage(params, (err, _) => {
      if (err) {
        console.error(err);
        callback(new Error('Couldn\'t send the message to SQS.'));
        return;
      } else {
        console.log('Successfully sent the message to SQS.');

        callback(null, {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Successfully sent the message to SQS.'
          })
        });
        return;
      }
    });
  }
);
