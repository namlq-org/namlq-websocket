// Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

const { TABLE_NAME } = process.env;

let arrUser = [];
console.log("aac");

exports.handler = async (event, context) => {
  let connectionData;
  
  try {
    connectionData = await ddb.scan({ TableName: TABLE_NAME, ProjectionExpression: 'connectionId' }).promise();
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }
  
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
  });
  
  const postData = JSON.parse(event.body).data;

  // add and remove user to arrUser when connect, disconnect
  const connection_id = event.requestContext.connectionId;
  if (postData.Status !== undefined) {
    if (postData.Status === "disconnect") {
      arrUser = arrUser.filter(function( obj ) {
        return obj.ConnectionId !== connection_id;
      });
    } else {
      postData.ConnectionId =  connection_id;
      arrUser.push(postData);
    }
  }
  
  const postCalls = connectionData.Items.map(async ({ connectionId }) => {
    try {
      if (postData.Status !== undefined) {
        await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: JSON.stringify(arrUser) }).promise();
      } else {
        await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: JSON.stringify(postData) }).promise();
      }
    } catch (e) {
      if (e.statusCode === 410) {
        console.log(`Found stale connection, deleting ${connectionId}`);
        await ddb.delete({ TableName: TABLE_NAME, Key: { connectionId } }).promise();
      } else {
        throw e;
      }
    }
  });
  
  try {
    await Promise.all(postCalls);
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  return { statusCode: 200, body: 'Data sent.' };
};
