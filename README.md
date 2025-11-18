🌱 Gardening Assistant (Node.js, MongoDB, AWS, Python)

A full-stack gardening application that helps users track optimal planting and harvesting windows across USDA zones. Includes user authentication, zone-specific planting data, and automated data scraping.

🚀 Features

🌎 USDA zone–based planting calendars

🔐 User authentication & sessions (Passport.js)

🧪 REST API backend with Express

🗄️ MongoDB data models with clean service-layer separation

🤖 Automated planting-date scraper built in Python

☁️ Deployed on AWS EC2 with NGINX reverse proxy

🎨 EJS templated front-end


🧱 Tech Stack

Backend: Node.js, Express, MongoDB
Auth: Passport.js
Data Pipeline: Python, requests, BeautifulSoup
Deployment: AWS EC2, PM2, NGINX
Frontend: EJS + vanilla JS

As of right now, the application is currently deployed on AWS to http://54.198.47.151/

This repo also includes a version of a webscraper I made to get this data used for the project from almanac.com called almanacWebScraper.py, as well as the design artifacts created during the planning stages of this application
