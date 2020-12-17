'use strict';

const AWS = require('aws-sdk');

const s3 = new AWS.S3();
const s3Bucket = process.env['S3_BUCKET'];

const thundra = require("@thundra/core");
// const thundra = require('../thundra-lambda-agent-nodejs/dist/thundra');

// const TimeAwareSampler = thundra.samplers.TimeAwareSampler;

// const config = {
//   invocationConfig: {
//     sampler: new TimeAwareSampler(300000) // Sample metrics every 300s
//   },
// };
const config = {};

module.exports.push = thundra(config)((event, _, callback) => {
  try {
    const object = {
      MessageId: event.Records[0].messageId,
      Attributes: event.Records[0].attributes,
      Body: JSON.parse(event.Records[0].body),
    };

    if (object.Body.raiseError) {
      callback(null, {
        statusCode: 404,
        body: JSON.stringify({
          message: 'NOT_FOUND'
        })
      });
      return;
    } else if (!object.Body.timeOut) {
      const buffer = Buffer.from(JSON.stringify(object));

      const params = {
        Bucket: s3Bucket,
        Key: `${event.Records[0].messageId}.json`,
        Body: buffer,
        ContentEncoding: 'base64',
        ContentType: 'application/json',
        ACL: 'public-read',
      };

      s3.putObject(params, function (err, _) {
        if (err) {
          console.log(err, err.stack);
          callback(new Error('Couldn\'t send the document to S3.'));
          return;
        } else {
          console.log('Successfully sent the document to S3.');

          callback(null, {
            statusCode: 200,
            body: JSON.stringify({
              message: 'Successfully sent the document to S3.'
            })
          });
          return;
        }
      });
    } else {
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: 'TIMED_OUT'
        })
      });
      return;
    }
  } catch (e) {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        message: 'BAD_REQUEST'
      })
    });
    return;
  }
});
