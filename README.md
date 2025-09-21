# Full-Stack Application with Docker Compose

This project is a simple full-stack application that demonstrates how to containerize a Node.js backend, a Vue.js frontend, and a MongoDB database using Docker and Docker Compose. It provides a simple to-do list-style application, showcasing the power of containerization for creating portable, consistent, and scalable development environments.

## Architecture

The application is composed of three interconnected services, all managed by a single `docker-compose.yml` file:

* **`backend`**: A RESTful API built with Node.js, Express.js, and Mongoose. It handles API requests and interacts with the database.

* **`frontend`**: A simple web interface built with Vue.js that communicates with the backend API to display and add items.

* **`mongodb`**: A MongoDB database instance used to persist all application data.

## Prerequisites

Before running this application, you need to have the following installed on your machine:

* **Git**: For cloning the repository.
* **Docker Desktop** (or Docker Engine and Docker Compose standalone): Docker Compose is required to manage the multi-container application.

You do **not** need to install Node.js, Vue.js, or MongoDB directly on your machine, as they are all handled by Docker.

## Getting Started

1.  **Clone the repository**:

    ```
    git clone [https://github.com/srijonsbzsifat/Fullstack-Docker-App.git](https://github.com/srijonsbzsifat/Fullstack-Docker-App.git)
    cd Fullstack-Docker-App
    ```

2.  **Configure Environment Variables**:
    This project uses a `.env` file to manage environment variables, particularly for database credentials. Create a file named `.env` in the root directory of the project with the following content:

    ```
    # MongoDB Configuration
    MONGO_USERNAME=myuser
    MONGO_PASSWORD=mypassword
    MONGO_DATABASE=mydatabase
    ```

    These values are used by the `docker-compose.yml` file to configure the MongoDB and backend services.

3.  **Build and Run the Containers**:
    From the root directory of the project, run the following command. The `--build` flag ensures that the backend and frontend images are built from their respective Dockerfiles before the containers are started.

    ```
    docker compose up --build
    ```

    The first time you run this, Docker will download the necessary base images and build your application images, which may take a few minutes.

4.  **Access the Application**:
    Once all the services are up and running, you can access the frontend application in your web browser:

    * **Frontend**: `http://localhost:8080`
    * **Backend API**: `http://localhost:3000`

    You should see the application's interface and be able to add new items.

## Development

The `docker-compose.yml` file is configured for a convenient development workflow. It uses **bind mounts** to sync your local code changes with the containers, enabling live reloading.

* Changes you make to the files in `./backend` or `./frontend` will be reflected inside the running containers without needing to rebuild the images.
* You can stop the containers by pressing `Ctrl + C` in your terminal. To stop and remove all containers and the database volume, use:

    ```
    docker compose down -v
    ```

## Project Structure
```
.
├── backend/
│   ├── package.json
│   ├── server.js
│   └── ...
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   └── App.vue
│   └── ...
├── docker-compose.yml
├── .env
└── README.md
```

## Credits

This project was built as a demonstration of Docker and Docker Compose for full-stack application development.
