#!/bin/bash

# S3 Deployment Setup Script for GT Automotive
# This script helps set up S3 bucket and IAM permissions for deployment

set -e

echo "🚀 GT Automotive - S3 Deployment Setup"
echo "======================================"
echo ""

# Configuration
BUCKET_NAME="gt-automotives-deployments"
REGION="us-east-1"
IAM_POLICY_NAME="GTAutomotiveS3DeploymentPolicy"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if AWS CLI is configured
check_aws_config() {
    echo "Checking AWS CLI configuration..."
    if ! aws sts get-caller-identity &>/dev/null; then
        echo -e "${RED}❌ AWS CLI is not configured or credentials are invalid${NC}"
        echo "Please run: aws configure"
        exit 1
    fi
    echo -e "${GREEN}✅ AWS CLI configured${NC}"
    echo ""
}

# Function to create S3 bucket
create_s3_bucket() {
    echo "Checking S3 bucket: $BUCKET_NAME"
    
    if aws s3 ls "s3://$BUCKET_NAME" 2>/dev/null; then
        echo -e "${GREEN}✅ Bucket already exists: $BUCKET_NAME${NC}"
    else
        echo -e "${YELLOW}Creating S3 bucket: $BUCKET_NAME in region $REGION${NC}"
        if [ "$REGION" = "us-east-1" ]; then
            aws s3 mb "s3://$BUCKET_NAME"
        else
            aws s3api create-bucket \
                --bucket "$BUCKET_NAME" \
                --region "$REGION" \
                --create-bucket-configuration LocationConstraint="$REGION"
        fi
        echo -e "${GREEN}✅ Bucket created successfully${NC}"
    fi
    echo ""
}

# Function to set bucket versioning
enable_versioning() {
    echo "Enabling versioning on bucket..."
    aws s3api put-bucket-versioning \
        --bucket "$BUCKET_NAME" \
        --versioning-configuration Status=Enabled
    echo -e "${GREEN}✅ Versioning enabled${NC}"
    echo ""
}

# Function to get current AWS account info
get_account_info() {
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    AWS_USER_ARN=$(aws sts get-caller-identity --query Arn --output text)
    echo "AWS Account ID: $AWS_ACCOUNT_ID"
    echo "Current User/Role: $AWS_USER_ARN"
    echo ""
}

# Function to create IAM policy
create_iam_policy() {
    echo "Creating IAM policy for S3 deployment access..."
    
    # Create policy document
    cat > /tmp/gt-s3-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "ListBucket",
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket",
                "s3:GetBucketLocation",
                "s3:GetBucketVersioning"
            ],
            "Resource": "arn:aws:s3:::${BUCKET_NAME}"
        },
        {
            "Sid": "ReadWriteObjects",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject",
                "s3:GetObjectAcl",
                "s3:DeleteObject",
                "s3:GetObjectVersion"
            ],
            "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
        }
    ]
}
EOF

    # Check if policy already exists
    if aws iam get-policy --policy-arn "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/${IAM_POLICY_NAME}" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Policy already exists. Creating new version...${NC}"
        
        # Get the policy ARN
        POLICY_ARN="arn:aws:iam::${AWS_ACCOUNT_ID}:policy/${IAM_POLICY_NAME}"
        
        # Create new policy version
        aws iam create-policy-version \
            --policy-arn "$POLICY_ARN" \
            --policy-document file:///tmp/gt-s3-policy.json \
            --set-as-default
            
        echo -e "${GREEN}✅ Policy updated${NC}"
    else
        # Create new policy
        POLICY_ARN=$(aws iam create-policy \
            --policy-name "$IAM_POLICY_NAME" \
            --policy-document file:///tmp/gt-s3-policy.json \
            --description "Allows GT Automotive deployment to S3 bucket" \
            --query 'Policy.Arn' \
            --output text)
            
        echo -e "${GREEN}✅ Policy created: $POLICY_ARN${NC}"
    fi
    
    # Clean up
    rm /tmp/gt-s3-policy.json
    echo ""
}

# Function to attach policy to current user
attach_policy_to_user() {
    echo "Attempting to attach policy to current user..."
    
    # Extract username from ARN
    if [[ "$AWS_USER_ARN" == *":user/"* ]]; then
        USERNAME=$(echo "$AWS_USER_ARN" | sed 's/.*:user\///')
        
        echo "Attaching policy to user: $USERNAME"
        aws iam attach-user-policy \
            --user-name "$USERNAME" \
            --policy-arn "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/${IAM_POLICY_NAME}" 2>/dev/null || {
            echo -e "${YELLOW}⚠️  Could not attach policy automatically. You may need admin permissions.${NC}"
            echo "Please ask your AWS admin to attach this policy:"
            echo "Policy ARN: arn:aws:iam::${AWS_ACCOUNT_ID}:policy/${IAM_POLICY_NAME}"
        }
    else
        echo -e "${YELLOW}⚠️  You're using a role or root account. Policy attachment may require manual configuration.${NC}"
        echo "Policy ARN for manual attachment: arn:aws:iam::${AWS_ACCOUNT_ID}:policy/${IAM_POLICY_NAME}"
    fi
    echo ""
}

# Function to test S3 access
test_s3_access() {
    echo "Testing S3 access..."
    
    TEST_FILE="/tmp/test-deployment-$(date +%s).txt"
    echo "GT Automotive deployment test file" > "$TEST_FILE"
    
    echo "Uploading test file..."
    if aws s3 cp "$TEST_FILE" "s3://$BUCKET_NAME/test-deployment.txt"; then
        echo -e "${GREEN}✅ Upload successful${NC}"
        
        echo "Downloading test file..."
        if aws s3 cp "s3://$BUCKET_NAME/test-deployment.txt" "/tmp/test-download.txt"; then
            echo -e "${GREEN}✅ Download successful${NC}"
            
            echo "Cleaning up test file..."
            aws s3 rm "s3://$BUCKET_NAME/test-deployment.txt"
            echo -e "${GREEN}✅ Cleanup successful${NC}"
        else
            echo -e "${RED}❌ Download failed${NC}"
        fi
    else
        echo -e "${RED}❌ Upload failed - Check IAM permissions${NC}"
        echo ""
        echo "Troubleshooting steps:"
        echo "1. Ensure the IAM policy is attached to your user"
        echo "2. Wait a few seconds for IAM changes to propagate"
        echo "3. Try running this script again"
    fi
    
    # Clean up
    rm -f "$TEST_FILE" "/tmp/test-download.txt"
    echo ""
}

# Function to display GitHub secrets configuration
show_github_config() {
    echo "GitHub Secrets Configuration"
    echo "============================"
    echo "Add these secrets to your GitHub repository:"
    echo "(Settings → Secrets and variables → Actions → New repository secret)"
    echo ""
    echo -e "${YELLOW}AWS_ACCESS_KEY_ID:${NC}"
    aws sts get-caller-identity --query UserId --output text | cut -d: -f1
    echo "(Get this from your AWS IAM user security credentials)"
    echo ""
    echo -e "${YELLOW}AWS_SECRET_ACCESS_KEY:${NC}"
    echo "(Get this from your AWS IAM user security credentials)"
    echo ""
    echo -e "${YELLOW}AWS_REGION:${NC}"
    echo "$REGION"
    echo ""
    echo -e "${YELLOW}DEPLOYMENT_BUCKET:${NC}"
    echo "$BUCKET_NAME"
    echo ""
}

# Main execution
main() {
    echo "This script will set up S3 deployment for GT Automotive"
    echo ""
    
    check_aws_config
    get_account_info
    create_s3_bucket
    enable_versioning
    create_iam_policy
    attach_policy_to_user
    
    echo "Waiting for IAM changes to propagate..."
    sleep 5
    
    test_s3_access
    show_github_config
    
    echo -e "${GREEN}🎉 S3 deployment setup complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Ensure GitHub secrets are configured correctly"
    echo "2. Re-run your GitHub Actions workflow"
    echo ""
    echo "If you still see 'Access Denied' errors:"
    echo "- Ensure the IAM policy is attached to your IAM user"
    echo "- Check that your AWS credentials in GitHub match your IAM user"
    echo "- Verify the bucket name in GitHub secrets matches: $BUCKET_NAME"
}

# Run main function
main