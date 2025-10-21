# Backend Wizards — Stage 1: String Analyzer API

Welcome to **Stage 1** of Backend Wizards! This project is a RESTful API service that analyzes strings and stores their computed properties.

---

## Table of Contents

- [Features](#features)  
- [Installation](#installation)  
- [Usage](#usage)  
- [API Endpoints](#api-endpoints)  
- [Dependencies](#dependencies)  
- [Environment Variables](#environment-variables)  
- [Notes](#notes)  

---

## Features

For each analyzed string, the API computes and stores:

- `length`: Number of characters in the string  
- `is_palindrome`: Boolean indicating if the string reads the same forwards and backwards (case-insensitive)  
- `unique_characters`: Count of distinct characters in the string  
- `word_count`: Number of words separated by whitespace  
- `sha256_hash`: SHA-256 hash of the string for unique identification  
- `character_frequency_map`: Mapping of each character to its occurrence count  

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Devalps/stage1.git
