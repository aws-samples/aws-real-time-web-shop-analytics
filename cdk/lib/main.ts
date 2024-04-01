import { Stack } from 'aws-cdk-lib';
import { Aws, CfnOutput, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Auth } from "./auth";
import { Analytics } from "./analytics";

export interface MainStackProps extends StackProps {
    openSearchDomainName: string;
    kinesisStreamName: string;
    flinkAppName: string;
    applicationName: string;
    userName: string;
    userEmail: string;

}

export class MainStack extends Stack {
    constructor(scope: Construct, id: string, props: MainStackProps) {
        super(scope, id, props);

        const authConstruct = new Auth(this, 'auth', {
            region: this.region,
            account: this.account,
            kinesisStreamName: props.kinesisStreamName,
            applicationName: props.applicationName,
            userEmail: props.userEmail,
            userName: props.userName
        });

        const analyticsConstruct = new Analytics(this, 'analytics', {
            openSearchDomainName: props.openSearchDomainName,
            kinesisStreamName: props.kinesisStreamName,
            region: this.region,
            account: this.account,
            flinkAppName: props.flinkAppName
        })

        const regionOutput = new CfnOutput(this, 'regionOutput', {
            value: Aws.REGION.toString()
        })

        const userPoolIdOutput = new CfnOutput(this, 'userPoolIdOutput', {
            value: authConstruct.userPool.userPoolId
        })

        const identityPoolIdOutput = new CfnOutput(this, 'identityPoolIdOutput', {
            value: authConstruct.identityPool.ref
        })

        const cognitoClientIdOutput = new CfnOutput(this, 'cognitoClientIdOutput', {
            value: authConstruct.userPoolClient.userPoolClientId
        })

        const cognitoClientSecretOutput = new CfnOutput(this, 'cognitoClientSecretOutput', {
            value: authConstruct.userPoolClientSecret as string
        })

        
        const domainEndpointHostOutput = new CfnOutput(this, 'domainEndpointHostOutput', {
            value: analyticsConstruct.domainEndpointHost
        })
        

        const bastionHostIdOutput = new CfnOutput(this, 'bastionHostIdOutput', {
            value: analyticsConstruct.bastionHostId
        })

        const accessOpenSearchClusterOutput = new CfnOutput(this, 'accessOpenSearchClusterOutput', {
            value:  `aws ssm start-session --target ${analyticsConstruct.bastionHostId} --document-name AWS-StartPortForwardingSessionToRemoteHost --parameters '{"portNumber":["443"],"localPortNumber":["8157"], "host":["${analyticsConstruct.domainEndpointHost}"]}'`
        }) 
    }
}
