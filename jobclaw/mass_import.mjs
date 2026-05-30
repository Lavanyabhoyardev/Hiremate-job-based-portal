const queries = [
  // Expanded global coverage for Software Engineers
  { country: "US", role: "Software Engineer", num: 50 },
  { country: "IN", role: "Software Developer", num: 50 },
  { country: "GB", role: "Full Stack Developer", num: 30 },
  { country: "CA", role: "Software Engineer", num: 30 },
  { country: "AU", role: "Developer", num: 30 },
  { country: "DE", role: "Backend Engineer", num: 20 },
  { country: "FR", role: "Frontend Developer", num: 20 },
  { country: "JP", role: "Software Engineer", num: 20 },
  { country: "BR", role: "Developer", num: 20 },
  { country: "ZA", role: "Software Engineer", num: 20 },
  { country: "SG", role: "Tech Lead", num: 10 },
  { country: "AE", role: "Cloud Engineer", num: 10 },

  // Specialized Roles
  { country: "US", role: "Machine Learning Engineer", num: 30 },
  { country: "IN", role: "Data Scientist", num: 30 },
  { country: "GB", role: "Cybersecurity Analyst", num: 20 },
  { country: "all", role: "Cloud Architect", num: 30 },
  { country: "all", role: "DevOps Engineer", num: 40 },

  // Heavy focus on Internships globally
  { country: "US", role: "Software Engineering Intern", num: 50 },
  { country: "IN", role: "Developer Internship", num: 40 },
  { country: "GB", role: "Tech Intern", num: 20 },
  { country: "CA", role: "Computer Science Intern", num: 20 },
  { country: "all", role: "Data Analyst Intern", num: 30 },
  { country: "all", role: "Marketing Intern", num: 30 },
  { country: "all", role: "Internship", num: 50 }
];

async function run() {
  console.log(`Starting massive import for ${queries.length} queries...`);
  let totalImported = 0;
  
  for (const q of queries) {
    console.log(`\nImporting ${q.num} jobs for ${q.country === "all" ? "Global" : q.country} - ${q.role}...`);
    try {
      const res = await fetch("http://localhost:3001/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q.role,
          numJobs: q.num,
          country: q.country,
          datePosted: "month" // Ensure we get enough results
        })
      });
      const data = await res.json();
      
      if (data.success) {
        console.log(`✅ Success: Imported ${data.imported} | Skipped Dupes: ${data.duplicatesSkipped}`);
        totalImported += data.imported || 0;
      } else {
        console.log(`❌ Failed:`, data);
      }
    } catch(err) {
      console.error(`Error on query ${q.role}:`, err.message);
    }
    
    // 3 second delay between rapidapi mass hits to avoid 429 Too Many Requests
    console.log("Waiting 3 seconds before next query...");
    await new Promise(r => setTimeout(r, 3000));
  }
  
  console.log(`\n🎉 Mass Import Complete! Total new jobs added to MongoDB: ${totalImported}`);
}

run();
