'use strict';

const AWS = require('aws-sdk');
AWS.config.setPromisesDependency(require('bluebird'));
AWS.config.update({ region: 'eu-west-1' });

const s3 = new AWS.S3();
const s3Bucket = process.env['S3_BUCKET'];

module.exports.push = (event, _, callback) => {
  const object = {
    MessageId: event.Records[0].messageId,
    Attributes: event.Records[0].attributes,
    Body: JSON.parse(event.Records[0].body),
  };

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
          message: 'Successfully sent the message to SQS.'
        })
      });
      return;
    }
  });
}
