variable "aws_region" {
  default = "ap-south-1"
}

variable "db_password" {
  description = "RDS Root Password"
  sensitive   = true
}

variable "key_name" {
  description = "AWS SSH Key Name"
  default     = "smartcart-key"
}
