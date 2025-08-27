# GitHub Secrets Setup Guide for AWS Lightsail Deployment

This guide helps you configure GitHub secrets for automated deployment to AWS Lightsail.

## 📋 Prerequisites

1. AWS Account with Lightsail instance created
2. GitHub repository access (Settings permissions)
3. AWS IAM user with appropriate permissions
4. Your Lightsail instance SSH key

## 🔐 GitHub Secrets Configuration

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### 1. AWS Credentials

#### AWS_ACCESS_KEY_ID
```
Name: AWS_ACCESS_KEY_ID
Value: AKIA[your-access-key-id]
```

**How to get it:**
1. Go to AWS Console → IAM → Users
2. Create new user or select existing
3. Go to Security credentials → Create access key
4. Copy the Access key ID

#### AWS_SECRET_ACCESS_KEY
```
Name: AWS_SECRET_ACCESS_KEY  
Value: [your-secret-access-key]
```

**How to get it:**
1. From the same screen when creating access key
2. Copy the Secret access key (shown only once!)

#### AWS_REGION
```
Name: AWS_REGION
Value: us-east-1
```
(Or your specific region like: us-west-2, eu-west-1, etc.)

### 2. Lightsail Configuration

#### LIGHTSAIL_INSTANCE_NAME
```
Name: LIGHTSAIL_INSTANCE_NAME
Value: GT-Automotive-Production
```

**How to find it:**
1. Go to AWS Lightsail Console
2. Your instance name is shown on the instances page

#### LIGHTSAIL_IP
```
Name: LIGHTSAIL_IP
Value: [your.instance.ip.address]
```

**How to find it:**
1. Go to AWS Lightsail Console
2. Click on your instance
3. Copy the Public IP address

#### LIGHTSAIL_SSH_KEY
```
Name: LIGHTSAIL_SSH_KEY
Value: [Complete SSH private key including headers]
```

**Format:**
```
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA...
[multiple lines of key content]
...
-----END RSA PRIVATE KEY-----
```

**How to get it:**
1. Find your Lightsail SSH key file (usually `.pem` file)
2. Open with text editor: `cat ~/path-to-your-key.pem`
3. Copy entire content including BEGIN and END lines

### 3. Domain Configuration

#### FRONTEND_DOMAIN
```
Name: FRONTEND_DOMAIN
Value: gtautomotive.com
```
(Or your actual domain)

#### BACKEND_DOMAIN
```
Name: BACKEND_DOMAIN
Value: api.gtautomotive.com
```
(Or same as frontend if using same domain with /api path)

### 4. S3 Deployment Bucket

#### DEPLOYMENT_BUCKET
```
Name: DEPLOYMENT_BUCKET
Value: gt-automotive-deployments
```

**How to create S3 bucket:**
```bash
aws s3 mb s3://gt-automotive-deployments --region us-east-1
```

Or via AWS Console:
1. Go to S3 → Create bucket
2. Name: `gt-automotive-deployments`
3. Region: Same as your Lightsail
4. Keep default settings
5. Create bucket

## 🔍 Verification Checklist

After adding all secrets, verify you have:

- [ ] AWS_ACCESS_KEY_ID
- [ ] AWS_SECRET_ACCESS_KEY  
- [ ] AWS_REGION
- [ ] LIGHTSAIL_INSTANCE_NAME
- [ ] LIGHTSAIL_IP
- [ ] LIGHTSAIL_SSH_KEY
- [ ] FRONTEND_DOMAIN
- [ ] BACKEND_DOMAIN
- [ ] DEPLOYMENT_BUCKET

## 🚨 Security Best Practices

1. **Never commit secrets to code**
2. **Rotate AWS access keys regularly**
3. **Use minimal IAM permissions**
4. **Keep SSH keys secure**
5. **Use different secrets for staging/production**

## 📝 IAM Policy for GitHub Actions

Create an IAM user with this minimal policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "lightsail:GetInstance",
                "lightsail:GetInstances",
                "lightsail:PutInstanceState",
                "lightsail:GetInstanceAccessDetails"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::gt-automotive-deployments",
                "arn:aws:s3:::gt-automotive-deployments/*"
            ]
        }
    ]
}
```

## 🔧 Testing Your Secrets

After setting up all secrets:

1. Go to Actions tab in GitHub
2. Find "Deploy to AWS Lightsail" workflow
3. Click "Run workflow"
4. Select test deployment options
5. Monitor the logs for any authentication errors

## 🆘 Common Issues

### "Bad credentials" error
- Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are correct
- Check IAM user has necessary permissions

### "Instance not found" error
- Verify LIGHTSAIL_INSTANCE_NAME matches exactly
- Check AWS_REGION is correct

### "Permission denied (publickey)" error
- Verify LIGHTSAIL_SSH_KEY includes full key with headers
- Check key format (no extra spaces or line breaks)

### "S3 bucket not found" error
- Verify DEPLOYMENT_BUCKET exists
- Check bucket is in same region as specified

---

**Last Updated**: August 27, 2025