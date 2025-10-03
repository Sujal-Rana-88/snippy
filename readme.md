# Snippy ✂  
A simple code snippet shortener and sharer built with **Node.js**, **Express**, and **MongoDB**.  

---

## 🚀 Features
- Store code snippets with a unique short URL  
- Retrieve snippets by short URL  
- Automatic expiry after defined days  
- MongoDB backend for persistence  
- Structured logging with Winston  

---

## 📦 Installation & Setup (One Terminal)

### 1. Clone the repository
bash
git clone https://github.com/your-username/snippy.git
cd snippy
`

### 2. Install dependencies

bash
npm install


### 3. Set up environment variables

Create a `.env` file in the project root and add:

env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=snippy


---

### 4. Run MongoDB and Snippy in one terminal

If you already have **MongoDB installed locally**, you can use **concurrently** to start both together.

#### Install `concurrently`:

bash
npm install --save-dev concurrently


#### Add scripts to `package.json`:

json
"scripts": {
  "start": "node index.js",
  "dev": "concurrently \"mongod --dbpath ./data/db\" \"nodemon index.js\""
}


* `mongod --dbpath ./data/db` → starts MongoDB from local `./data/db` folder
* `nodemon index.js` → auto-restarts your server on changes

---

### 5. Start the project (development mode)

bash
npm run dev


This will spin up **MongoDB** and **Snippy server** in the **same terminal window**.

---

## 🛠 API Endpoints

### **POST /set**

Save a new code snippet.
**Request body:**

json
{ "code": "console.log('Hello, Snippy!');" }


**Response:**

json
{
  "message": "Your code has been saved successfully",
  "url": "http://localhost:5000/AbCdEfG"
}


### **GET /:url**

Retrieve a snippet by its short URL.

http
GET http://localhost:5000/AbCdEfG


**Response:**

json
{ "code": "console.log('Hello, Snippy!');" }
