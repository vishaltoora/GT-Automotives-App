#!/bin/bash

# Check for Lightsail instances in common regions
echo "Checking for Lightsail instances across regions..."
echo "============================================="

# List of common AWS regions where Lightsail is available
REGIONS=(
    "us-east-1"       # N. Virginia
    "us-east-2"       # Ohio
    "us-west-2"       # Oregon
    "ca-central-1"    # Canada
    "eu-west-1"       # Ireland
    "eu-west-2"       # London
    "eu-west-3"       # Paris
    "eu-central-1"    # Frankfurt
    "ap-south-1"      # Mumbai
    "ap-southeast-1"  # Singapore
    "ap-southeast-2"  # Sydney
    "ap-northeast-1"  # Tokyo
    "ap-northeast-2"  # Seoul
)

for region in "${REGIONS[@]}"; do
    echo ""
    echo "Checking region: $region"
    instances=$(aws lightsail get-instances --region $region --query 'instances[].name' --output text 2>/dev/null)
    
    if [ $? -eq 0 ] && [ ! -z "$instances" ]; then
        echo "✅ Found instances in $region:"
        echo "   $instances"
        
        # Get more details about the instance
        for instance in $instances; do
            echo ""
            echo "   Instance details for '$instance':"
            aws lightsail get-instance --instance-name $instance --region $region \
                --query '{Name:name,State:state.name,PublicIP:publicIpAddress,Region:location.regionName}' \
                --output table 2>/dev/null
        done
    fi
done

echo ""
echo "============================================="
echo "Search complete!"
echo ""
echo "Make sure your GitHub secrets match:"
echo "- LIGHTSAIL_INSTANCE_NAME: [instance name from above]"
echo "- AWS_REGION: [region where instance was found]"
echo "- LIGHTSAIL_IP: [public IP address]"