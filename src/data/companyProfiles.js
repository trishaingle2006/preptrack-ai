export const companyProfiles = [
  {
    id: "google", name: "Google", initials: "G", color: "#4285f4", style: "Exploratory problem solving with strong reasoning and optimization follow-ups.",
    focus: ["Algorithms", "Problem solving", "Scalability", "Communication"], initialDifficulty: "hard", threshold: 8,
    weights: { technical: 40, problemSolving: 35, communication: 15, roleFit: 10 },
    questions: ["Walk through an efficient solution for finding the longest substring without repeating characters.", "How would you improve your solution for very large input?", "Design a scalable autocomplete service.", "Explain one important trade-off in your design.", "Describe a time you used evidence to change a technical decision."],
  },
  {
    id: "amazon", name: "Amazon", initials: "A", color: "#ff9900", style: "Structured behavioural evidence combined with practical technical depth and ownership.",
    focus: ["Data structures", "Ownership", "Customer impact", "Trade-offs"], initialDifficulty: "medium", threshold: 7.5,
    weights: { technical: 30, problemSolving: 25, communication: 20, roleFit: 25 },
    questions: ["Describe a difficult problem you solved with incomplete information.", "Design an order tracking service that handles traffic spikes.", "What data structure would you use to implement an LRU cache and why?", "Tell me about a time you took ownership beyond your assigned task.", "How would you measure whether your solution improved the customer experience?"],
  },
  {
    id: "microsoft", name: "Microsoft", initials: "M", color: "#00a4ef", style: "Collaborative problem solving, fundamentals, design thinking, and growth mindset.",
    focus: ["Coding", "System design", "Collaboration", "Growth mindset"], initialDifficulty: "medium", threshold: 7.2,
    weights: { technical: 35, problemSolving: 30, communication: 20, roleFit: 15 },
    questions: ["Design a data structure that supports insert, delete, and random retrieval efficiently.", "How would you test the solution and its edge cases?", "Design a real-time collaborative document editor.", "Describe a technical mistake and what you changed afterward.", "How do you make progress when teammates disagree on an approach?"],
  },
  {
    id: "tcs", name: "TCS", initials: "T", color: "#7b3fa1", style: "Clear fundamentals, project understanding, programming basics, and professional communication.",
    focus: ["Fundamentals", "Projects", "Programming", "Communication"], initialDifficulty: "easy", threshold: 6.2,
    weights: { technical: 35, problemSolving: 20, communication: 25, roleFit: 20 },
    questions: ["Explain your main project, your contribution, and the technologies used.", "Compare object-oriented programming and procedural programming.", "Explain normalization and why databases use it.", "Write the approach for checking whether a string is a palindrome.", "Why are you interested in working in a client-focused technology organization?"],
  },
  {
    id: "infosys", name: "Infosys", initials: "I", color: "#007cc3", style: "Foundational knowledge, logical thinking, trainability, and structured project discussion.",
    focus: ["Aptitude", "Core CS", "Projects", "Learning ability"], initialDifficulty: "easy", threshold: 6.2,
    weights: { technical: 30, problemSolving: 25, communication: 25, roleFit: 20 },
    questions: ["Explain the architecture and data flow of a project you built.", "What is the difference between a process and a thread?", "How would you find the second-largest value in an array?", "Explain HTTP and what makes HTTPS secure.", "Describe how you learn an unfamiliar technology under a deadline."],
  },
  {
    id: "startup", name: "Product Startup", initials: "S", color: "#14a673", style: "Practical execution, product judgement, speed, ownership, and comfort with ambiguity.",
    focus: ["Product thinking", "Execution", "Full-stack skills", "Ownership"], initialDifficulty: "medium", threshold: 7,
    weights: { technical: 30, problemSolving: 25, communication: 15, roleFit: 30 },
    questions: ["You have one week to validate a product idea. What would you build and measure?", "Design a simple but reliable notification system for an early-stage product.", "A production release causes a severe slowdown. Walk through your response.", "What trade-off would you accept to ship faster, and what would you refuse to compromise?", "Describe a time you worked effectively without complete requirements."],
  },
];

export const getCompanyProfile = (id) => companyProfiles.find((company) => company.id === id) ?? companyProfiles[0];
