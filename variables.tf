variable "cloudflare_account_id" {
  description = "Cloudflare account identifier"
  type        = string
}

variable "cloudflare_admin_api_token" {
  description = "Existing Cloudflare API token used to provision the new app token and KV namespace"
  type        = string
  sensitive   = true
}
