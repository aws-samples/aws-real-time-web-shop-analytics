import { Construct } from "constructs";
import { Stream, StreamMode } from 'aws-cdk-lib/aws-kinesis';
import { CustomResource, Duration, RemovalPolicy } from "aws-cdk-lib";
import { PolicyStatement, CfnServiceLinkedRole, AnyPrincipal, Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";
import { IAMClient, ListRolesCommand } from "@aws-sdk/client-iam";
import { Domain, EngineVersion } from "aws-cdk-lib/aws-opensearchservice";
import { Vpc, SubnetType, SecurityGroup, Port, BastionHostLinux, MachineImage, BlockDeviceVolume, InterfaceVpcEndpoint, InterfaceVpcEndpointAwsService } from "aws-cdk-lib/aws-ec2";
import { join as pathJoin } from "path";
import { Runtime as LambdaRuntime, Code as LambdaCode, Function } from "aws-cdk-lib/aws-lambda";
import { LogStream, LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs"; 
import { Provider } from "aws-cdk-lib/custom-resources";
import { Peer, EbsDeviceVolumeType } from "aws-cdk-lib/aws-ec2";
import { CfnApplication, CfnApplicationCloudWatchLoggingOption} from "aws-cdk-lib/aws-kinesisanalyticsv2";
import { Asset } from "aws-cdk-lib/aws-s3-assets";



export interface AnalyticsProps {
    openSearchDomainName: string;
    kinesisStreamName: string;
    region: string;
    account: string;
    flinkAppName: string;
}

export class Analytics extends Construct {

    public readonly domainEndpointHost: string;
    public readonly bastionHostId: string;

    constructor(scope: Construct, id: string, props: AnalyticsProps) {
        super(scope, id);

        // Create bucket to upload flink application 
        const flinkAsset = new Asset(this, 'FlinkAsset', {
            path: pathJoin(__dirname, '../../flink-consumer/target/flink-cep-demo-0.1.jar'),
          });
        
        // Create a Kinesis Data Stream
        const stream = new Stream(this, 'KinesisStream', {
            streamMode: StreamMode.ON_DEMAND,
            streamName: props.kinesisStreamName
        });

        const logGroup = new LogGroup(this, 'LogGroup', {
            logGroupName: 'FlinkApplicationLogGroup',
            removalPolicy: RemovalPolicy.DESTROY,
            retention: RetentionDays.ONE_DAY
          });

        const logStream = new LogStream(this, 'LogStream', {
            logStreamName: 'FlinkApplicationLogStream',
            logGroup: logGroup,
            removalPolicy: RemovalPolicy.DESTROY,
        });
        
        logStream.node.addDependency(logGroup);

        // Create IAM role for kinesis data analytics application
        const flinkRole = new Role(this, "FlinkRole", {
            assumedBy: new ServicePrincipal("kinesisanalytics.amazonaws.com"),
        });

        var bucketArnString = `arn:aws:s3:::${flinkAsset.s3BucketName}`;

        const s3AccessPolicy = new PolicyStatement({
            actions: [
                "s3:GetObject",
                "s3:GetObjectVersion"
            ],
            resources: [`${bucketArnString}/${flinkAsset.s3ObjectKey}`]
        })

        flinkRole.addToPolicy(s3AccessPolicy)

        flinkRole.addToPolicy(new PolicyStatement({
            actions: [
                "kinesis:DescribeStream",
                "kinesis:GetShardIterator",
                "kinesis:Get*",
                "kinesis:PutRecord",
                "kinesis:PutRecords",
                "kinesis:ListShards"
            ],
            resources: [`arn:aws:kinesis:${props.region}:${props.account}:stream/${props.kinesisStreamName}`]

        }))

        flinkRole.addToPolicy(new PolicyStatement({
            actions: [
                "logs:DescribeLogGroups",
                "logs:DescribeLogStreams",
                "logs:PutLogEvents"
            ],
            resources: [logGroup.logGroupArn]

        }))

        flinkRole.addToPolicy(new PolicyStatement({
            actions: [
                "cloudwatch:PutMetricData",
            ],
            resources: ["*"]

        }))

        flinkRole.addToPolicy(new PolicyStatement({
            actions: [
                "ec2:DescribeVpcs",
                "ec2:DescribeSubnets",
                "ec2:DescribeSecurityGroups",
                "ec2:DescribeDhcpOptions"
            ],
            resources: ["*"]

        }))

        flinkRole.addToPolicy(new PolicyStatement({
            actions: [
                "ec2:CreateNetworkInterface",
                "ec2:CreateNetworkInterfacePermission",
                "ec2:DescribeNetworkInterfaces",
                "ec2:DeleteNetworkInterface"
            ],
            resources: ["*"]
        }))

  
        // Define networking components
        const vpc = new Vpc(this, "StreamingVPC", {
            maxAzs: 2,
            vpcName: "StreamingVPC",
            
        });

        // Security Group
        const bastionSecurityGroup = new SecurityGroup(
            this,
            "BastionSecurityGroup",
            {
            vpc: vpc,
            allowAllOutbound: false,
            securityGroupName: "BastionSecurityGroup",
            }
        );
            
        const opensearchSecurityGroup = new SecurityGroup(
            this,
            "OpensearchSecurityGroup",
            {
              vpc: vpc,
              allowAllOutbound:false,
              securityGroupName: "OpensearchSecurityGroup",
            }
        );

        const flinkSecurityGroup = new SecurityGroup(
            this,
            "FlinkSecurityGroup",
            {
            vpc: vpc,
            allowAllOutbound:true,
            securityGroupName: "FlinkSecurityGroup",
            }
        );

        const kinesisVpcEndpointSecurityGroup = new SecurityGroup(
            this,
            "KinesisVpcEndpointSecurityGroup",
            {
            vpc: vpc,
            allowAllOutbound:true,
            securityGroupName: "KinesisVpcEndpointSecurityGroup",
            }
        );

        bastionSecurityGroup.addEgressRule(Peer.anyIpv4(), Port.tcp(443));

        opensearchSecurityGroup.addIngressRule(bastionSecurityGroup, Port.tcp(443));
        opensearchSecurityGroup.addIngressRule(flinkSecurityGroup, Port.tcp(443));

        const iamClient = new IAMClient();

        // Service-linked role that Amazon OpenSearch Service will use
        (async () => {
          const response = await iamClient.send(
            new ListRolesCommand({
              PathPrefix: "/aws-service-role/opensearchservice.amazonaws.com/",
            })
          );
    
          // Only if the role for OpenSearch Service doesn't exist, it will be created.
          if (response.Roles && response.Roles?.length == 0) {
            new CfnServiceLinkedRole(this, "OpensearchServiceLinkedRole", {
              awsServiceName: "es.amazonaws.com",
            });
          }
        })();


        // Bastion host to access Opensearch Dashboards
        const bastionHost = new BastionHostLinux(this, "BastionHost", {
            vpc,
            securityGroup: bastionSecurityGroup,
            machineImage: MachineImage.latestAmazonLinux2023(),
            blockDevices: [
            {
                deviceName: "/dev/xvda",
                volume: BlockDeviceVolume.ebs(10, {
                encrypted: true,
                }),
            },
            ],
        });
        this.bastionHostId = bastionHost.instanceId;
        
        // OpenSearch domain
        const domain = new Domain(this, "Domain", {
                version: EngineVersion.OPENSEARCH_2_11,
                nodeToNodeEncryption: true,
                enforceHttps: true,
                domainName: props.openSearchDomainName,
                encryptionAtRest: {
                enabled: true,
            },
            vpc: vpc,
            capacity: {
                dataNodes: 2,
                masterNodes: 0, 
                dataNodeInstanceType: 'r6g.large.search',
                multiAzWithStandbyEnabled: false
            },
            ebs: {
                volumeSize: 30,
                volumeType: EbsDeviceVolumeType.GP3,
                throughput: 125,
                iops: 3000
              },
            removalPolicy: RemovalPolicy.DESTROY,
            zoneAwareness: {
                enabled: true,
            },
            securityGroups: [opensearchSecurityGroup],
            offPeakWindowEnabled: true
        });
        this.domainEndpointHost = domain.domainEndpoint;

        domain.addAccessPolicies(
            new PolicyStatement({
            principals: [new AnyPrincipal()],
            actions: ["es:ESHttp*"],
            resources: [domain.domainArn + "/*"],
            })
        );
        

        domain.grantReadWrite(flinkRole);

        const kinesisVpcEndpoint = new InterfaceVpcEndpoint(
            this, 
            "KinesisInterfaceEndpoint", {
                vpc: vpc,
                service: InterfaceVpcEndpointAwsService.KINESIS_STREAMS,
                subnets: { subnetType: SubnetType.PUBLIC },
                securityGroups: [kinesisVpcEndpointSecurityGroup]
            }
        )
        
        
        const flinkApplication = new CfnApplication(
            this,
            "FlinkApplication", {
                applicationConfiguration : {
                    applicationCodeConfiguration: {
                        codeContent: {
                            s3ContentLocation : {
                                bucketArn : bucketArnString,
                                fileKey : flinkAsset.s3ObjectKey
                            }
                        },
                        codeContentType: "ZIPFILE"
                    },
                    flinkApplicationConfiguration : {
                            checkpointConfiguration : {
                                configurationType: 'CUSTOM',
                                checkpointingEnabled: true,
                                checkpointInterval: 60000,
                            }
                    },
                    environmentProperties : {
                        propertyGroups: [
                            {
                                propertyGroupId : "FlinkApplicationProperties",
                                propertyMap : {
                                    'REGION': props.region,
                                    'INPUT_STREAM_NAME': props.kinesisStreamName,
                                    'OPEN_SEARCH_ENDPOINT': `https://${domain.domainEndpoint}`
                                }
                            }
                        ]
                    },
                    vpcConfigurations : [
                        {
                            subnetIds: vpc.selectSubnets({
                                subnetType: SubnetType.PRIVATE_WITH_EGRESS,
                              }).subnetIds,
                            securityGroupIds: [flinkSecurityGroup.securityGroupId],
                          },
                    ]
                },
                applicationName : props.flinkAppName, 
                runtimeEnvironment : "FLINK-1_18",
                serviceExecutionRole : flinkRole.roleArn,
            }
        );

        flinkApplication.node.addDependency(flinkAsset);
        flinkApplication.node.addDependency(flinkRole);
        flinkApplication.node.addDependency(domain); 

        const startFlinkApplicationHandler = new Function(this, 'startFlinkApplicationHandler', {
            runtime: LambdaRuntime.PYTHON_3_11,
            code: LambdaCode.fromAsset(pathJoin(__dirname, '../customResources/startFlinkApplication')),
            handler: 'index.on_event',
            timeout: Duration.minutes(14),
            memorySize: 512
        })

        const startFlinkApplicationProvider = new Provider(this, 'startFlinkApplicationProvider', {
            onEventHandler: startFlinkApplicationHandler,
            logRetention: RetentionDays.ONE_WEEK
        })
        
        startFlinkApplicationHandler.addToRolePolicy(new PolicyStatement({
            actions: [
                'kinesisanalytics:DescribeApplication',
                'kinesisanalytics:StartApplication',
                'kinesisanalytics:StopApplication',

            ],
            resources: [`arn:aws:kinesisanalytics:${props.region}:${props.account}:application/${props.flinkAppName}`]
        }))

        const startFlinkApplicationResource = new CustomResource(this, 'startFlinkApplicationResource', {
            serviceToken: startFlinkApplicationProvider.serviceToken,
            properties: {
                AppName: props.flinkAppName,
            }
        })

        startFlinkApplicationResource.node.addDependency(flinkApplication);



    }
}
