const http = require("http");

http.get("http://localhost:3000/en/blog/youtube-video-downloader", (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    console.log("HTTP Status:", res.statusCode);
    console.log("Has Title:", data.includes("YouTube Video Downloader: Best Free Online Tools"));
    console.log("Has Author @jeet:", data.includes("@jeet"));
    console.log("Has Table:", data.includes("<table"));
    console.log("Has FAQPage Schema:", data.includes('"@type":"FAQPage"') || data.includes('&quot;@type&quot;:&quot;FAQPage&quot;'));
    console.log("Has Article Schema:", data.includes('"@type":"Article"') || data.includes('&quot;@type&quot;:&quot;Article&quot;'));
    console.log("Has Link to MediaSnap Tool:", data.includes("/en/tools/youtube-video-downloader"));
  });
});
