# Deployment Guide

## AWS Deployment via GitHub Actions

The backend automatically deploys to AWS ECS when changes are pushed to the `develop` branch. Deployment reads infrastructure values (ECR URL, ECS cluster/service names) from AWS Systems Manager Parameter Store, so you do not need to update GitHub config when infra changes.

### Required GitHub Configuration

Configure the following in your GitHub repository: **Settings** → **Secrets and variables** → **Actions**.

#### Secrets (sensitive)
- `AWS_ACCESS_KEY_ID` – AWS access key ID for the IAM user used by the workflow
- `AWS_SECRET_ACCESS_KEY` – AWS secret access key

#### Variables (non-sensitive)
- `AWS_REGION` – AWS region (e.g. `us-east-1`)
- `SSM_PREFIX` – Parameter Store path prefix, must match Terraform’s `local.name_prefix` with a leading slash (e.g. `/minikino-production`). With default `project_name` and `environment` in `terraform.tfvars`, use `/minikino-production`.

### Where SSM Values Come From

ECR repository URL, ECS cluster name, and ECS service name are **not** set in GitHub. The workflow reads them from SSM at runtime. Terraform (in `minikino-terraform-aws`) writes these parameters when you run `terraform apply`:

- `{SSM_PREFIX}/ecr-repository-url`
- `{SSM_PREFIX}/ecs-cluster-name`
- `{SSM_PREFIX}/ecs-service-name`

Ensure infra has been applied at least once so these parameters exist. If you change `project_name` or `environment` in Terraform, set `SSM_PREFIX` in GitHub Variables to match (e.g. `/minikino-staging`).

### Deployment Process

1. **Automatic:** Push changes to the `develop` branch; the workflow runs and deploys.
2. **Manual:** Go to **Actions** → **Deploy to AWS** → **Run workflow**, choose the branch, and run.

### Docker Image Tagging

Each deployment creates two image tags in ECR:
- `:latest` – most recent deployment
- `:${git-sha}` – commit SHA for versioning and rollbacks

### Timeline

- Build & push: ~3–5 minutes  
- ECS service update: ~2–3 minutes  
- **Total:** ~5–8 minutes

### Troubleshooting

**Deployment fails with authentication error**
- Check that `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set in GitHub Secrets.
- Ensure the IAM user has permissions for ECR (push), ECS (update-service), and SSM (GetParameter on the `SSM_PREFIX` path).

**Parameter not found / SSM errors**
- Run `terraform apply` in `minikino-terraform-aws` so the deployment SSM parameters exist.
- Confirm `SSM_PREFIX` in GitHub Variables matches your Terraform `local.name_prefix` with a leading slash (e.g. `/minikino-production`).

**ECS service update fails**
- Confirm the ECS cluster and service exist and are running.
- Check that the IAM user has `ecs:UpdateService` (and related ECS permissions).

**Docker build fails**
- Check `node.Dockerfile` and that all required files are committed.
