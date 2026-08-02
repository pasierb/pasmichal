---
title: "🔑 How to handle secrets in AWS Codebuild"
description: "A guide to securely managing secrets in AWS CodeBuild pipelines."
pubDate: "2020-07-05"
heroImage: "../../assets/images/posts/aws-codebuild-secrets.png"
heroImageAlt: "Title card reading 'How to handle secrets in AWS Codebuild' over a pattern of AWS cube icons"
originalUrl: "https://pasmichal.medium.com/how-to-handle-secrets-in-aws-codebuild-6e1b96013712"
source: "Medium"
tags: ["aws", "codebuild", "devops", "webops"]
---

## Problem

You have a CodeBuild project that build you static site from headless CMS and you need the access token to call the API. You are smart enough to know that hardcoding it directly in source code is not a good idea.

- Where to store this token?
- How to make it available to CodeBuild project?
- How to protect it from people that should not have access to it?

## Environment variables

You could set secrets as environment variables directly in CodeBuild. This works but has couple downsides:

- anyone who has access to this build project can see environment variables for each build, i.e. read secrets
- anyone who has access to this build project can change environment variables, i.e. write secrets

## Secrets manager

AWS has a service to securely store passwords, tokens, credentials or any other sensitive data — [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/). Fortunately Secrets Manager integrates seamlessly with CodeBuild through a buildspec file.

Values from Secrets Manager can be mapped out to environment variables that will be available through all build project phases.

```yaml
env:
  secrets-manager:
    ENV_VARIABLE_NAME: secrets-name-or-arn:key
```

CodeBuild can also resolve secret-name-or-arn from environment variable passed to build projects itself, which come in very handy when working with IaC (Infrastructure as code) library, like [terraform](https://www.terraform.io/) or [aws-cdk](https://docs.aws.amazon.com/cdk/latest/guide/home.html).

```hcl
resource "aws_secretsmanager_secret" "secrets" {
  name = "some-name"
}
```

```hcl
resource "aws_codebuild_project" "build" {
  environment {
    environment_variable {
      name = "SECRETS_ID"
      value = "${aws_secretsmanager_secret.secrets.arn}"
    }
  }
}
```

Here is a sample buildspec file:

```yaml
version: 0.2
env:
  secrets-manager:
    NPM_REGISTRY_TOKEN: $SECRETS_ID:NPM_REGISTRY_TOKEN
    SUPER_SECRET_PASSWORD: arn:aws:secretsmanager:eu-west-1:123456789:secret:secrets-name:PASSWORD
    OTHER_SECRET_PASSWORD: secrets-name:OTHER_PASSWORD
phases:
  install:
    runtime-versions:
      nodejs: 10
    commands:
    - npm install
  build:
    commands:
    - npm run build
```

For more details about buildspec check [official documentation](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html#secrets-manager-build-spec).

**NOTE:** Of course IAM role associated with CodeBuild project has to have [sufficient permissions to access secrets](https://docs.aws.amazon.com/mediaconnect/latest/ug/iam-policy-examples-asm-secrets.html)
