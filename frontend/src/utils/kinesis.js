
import { KinesisClient, PutRecordCommand } from "@aws-sdk/client-kinesis";
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import { toUint8Array } from '@smithy/util-utf8'

const STREAM_NAME = 'kinesis-web-analytics-stream';

export const writeToKinesis = async (idToken, event) => {

    console.log('Writing event');

    const kinesisClient = new KinesisClient({
        region: process.env.NEXT_PUBLIC_REGION,
        credentials: fromCognitoIdentityPool({
            clientConfig: { region: process.env.NEXT_PUBLIC_REGION }, 
            identityPoolId: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID,
            logins: {
                [`cognito-idp.${process.env.NEXT_PUBLIC_REGION}.amazonaws.com/${process.env.NEXT_PUBLIC_USER_POOL_ID}`]: idToken,
            }
        })
    });

    const params = {
        Data: toUint8Array(JSON.stringify(event)),
        PartitionKey: event['session_id'].toString(),
        StreamName: STREAM_NAME
      };

      const command = new PutRecordCommand(params);

      try {
        const data = await kinesisClient.send(command);
        // process data.
      } catch (error) {
        console.log(error)
      } 
}



