const fs = require('fs');

const outuput = JSON.parse(fs.readFileSync('../cdk/output.json', 'utf8'));

const stackOutput = outuput[`${Object.keys(outuput)[0]}`]

const envFile=`NEXT_PUBLIC_IDENTITY_POOL_ID=${stackOutput.identityPoolIdOutput}
REGION=${stackOutput.regionOutput}
NEXT_PUBLIC_REGION=${stackOutput.regionOutput}
NEXT_PUBLIC_USER_POOL_ID=${stackOutput.userPoolIdOutput}
NEXTAUTH_URL=http://localhost:3000/
COGNITO_CLIENT_ID=${stackOutput.cognitoClientIdOutput}
COGNITO_CLIENT_SECRET=${stackOutput.cognitoClientSecretOutput}
COGNITO_ISSUER=https://cognito-idp.${stackOutput.regionOutput}.amazonaws.com/${stackOutput.userPoolIdOutput}`

fs.writeFile('../frontend/.env.local', envFile, err => {
    if (err) {
        console.error(err);
    }
});