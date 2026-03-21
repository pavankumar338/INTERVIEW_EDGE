const run = async () => {
  try {
    const res = await fetch("http://localhost:3000/api/generate-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company: "Google", role: "Frontend Developer", experience: "3 years" })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response length:", text.length);
    if(res.status !== 200) {
        console.error("Error from API:", text);
    } else {
        const json = JSON.parse(text);
        console.log("Successfully parsed JSON, rounds:", json.rounds?.length);
    }
  } catch (e) {
    console.error(e);
  }
};
run();
