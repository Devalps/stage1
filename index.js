import express from "express";
import fs from "fs";
const FILE_PATH = "./data.json";
let strings = [];

// Load existing data
if (fs.existsSync(FILE_PATH)) {
  strings = JSON.parse(fs.readFileSync(FILE_PATH, "utf8"));
}

// Save function
function saveData() {
  fs.writeFileSync(FILE_PATH, JSON.stringify(strings, null, 2));
}

const app = express();
const PORT = 3000;

// ✅ Important: Enable JSON parsing
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.status(200).send("String Analyzer API is live 🚀");
});

// POST /strings route
app.post("/strings", (req, res) => {
  const { value } = req.body;
  app.get("/strings/:string_value", (req, res) => {
  const { string_value } = req.params;
  const str = strings.find(s => s.value === string_value);

  if (!str) {
    return res.status(404).json({ error: "String not found" });
  }

  res.status(200).json(str);
});
saveData();

  // Validate input
  if (!value || typeof value !== "string") {
    return res.status(400).json({ error: "Please provide a valid string." });
  }

  // Perform string analysis
  const length = value.length;
  const uppercase = value.toUpperCase();
  const lowercase = value.toLowerCase();
  const isPalindrome = value === value.split("").reverse().join("");

  // Return response
  res.status(201).json({
    length,
    uppercase,
    lowercase,
    isPalindrome,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});




// GET /strings/:string_value
app.get("/strings/:value", (req, res) => {
  const { value } = req.params;

  // find the string in memory
  const existingString = strings.find(
    (item) => item.value.toLowerCase() === value.toLowerCase()
  );

  if (!existingString) {
    return res.status(404).json({ error: "String not found" });
  }

  res.status(200).json(existingString);
});

app.get("/strings", (req, res) => {
  let results = [...strings];
  const { is_palindrome, min_length, max_length, word_count, contains_character } = req.query;


app.post("/strings/filter-by-natural-language", (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query text is required" });
  }

  let results = [...strings];

  // Convert text to lowercase for easier matching
  const q = query.toLowerCase();

  // Handle common natural language cases
  if (q.includes("palindrome")) {
    results = results.filter(s => s.properties.is_palindrome);
  }

  // Check for "longer than X characters"
  const lengthMatch = q.match(/longer than (\d+)/);
  if (lengthMatch) {
    const minLength = parseInt(lengthMatch[1]);
    results = results.filter(s => s.properties.length > minLength);
  }

  // Check for "shorter than X characters"
  const shortMatch = q.match(/shorter than (\d+)/);
  if (shortMatch) {
    const maxLength = parseInt(shortMatch[1]);
    results = results.filter(s => s.properties.length < maxLength);
  }

  // Check for "contain" character
  const charMatch = q.match(/contain(?:s)? the letter (\w)/);
  if (charMatch) {
    const character = charMatch[1];
    results = results.filter(s => s.value.includes(character));
  }

  // If no matches found
  if (results.length === 0) {
    return res.status(404).json({
      message: "No strings matched your natural language query",
      query
    });
  }

  // Return results
  res.status(200).json({
    message: "Results based on natural language filter",
    query,
    count: results.length,
    data: results
  });
});


  // Filtering logic
  if (is_palindrome !== undefined) {
    const boolVal = is_palindrome === "true";
    results = results.filter(s => s.properties.is_palindrome === boolVal);
  }

  if (min_length) {
    results = results.filter(s => s.properties.length >= parseInt(min_length));
  }

  if (max_length) {
    results = results.filter(s => s.properties.length <= parseInt(max_length));
  }

  if (word_count) {
    results = results.filter(s => s.properties.word_count === parseInt(word_count));
  }

  if (contains_character) {
    results = results.filter(s => s.value.includes(contains_character));
  }

  res.status(200).json({
    data: results,
    count: results.length,
    filters_applied: req.query
  });
});


// GET /strings with filters
app.get("/strings", (req, res) => {
  const {
    is_palindrome,
    min_length,
    max_length,
    word_count,
    contains_character,
  } = req.query;

  let filtered = [...strings];

  // Apply filters if they exist
  if (is_palindrome !== undefined) {
    const boolValue =
      is_palindrome === "true" ? true : is_palindrome === "false" ? false : null;
    if (boolValue === null)
      return res.status(400).json({ error: "Invalid value for is_palindrome" });
    filtered = filtered.filter(
      (s) => s.properties.is_palindrome === boolValue
    );
  }

  if (min_length) {
    if (isNaN(min_length))
      return res.status(400).json({ error: "min_length must be a number" });
    filtered = filtered.filter(
      (s) => s.properties.length >= parseInt(min_length)
    );
  }

  if (max_length) {
    if (isNaN(max_length))
      return res.status(400).json({ error: "max_length must be a number" });
    filtered = filtered.filter(
      (s) => s.properties.length <= parseInt(max_length)
    );
  }

  if (word_count) {
    if (isNaN(word_count))
      return res.status(400).json({ error: "word_count must be a number" });
    filtered = filtered.filter(
      (s) => s.properties.word_count === parseInt(word_count)
    );
  }

  if (contains_character) {
    if (contains_character.length !== 1)
      return res
        .status(400)
        .json({ error: "contains_character must be a single character" });
    filtered = filtered.filter((s) =>
      s.value.toLowerCase().includes(contains_character.toLowerCase())
    );
  }

  res.json({
    data: filtered,
    count: filtered.length,
    filters_applied: {
      is_palindrome,
      min_length,
      max_length,
      word_count,
      contains_character,
    },
  });
});


// 🧠 Natural Language Filtering Route
app.get("/strings/filter-by-natural-language", (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Missing query parameter" });
  }

  const lowerQuery = query.toLowerCase();
  let filters = {};

  // ✅ Simple keyword matching
  if (lowerQuery.includes("palindromic")) filters.is_palindrome = true;
  if (lowerQuery.includes("single word")) filters.word_count = 1;
  if (lowerQuery.match(/longer than (\d+)/)) {
    filters.min_length = parseInt(lowerQuery.match(/longer than (\d+)/)[1]);
  }
  if (lowerQuery.match(/shorter than (\d+)/)) {
    filters.max_length = parseInt(lowerQuery.match(/shorter than (\d+)/)[1]);
  }
  if (lowerQuery.includes("contain the first vowel") || lowerQuery.includes("contain vowel")) {
    filters.contains_character = "a";
  }
  if (lowerQuery.match(/letter (\w)/)) {
    filters.contains_character = lowerQuery.match(/letter (\w)/)[1];
  }

  // 🧩 Now filter the stored strings
  let results = strings.filter((s) => {
    const props = s.properties;
    if (filters.is_palindrome !== undefined && props.is_palindrome !== filters.is_palindrome) return false;
    if (filters.word_count !== undefined && props.word_count !== filters.word_count) return false;
    if (filters.min_length !== undefined && props.length <= filters.min_length) return false;
    if (filters.max_length !== undefined && props.length >= filters.max_length) return false;
    if (filters.contains_character && !s.value.includes(filters.contains_character)) return false;
    return true;
  });

  res.json({
    data: results,
    count: results.length,
    interpreted_query: {
      original: query,
      parsed_filters: filters
    }
  });
});

// GET /strings/filter-by-natural-language
app.get("/strings/filter-by-natural-language", (req, res) => {
  const { query } = req.query;
  if (!query)
    return res.status(400).json({ error: "Missing 'query' parameter" });

  const lowerQuery = query.toLowerCase();
  let filters = {};

  // --- Parse natural language ---
  if (lowerQuery.includes("palindromic") || lowerQuery.includes("palindrome")) {
    filters.is_palindrome = true;
  }

  const wordCountMatch = lowerQuery.match(/(\d+)\s*word/);
  if (wordCountMatch) {
    filters.word_count = parseInt(wordCountMatch[1]);
  }

  const longerThanMatch = lowerQuery.match(/longer than (\d+)/);
  if (longerThanMatch) {
    filters.min_length = parseInt(longerThanMatch[1]) + 1;
  }

  const shorterThanMatch = lowerQuery.match(/shorter than (\d+)/);
  if (shorterThanMatch) {
    filters.max_length = parseInt(shorterThanMatch[1]) - 1;
  }

  const containsMatch = lowerQuery.match(/containing the letter (\w)/);
  if (containsMatch) {
    filters.contains_character = containsMatch[1].toLowerCase();
  }

  // If no filters were found, throw an error
  if (Object.keys(filters).length === 0) {
    return res.status(400).json({
      error: "Unable to parse natural language query",
    });
  }

  // Apply filters from our previous logic
  let filtered = [...strings];

  if (filters.is_palindrome !== undefined) {
    filtered = filtered.filter(
      (s) => s.properties.is_palindrome === filters.is_palindrome
    );
  }

  if (filters.min_length) {
    filtered = filtered.filter(
      (s) => s.properties.length >= filters.min_length
    );
  }

  if (filters.max_length) {
    filtered = filtered.filter(
      (s) => s.properties.length <= filters.max_length
    );
  }

  if (filters.word_count) {
    filtered = filtered.filter(
      (s) => s.properties.word_count === filters.word_count
    );
  }

  if (filters.contains_character) {
    filtered = filtered.filter((s) =>
      s.value.toLowerCase().includes(filters.contains_character)
    );
  }

  res.json({
    data: filtered,
    count: filtered.length,
    interpreted_query: {
      original: query,
      parsed_filters: filters,
    },
  });
});
app.delete("/strings/:string_value", (req, res) => {
  const { string_value } = req.params;
  const index = strings.findIndex(s => s.value === string_value);

  if (index === -1) {
    return res.status(404).json({ error: "String not found" });
  }

  strings.splice(index, 1);
  res.status(200).json({ message: `String '${string_value}' deleted successfully` });
});
saveData();
