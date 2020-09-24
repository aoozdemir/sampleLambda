'use strict';

const AWS = require('aws-sdk');

AWS.config.setPromisesDependency(require('bluebird'));

const sqsQueue = new AWS.SQS();
const sqsUrl = process.env['SQS_URL'];


module.exports.push = (event, context, callback) => {
  const params = {
    MessageBody: event.body,
    QueueUrl: sqsUrl,
  };
  console.log(params);

  sqsQueue.sendMessage(params, (err, data) => {
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
