# Backend Wizards — Stage 1: String Analyzer API

## Overview
This project is a **RESTful API** service that analyzes strings and stores their computed properties.  
For each string, the API computes:
- `length` — number of characters
- `is_palindrome` — true/false if the string reads the same forwards/backwards (case-insensitive)
- `unique_characters` — count of distinct characters
- `word_count` — number of words
- `sha256_hash` — SHA-256 hash for unique identification
- `character_frequency_map` — counts of each character

---

## Endpoints

### 1. Create / Analyze String
**POST** `/strings`  
**Headers:**  
`Content-Type: application/json`  

**Body Example:**
```json
{
  "value": "madam"
}
