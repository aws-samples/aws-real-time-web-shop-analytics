#!/usr/bin/env node

/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { App }from 'aws-cdk-lib';
import { MainStack } from '../lib/main';

const app = new App();
;

const stack = new MainStack(app, 'WebAnalyticsStack', {
    openSearchDomainName: 'opensearch-web-analytics',
    kinesisStreamName: 'kinesis-web-analytics-stream',
    flinkAppName: 'flink-web-analytics-application',
    applicationName: 'web-analytics-demo', 
    userName: 'user', // Change as required
    userEmail: 'user@example.com', // Change as required
});

