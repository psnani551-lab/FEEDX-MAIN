export async function fetchSBTET(url) {
  const response = await fetch(url + "&_t=" + Date.now(), {
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Referer': 'https://www.sbtet.telangana.gov.in/',
    }
  });
  const text = await response.text();
  return { url: url.substring(url.lastIndexOf('/')), body: text };
}

async function test() {
  const pin = "23001-C-054"; // Real PIN example from previous chats
  console.log("Fetching for:", pin);
  
  const r1 = await fetchSBTET(`https://www.sbtet.telangana.gov.in/api/api/PreExamination/getAttendanceReport?Pin=${pin}`);
  console.log("getAttendanceReport ->", r1.body.substring(0, 500));
  
  // Try semester results endpoint
  const r3 = await fetchSBTET(`https://www.sbtet.telangana.gov.in/api/api/Results/GetStudentWiseReport?ExamMonthYearId=91&ExamTypeId=5&Pin=${pin}&SchemeId=11&SemYearId=2&StudentTypeId=1`);
  console.log("GetStudentWiseReport ->", r3.body.substring(0, 500));
}

test();
