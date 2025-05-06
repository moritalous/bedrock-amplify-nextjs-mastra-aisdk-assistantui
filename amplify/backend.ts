import { defineBackend } from '@aws-amplify/backend';
import { CfnApplicationInferenceProfile } from 'aws-cdk-lib/aws-bedrock';
import { ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
});

const authenticatedUserIamRole = backend.auth.resources.authenticatedUserIamRole;
authenticatedUserIamRole.addManagedPolicy(
  ManagedPolicy.fromAwsManagedPolicyName('AmazonBedrockFullAccess')
);

const unauthenticatedUserIamRole = backend.auth.resources.unauthenticatedUserIamRole;
unauthenticatedUserIamRole.addManagedPolicy(
  ManagedPolicy.fromAwsManagedPolicyName('AmazonBedrockFullAccess')
);

const bedrockResourceStack = backend.createStack('BedrockResource');

const inferenceProfile = new CfnApplicationInferenceProfile(bedrockResourceStack, 'BedrockModel', {
  inferenceProfileName: 'chat-app-inference-profile',
  modelSource: {
    copyFrom: `arn:aws:bedrock:${bedrockResourceStack.region}:${bedrockResourceStack.account}:inference-profile/us.amazon.nova-pro-v1:0`,
  },
});

backend.addOutput({
  custom: {
    inferenceProfileArn: inferenceProfile.attrInferenceProfileArn,
    inferenceProfileId: inferenceProfile.attrInferenceProfileId,
    inferenceProfileIdentifier: inferenceProfile.attrInferenceProfileIdentifier,
  },
});
