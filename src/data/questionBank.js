const makeQuestions = (type, rows) => rows.map(([id, title, category, difficulty, question, answer]) => ({
  id: `${type}-${id}`,
  type,
  title,
  category,
  difficulty,
  question,
  answer,
}));

export const aptitudeQuestions = makeQuestions("aptitude", [
  [1, "Percentage Change", "Quantitative", "easy", "A value increases by 20% and then decreases by 20%. What is the net change?", "A 4% decrease."],
  [2, "Profit and Loss", "Quantitative", "easy", "The cost price is ₹500 and profit is 20%. Find the selling price.", "₹600."],
  [3, "Time and Work", "Quantitative", "medium", "A finishes work in 10 days and B in 15 days. How long together?", "6 days."],
  [4, "Speed and Distance", "Quantitative", "easy", "A vehicle covers 60 km in 2 hours. Find its speed.", "30 km/h."],
  [5, "Probability", "Quantitative", "easy", "What is the probability of getting heads on a fair coin?", "1/2."],
  [6, "Number Series", "Logical", "easy", "Complete the series: 2, 4, 8, 16, ?", "32."],
  [7, "Syllogism", "Logical", "medium", "All dogs are animals. Tommy is a dog. What follows?", "Tommy is an animal."],
  [8, "Ranking", "Logical", "medium", "A student is 5th from the top and 10th from the bottom. How many students are there?", "14."],
  [9, "Vocabulary", "Verbal", "easy", "Choose a synonym for brave.", "Courageous."],
  [10, "Idiom", "Verbal", "easy", "What does ‘break the ice’ mean?", "To start a conversation and make people comfortable."],
]);

export const codingQuestions = makeQuestions("coding", [
  [1, "Two Sum", "Arrays", "easy", "Find two array elements whose sum equals a target.", "Use a hash map to store complements in O(n) time."],
  [2, "Binary Search", "Arrays", "medium", "Find a target in a sorted array.", "Repeatedly halve the search interval in O(log n) time."],
  [3, "Maximum Subarray", "Arrays", "medium", "Find the contiguous subarray with maximum sum.", "Use Kadane’s algorithm."],
  [4, "Valid Parentheses", "Strings", "easy", "Determine whether brackets are correctly balanced.", "Use a stack and match each closing bracket."],
  [5, "Longest Substring", "Strings", "medium", "Find the longest substring without repeated characters.", "Use a sliding window and last-seen indexes."],
  [6, "Reverse Linked List", "Linked List", "medium", "Reverse a singly linked list.", "Track previous, current, and next pointers."],
  [7, "Detect Cycle", "Linked List", "medium", "Detect whether a linked list contains a cycle.", "Use Floyd’s slow and fast pointer algorithm."],
  [8, "Merge Sort", "Sorting", "medium", "Sort an array using divide and conquer.", "Split recursively and merge sorted halves in O(n log n)."],
  [9, "Dijkstra’s Algorithm", "Graphs", "hard", "Find shortest paths from one source with non-negative edges.", "Use a distance map and min-priority queue."],
  [10, "Trie", "Data Structures", "hard", "Support efficient prefix-based string search.", "Store characters along tree paths with terminal markers."],
]);

export const interviewQuestions = makeQuestions("interview", [
  [1, "Tell Me About Yourself", "HR", "easy", "Give a concise professional introduction.", "Cover education, relevant skills, projects, impact, and your current goal."],
  [2, "Why Should We Hire You?", "HR", "medium", "Explain the value you would bring to this role.", "Connect evidence from your skills and experience to the role’s needs."],
  [3, "Conflict Resolution", "HR", "medium", "Describe how you handled a team conflict.", "Use the STAR structure and emphasize listening, action, and outcome."],
  [4, "Project Discussion", "HR", "medium", "Explain your most important project.", "Describe the problem, your contribution, technology choices, and measurable result."],
  [5, "OOP Principles", "Technical", "easy", "Explain the core principles of object-oriented programming.", "Encapsulation, abstraction, inheritance, and polymorphism."],
  [6, "SQL vs NoSQL", "Technical", "medium", "When would you choose SQL or NoSQL?", "Compare schema, relationships, consistency, scaling needs, and access patterns."],
  [7, "Process vs Thread", "Technical", "medium", "Explain the difference between a process and a thread.", "Processes have separate memory; threads share process resources and are lighter-weight."],
  [8, "HTTP vs HTTPS", "Technical", "easy", "What security does HTTPS add?", "TLS encryption, server authentication, and message integrity."],
  [9, "REST API", "Technical", "medium", "Explain REST and common HTTP operations.", "Resource-oriented endpoints using HTTP semantics such as GET, POST, PUT/PATCH, and DELETE."],
  [10, "Authentication vs Authorization", "Technical", "medium", "Differentiate authentication and authorization.", "Authentication verifies identity; authorization determines permitted actions."],
]);

export const questionBank = [...aptitudeQuestions, ...codingQuestions, ...interviewQuestions];
