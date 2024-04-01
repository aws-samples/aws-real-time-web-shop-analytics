import { Construct } from 'constructs';
import { CfnIdentityPool,CfnIdentityPoolRoleAttachment } from 'aws-cdk-lib/aws-cognito';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';


export interface AuthProps {
    region: string;
    account: string;
    kinesisStreamName: string;
    applicationName: string;
    userEmail: string;
    userName: string;
}

export class Auth extends Construct {

    public readonly identityPool: CfnIdentityPool;
    public readonly userPool: cognito.UserPool;
    public readonly userPoolClient: cognito.UserPoolClient;
    public readonly userPoolClientSecret: String;

    constructor(scope: Construct, id: string, props: AuthProps) {
        super(scope, id);

        // Create Cognito UserPool 
        this.userPool = new cognito.UserPool(this, `userpool`, {
            selfSignUpEnabled: false,
            removalPolicy: RemovalPolicy.DESTROY,
            userInvitation: {
                emailSubject: `Welcome to ${props.applicationName}`,
                emailBody: `
                <p>
                    Please use the credentials below to login to ${props.applicationName} .
                </p>
                <p>
                    Username: <strong>{username}</strong>
                </p>
                <p>
                    Password: <strong>{####}</strong>
                </p>
                <p>
                    Login: <strong>http://localhost:3000</p>
                `,
                smsMessage: 'Your username is {username} and temporary password is {####}.'
            },
            autoVerify: {
                email: true
            },
            signInAliases: {
                email: true,
                username: true
            },
            standardAttributes: {
                email: {
                    required: true
                }
            },
        })

        // Automatically create default Cognito User 
        const user = new cognito.CfnUserPoolUser(this, 'cognitoUser', {
            userPoolId: this.userPool.userPoolId,
            username: props.userName,
            desiredDeliveryMediums: ['EMAIL'],
            userAttributes: [
                {name: 'email', value: props.userEmail},
                {name: 'email_verified', value: 'true'}
            ],
        })

        // Add client to UserPool 
        this.userPoolClient = this.userPool.addClient(`userpoolClient`, {
            oAuth: {
                callbackUrls: ['http://localhost:3000/api/auth/callback/cognito'],
                logoutUrls: ['http://localhost:3000/'],
                flows: {
                    implicitCodeGrant: true,
                    authorizationCodeGrant: true,
                },
                scopes: [
                    cognito.OAuthScope.EMAIL,
                    cognito.OAuthScope.OPENID,
                    cognito.OAuthScope.PROFILE
                ]
            },
            supportedIdentityProviders: [cognito.UserPoolClientIdentityProvider.COGNITO],
            userPoolClientName: `${props.applicationName.replace(/\s/g, '').toLowerCase()}`,
            generateSecret: true,
            idTokenValidity: Duration.days(1)
        })

        this.userPoolClientSecret = this.userPoolClient.userPoolClientSecret.unsafeUnwrap();

        this.userPool.addDomain('domain', {
            cognitoDomain: {
                domainPrefix: `${props.applicationName.replace(/\s/g, '').toLowerCase()}`
            }
        })

        this.identityPool = new CfnIdentityPool(this, 'MyCognitoIdentityPool', {
            allowUnauthenticatedIdentities: true,
            cognitoIdentityProviders: [{
                clientId: this.userPoolClient.userPoolClientId,
                providerName: this.userPool.userPoolProviderName,
            }]

        });

        const authenticatedRole = new iam.Role(this, 'authenticatedCognitoRole', {
            assumedBy: new iam.FederatedPrincipal('cognito-identity.amazonaws.com', {
                "StringEquals": { "cognito-identity.amazonaws.com:aud": this.identityPool.ref },
                "ForAnyValue:StringLike": { "cognito-identity.amazonaws.com:amr": "authenticated" },
            }, "sts:AssumeRoleWithWebIdentity"),
        });
        
        authenticatedRole.addToPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                "kinesis:DescribeStream",
                "kinesis:DescribeStreamSummary",
                "kinesis:DescribeStreamConsumer",
                "kinesis:SubscribeToShard",
                "kinesis:RegisterStreamConsumer",
                "kinesis:PutRecord",
            ],
            resources: [`arn:aws:kinesis:${props.region}:${props.account}:stream/${props.kinesisStreamName}`]
        }));

        const identityPoolRoleAttachment = new CfnIdentityPoolRoleAttachment(this, 'IdentityPoolRoleAttachment', {
            identityPoolId: this.identityPool.ref,
            roles: {
                authenticated: authenticatedRole.roleArn
            },
        });

    } 
}