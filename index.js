import express from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

const FILE_PATH = path.join("./data.json");

// Load existing data if file exists
let strings = [];
if (fs.existsSync(FILE_PATH)) {
  const fileData = fs.readFileSync(FILE_PATH, "utf8");
  try {
    strings = JSON.parse(fileData);
  } catch (err) {
    console.error("Failed to parse data.json. Starting with empty array.");
    strings = [];
  }
}

// Helper function to save data to file
function saveData() {
  fs.writeFileSync(FILE_PATH, JSON.stringify(strings, null, 2));
}

// Helper to compute string properties
function analyzeString(value) {
  const length = value.length;
  const is_palindrome = value.toLowerCase() === value.toLowerCase().split('').reverse().join('');
  const unique_characters = new Set(value).size;
  const word_count = value.trim().split(/\s+/).length;
  const sha256_hash = crypto.createHash('sha256').update(value).digest('hex');

  const character_frequency_map = {};
  for (const char of value) {
    character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
  }

  return {
    id: sha256_hash,
    value,
    properties: {
      length,
      is_palindrome,
      unique_characters,
      word_count,
      sha256_hash,
      character_frequency_map
    },
    created_at: new Date().toISOString()
  };
}

// POST /strings — Create / Analyze string
app.post("/strings", (req, res) => {
  const { value } = req.body || {};
  if (value === undefined) return res.status(400).json({ error: "Missing 'value' field" });
  if (typeof value !== "string") return res.status(422).json({ error: "'value' must be a string" });

  const existing = strings.find(s => s.value === value);
  if (existing) return res.status(409).json({ error: "String already exists" });

  const analyzed = analyzeString(value);
  strings.push(analyzed);
  saveData();
  return res.status(201).json(analyzed);
});

// GET /strings/:string_value — Get specific string
app.get("/strings/:string_value", (req, res) => {
  const string_value = req.params.string_value;
  const found = strings.find(s => s.value === string_value);
  if (!found) return res.status(404).json({ error: "String not found" });
  return res.status(200).json(found);
});

// GET /strings — Get all strings with filters
app.get("/strings", (req, res) => {
  let result = [...strings];
  const { is_palindrome, min_length, max_length, word_count, contains_character } = req.query;

  if (is_palindrome !== undefined) result = result.filter(s => s.properties.is_palindrome === (is_palindrome === "true"));
  if (min_length !== undefined) result = result.filter(s => s.properties.length >= Number(min_length));
  if (max_length !== undefined) result = result.filter(s => s.properties.length <= Number(max_length));
  if (word_count !== undefined) result = result.filter(s => s.properties.word_count === Number(word_count));
  if (contains_character !== undefined) result = result.filter(s => s.value.includes(contains_character));

  return res.status(200).json({
    data: result,
    count: result.length,
    filters_applied: req.query
  });
});

// GET /strings/filter-by-natural-language
app.get("/strings/filter-by-natural-language", (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: "Missing query parameter" });

  let filters = {};
  if (/palindromic/.test(query)) filters.is_palindrome = true;
  if (/single word/.test(query)) filters.word_count = 1;
  const minLenMatch = query.match(/longer than (\d+)/);
  if (minLenMatch) filters.min_length = Number(minLenMatch[1]) + 1;

  let result = [...strings];
  if (filters.is_palindrome !== undefined) result = result.filter(s => s.properties.is_palindrome === filters.is_palindrome);
  if (filters.word_count !== undefined) result = result.filter(s => s.properties.word_count === filters.word_count);
  if (filters.min_length !== undefined) result = result.filter(s => s.properties.length >= filters.min_length);

  return res.status(200).json({
    data: result,
    count: result.length,
    interpreted_query: {
      original: query,
      parsed_filters: filters
    }
  });
});

// DELETE /strings/:string_value — Delete a string
app.delete("/strings/:string_value", (req, res) => {
  const string_value = req.params.string_value;
  const index = strings.findIndex(s => s.value === string_value);
  if (index === -1) return res.status(404).json({ error: "String not found" });
  strings.splice(index, 1);
  saveData();
  return res.status(204).json({ message: `String '${string_value}' deleted successfully` });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
