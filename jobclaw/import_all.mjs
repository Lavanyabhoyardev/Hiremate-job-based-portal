const queries = [
  { country: "GB", role: "Software Engineer" },
  { country: "CA", role: "Developer" },
  { country: "AU", role: "Data Analyst" },
  { country: "DE", role: "Backend Engineer" },
  { country: "all", role: "AI Engineer" },
  { country: "all", role: "Product Manager" }
];

async function run() {
  for (const q of queries) {
    console.log(`Importing for ${q.country} - ${q.role}...`);
    try {
      const res = await fetch("http://localhost:3001/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q.role,
          numJobs: 10,
          country: q.country,
          datePosted: "month"
        })
      });
      const data = await res.json();
      console.log(data);
    } catch(err) {
      console.error(err);
    }
    // Wait slightly to avoid Rate limit (though API import handles some of it, this is extra safety)
    await new Promise(r => setTimeout(r, 2000));
  }
}
run();
