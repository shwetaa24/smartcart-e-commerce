# 1. AWS Provider Configuration
provider "aws" {
  region = var.aws_region
}

# 2. Get Default VPC
data "aws_vpc" "default" {
  default = true
}

# 3. Create two subnets in different AZs to satisfy RDS requirements
resource "aws_subnet" "subnet_a" {
  vpc_id            = data.aws_vpc.default.id
  cidr_block        = "172.31.100.0/24" 
  availability_zone = "ap-south-1a"
  tags = { Name = "SmartCart-Subnet-A" }
}

resource "aws_subnet" "subnet_b" {
  vpc_id            = data.aws_vpc.default.id
  cidr_block        = "172.31.101.0/24"
  availability_zone = "ap-south-1b"
  tags = { Name = "SmartCart-Subnet-B" }
}

# Group these subnets for the Database
resource "aws_db_subnet_group" "database" {
  name       = "smartcart-db-group-final-v2" # Added suffix to avoid conflicts
  subnet_ids = [aws_subnet.subnet_a.id, aws_subnet.subnet_b.id]

  tags = {
    Name = "SmartCart-DB-Subnet-Group"
  }
}

# 4. Get the latest Ubuntu 22.04 AMI ID dynamically
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# 5. Security Group for the EC2 App Server
resource "aws_security_group" "app_sg" {
  name        = "smartcart-app-sg-v2" # Added suffix to avoid conflicts
  description = "Allow SSH, HTTP, and Backend"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 5001
    to_port     = 5001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 6. Security Group for the RDS Database
resource "aws_security_group" "db_sg" {
  name        = "smartcart-db-sg-v2" # Added suffix to avoid conflicts
  description = "Allow PostgreSQL access from App Server only"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app_sg.id]
  }
}

# 7. EC2 Instance for the Application
resource "aws_instance" "app_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t2.micro"
  key_name               = var.key_name
  subnet_id              = aws_subnet.subnet_a.id
  vpc_security_group_ids = [aws_security_group.app_sg.id]
  associate_public_ip_address = true

  user_data = <<-EOF
              #!/bin/bash
              sudo apt-get update
              sudo apt-get install -y docker.io docker-compose
              sudo systemctl start docker
              sudo usermod -aG docker ubuntu
              EOF

  tags = {
    Name = "SmartCart-AppServer"
  }
}

# 8. RDS Managed PostgreSQL Database
resource "aws_db_instance" "database" {
  identifier           = "smartcart-db-v2" # Added suffix
  allocated_storage    = 20
  engine               = "postgres"
  engine_version       = "15"
  instance_class       = "db.t3.micro"
  db_name              = "smartcartdb"
  username             = "postgres"
  password             = var.db_password
  db_subnet_group_name = aws_db_subnet_group.database.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  skip_final_snapshot  = true
  publicly_accessible  = false
}

# 9. Outputs
output "ec2_public_ip" {
  value = aws_instance.app_server.public_ip
}

output "rds_endpoint" {
  value = aws_db_instance.database.endpoint
}
