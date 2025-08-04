#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Constants
DB_VOLUME="./uoapp-db"
PROJECT_NAME="uoapp-backend"
DOCKER_HUB_USER="mnxonline"
DB_VOLUME_PRE_PROD="./uoapp-db-pre-production"

# Function to show the menu
show_menu() {
   echo -e "${CYAN}Select an option:${NC}"
    echo -e "${YELLOW}1)${NC} Start the application"
    echo -e "${YELLOW}2)${NC} Docker restart (development)"
    echo -e "${YELLOW}3)${NC} Docker restart (pre-production)"
    echo -e "${YELLOW}4)${NC} Generate NestJS resource"
    echo -e "${YELLOW}5)${NC} Run tests"
    echo -e "${YELLOW}6)${NC} Run linter"
    echo -e "${YELLOW}7)${NC} Build Docker image"
    echo -e "${YELLOW}8)${NC} Push existing Docker image to DockerHub"
    echo -e "${YELLOW}9)${NC} Add new environment variable"
    echo -e "${YELLOW}0)${NC} Exit"
    echo -e "${CYAN}---------------------------------${NC}"
}

# Function to start the application
start_application() {
    echo -e "${CYAN}---------------------------------${NC}"
    echo -e "${GREEN}Starting the application with 'npm run dev'...${NC}"
    echo -e "${CYAN}---------------------------------${NC}"
    npm run start:dev
}

# Function to generate a NestJS resource
generate_resource() {
    echo -e "${CYAN}---------------------------------${NC}"
    read -p "Enter the resource name: " resource_name
   
    echo -e "${GREEN}Generating NestJS resource '$resource_name'...${NC}"
    nest generate resource $resource_name 
    echo -e "${CYAN}---------------------------------${NC}"
}

# Function to restart Docker containers (development)
restart_docker() {
    echo -e "${CYAN}---------------------------------${NC}"
    read -p "Do you want to remove the volumes as well? (y/n): " remove_volumes
    if [ "$remove_volumes" == "y" ] || [ "$remove_volumes" == "Y" ]; then
        echo -e "${GREEN}Restarting Docker containers and removing volumes...${NC}"
        if [ -d "$DB_VOLUME" ]; then
            echo -e "${GREEN}Removing the database volume...${NC}"
            sudo rm -r "$DB_VOLUME"    
        fi
    docker compose -f docker-compose.dev.yml --env-file .development.env down -v && docker compose -f docker-compose.dev.yml --env-file .development.env up
    else
        echo -e "${GREEN}Restarting Docker containers without removing volumes...${NC}"
        docker compose -f docker-compose.dev.yml --env-file .development.env down && docker compose -f docker-compose.dev.yml --env-file .development.env up
    fi
    echo -e "${CYAN}---------------------------------${NC}"
}

# Function to restart Docker containers (pre-production)
restart_docker_pre_prod() {
    echo -e "${CYAN}---------------------------------${NC}"
    read -p "Do you want to remove the volumes as well? (y/n): " remove_volumes
    if [ "$remove_volumes" == "y" ] || [ "$remove_volumes" == "Y" ]; then
        echo -e "${GREEN}Restarting Docker containers and removing volumes...${NC}"
        if [ -d "$DB_VOLUME_PRE_PROD" ]; then
            echo -e "${GREEN}Removing the database volume...${NC}"
            sudo rm -r "$DB_VOLUME_PRE_PROD"    
        fi
    docker compose -f docker-compose.pre-production.yml --env-file .pre-production.env down -v && docker compose -f docker-compose.pre-production.yml --env-file .pre-production.env up
    else
        echo -e "${GREEN}Restarting Docker containers without removing volumes...${NC}"
        docker compose -f docker-compose.pre-production.yml --env-file .pre-production.env down && docker compose -f docker-compose.pre-production.yml --env-file .pre-production.env up
    fi
    echo -e "${CYAN}---------------------------------${NC}"
}


# Function to stop and remove all Docker containers
top_remove_docker() {
    echo -e "${CYAN}---------------------------------${NC}"
    read -p "Do you want to remove the volumes as well? (y/n): " remove_volumes
    echo -e "${GREEN}Stopping all Docker containers...${NC}"
    docker stop $(docker ps -a -q)
    if [ "$remove_volumes" == "y" ] || [ "$remove_volumes" == "Y" ]; then
        echo -e "${GREEN}Removing all Docker containers and volumes...${NC}"
        docker rm $(docker ps -a -q) -v
    else
        echo -e "${GREEN}Removing all Docker containers...${NC}"
        docker rm $(docker ps -a -q)
    fi
    echo -e "${CYAN}---------------------------------${NC}"
}

# Function to run tests
run_tests() {
    echo -e "${CYAN}---------------------------------${NC}"
    echo -e "${GREEN}Running tests with 'npm run test'...${NC}"
    echo -e "${CYAN}---------------------------------${NC}"
    npm run test
}

# Function to run linter
run_linter() {
    echo -e "${CYAN}---------------------------------${NC}"
    echo -e "${GREEN}Running linter with 'npm run lint'...${NC}"
    echo -e "${CYAN}---------------------------------${NC}"
    npm run lint
}

# Function to build a Docker image
build_docker_image() {
    echo -e "${CYAN}---------------------------------${NC}"
    # read -p "Enter the image name: " image_name
    read -p "Enter the tag (default is 'latest'): " tag
    tag=${tag:-latest} # Set default tag to 'latest' if not provided

    echo -e "${GREEN}Building Docker image '$PROJECT_NAME:$tag'...${NC}"
    docker build -t "$PROJECT_NAME:$tag" .

    # Ask if user wants to push to Docker Hub
    read -p "Do you want to push this image to Docker Hub? (y/n): " push_image
    if [[ "$push_image" == "y" || "$push_image" == "Y" ]]; then
        # Ask for Docker Hub username and repository
        # read -p "Enter your Docker Hub username: " dockerhub_user
        # read -p "Enter your Docker Hub repository name: " dockerhub_repo

        # Format full repository name
        full_repo="$DOCKER_HUB_USER/$PROJECT_NAME"

        # Tag the image for Docker Hub
        docker tag "$PROJECT_NAME:$tag" "$full_repo:$tag"
        
        echo -e "${GREEN}Pushing image to Docker Hub as '$full_repo:$tag'...${NC}"
        docker push "$full_repo:$tag"
        
        echo -e "${CYAN}Docker image pushed successfully!${NC}"
    else
        echo -e "${CYAN}Skipping Docker Hub push.${NC}"
    fi

    echo -e "${CYAN}---------------------------------${NC}"
}

push_existing_image() {
    echo -e "${CYAN}---------------------------------${NC}"
    
    # Ask for image details
    read -p "Enter the name of the existing Docker image: " image_name
    read -p "Enter the tag (default is 'latest'): " tag
    tag=${tag:-latest} # Default to 'latest' if not provided

    # Ask for Docker Hub details
    read -p "Enter your Docker Hub username: " dockerhub_user
    read -p "Enter your Docker Hub repository name: " dockerhub_repo

    # Format full repository name
    full_repo="$dockerhub_user/$dockerhub_repo"

    # Tag the existing image for Docker Hub
    docker tag "$image_name:$tag" "$full_repo:$tag"

    # Push the image to Docker Hub
    echo -e "${GREEN}Pushing image '$image_name:$tag' to Docker Hub as '$full_repo:$tag'...${NC}"
    docker push "$full_repo:$tag"
    
    echo -e "${CYAN}Docker image pushed successfully!${NC}"
    echo -e "${CYAN}---------------------------------${NC}"
}

# Function to add a new environment variable
add_env_variable() {
    echo -e "${CYAN}---------------------------------${NC}"
    read -p "Enter the name of the new environment variable: " new_var

    if [ -z "$new_var" ]; then
        echo -e "${RED}Variable name cannot be empty.${NC}"
        return
    fi

    echo -e "${GREEN}Adding '$new_var' to .example.env ...${NC}"
    echo -e "\n$new_var=" >> .example.env

    echo -e "${GREEN}Adding '$new_var' to env.validation.ts...${NC}"
    sed -i "/\/\/ End of the validationSchema/i \ \ \ \ $new_var: required()," src/config/environment/validation/validation-schema.ts
    
    read -p "Enter the value for '$new_var': " new_value

    echo -e "${GREEN}Adding '$new_var=$new_value' to .development.env...${NC}"
    echo -e "$new_var=$new_value" >> .development.env

    echo -e "${CYAN}Variable added successfully.${NC}"
    echo -e "${CYAN}---------------------------------${NC}"
}

# Function to exit the script
exit_script() {
    echo -e "${CYAN}---------------------------------${NC}"
    echo -e "${MAGENTA}Exiting...${NC}"
    echo -e "${CYAN}---------------------------------${NC}"
    exit 0
}

# Show the menu and read the user's option
while true; do
    show_menu
    read -p "Enter an option: " choice
    case $choice in
        1)
            start_application
            ;;
        2)
            restart_docker
            ;;
        3)
            generate_resource
            ;;
        4)
            restart_docker
            ;;
        5)
            run_tests
            ;;
        6)
            run_linter
            ;;
        7) 
            add_env_variable
            ;;
        8)
            exit_script
            ;;
        *)
            echo -e "${RED}Invalid option. Please try again.${NC}"
            echo -e "${CYAN}---------------------------------${NC}"
            ;;
    esac
done
