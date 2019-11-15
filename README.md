# vista_websocket

This is the code and template for the vista_websocket.  There are three functions contained within the directories and a SAM template that wires them up to a DynamoDB table and provides the minimal set of permissions needed to run the app:

```
.
├── README.md                   <-- This instructions file
├── onconnect                   <-- Source code onconnect
├── ondisconnect                <-- Source code ondisconnect
├── sendmessage                 <-- Source code sendmessage
├── buildspec.yml               <-- An AWS CodeBuild build specification that installs required packages
└── template.yaml               <-- SAM template for Lambda Functions and DDB
```

## Create an AWS CloudFormation Role

Create a role that gives AWS CloudFormation permission to access AWS resources.

1. Open the [roles page](https://console.aws.amazon.com/iam/home#/roles) in the IAM console.
2. Choose Create role.
3. Create a role with the following properties.
    - Trusted entity – AWS CloudFormation
    - Permissions – AWSLambdaExecute
    - Role name – cfn-lambda-pipeline
4. Open the role. Under the Permissions tab, choose Add inline policy.
5. In Create Policy, choose the JSON tab and add the following policy.
``` 
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "iam:GetRole",
                "apigateway:*",
                "dynamodb:*",
                "iam:CreateRole",
                "iam:DeleteRole",
                "iam:AttachRolePolicy",
                "s3:GetBucketVersioning",
                "cloudformation:CreateChangeSet",
                "iam:PutRolePolicy",
                "iam:PassRole",
                "iam:DetachRolePolicy",
                "iam:DeleteRolePolicy",
                "codedeploy:*",
                "lambda:*",
                "s3:GetObjectVersion"
            ],
            "Resource": "*"
        }
    ]
}
```
## Set Up a Repository
Clone source code, create your repository and upload source code to your repository. 

**Note:** Replace the text with the name of your bucket in buildspec.yml

`export BUCKET=your-bucket-name`

## Create a Pipeline
Refer to this tutorial [build-pipeline](https://docs.aws.amazon.com/en_us/lambda/latest/dg/build-pipeline.html) and follow the **Create a Pipeline, Update the Build Stage Role, Complete the Deployment Stage**

**Note:** Source provider – Github and connect to github. 

After finishing, your pipeline is ready. Push changes to the master branch to trigger a deployment.

## Testing the API

Access API gateway, select the newly created api gateway. You will get the WebSocket URL: `wss://{YOUR-API-ID}.execute-api.{YOUR-REGION}.amazonaws.com/{STAGE}`

To test the WebSocket API, you can use [wscat](https://github.com/websockets/wscat), an open-source command line tool.

1. [Install NPM](https://www.npmjs.com/get-npm).
2. Install wscat:
``` bash
$ npm install -g wscat
```
3. On the console, connect to your published API endpoint by executing the following command:
``` bash
$ wscat -c wss://{YOUR-API-ID}.execute-api.{YOUR-REGION}.amazonaws.com/{STAGE}
```
4. To test the sendMessage function, send a JSON message like the following example. The Lambda function sends it back using the callback URL: 
``` bash
$ wscat -c wss://{YOUR-API-ID}.execute-api.{YOUR-REGION}.amazonaws.com/prod
connected (press CTRL+C to quit)
> {"message":"sendmessage", "data":"hello world"}
< hello world
```

## Refer
[https://docs.aws.amazon.com/en_us/lambda/latest/dg/build-pipeline.html](https://docs.aws.amazon.com/en_us/lambda/latest/dg/build-pipeline.html)

[https://aws.amazon.com/vi/blogs/compute/announcing-websocket-apis-in-amazon-api-gateway](https://aws.amazon.com/vi/blogs/compute/announcing-websocket-apis-in-amazon-api-gateway/)

[https://github.com/aws-samples/simple-websockets-chat-app](https://github.com/aws-samples/simple-websockets-chat-app)

