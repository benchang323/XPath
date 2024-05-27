# Use the official Python image as a base
FROM --platform=linux/amd64 python:3.10.11

# Set the working directory inside the container
WORKDIR /django_server

# Install dependencies required for Chrome and build processes
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    build-essential \
    wget \
    gnupg \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# install google chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
RUN apt-get -y update
RUN apt-get install -y google-chrome-stable
# install chromedriver
RUN apt-get install -yqq unzip
RUN wget -O /tmp/chromedriver.zip http://chromedriver.storage.googleapis.com/`curl -sS chromedriver.storage.googleapis.com/LATEST_RELEASE`/chromedriver_linux64.zip
RUN unzip /tmp/chromedriver.zip chromedriver -d /usr/local/bin/
RUN python3 --version
RUN pip3 --version
RUN pip install --no-cache-dir --upgrade pip

# Copy the dependencies file to the working directory
COPY requirements.txt .

# Install Django and other dependencies
RUN pip install -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port where your Django frontend runs
EXPOSE 8000
