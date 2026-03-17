export async function fetchSBTET(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    const text = await res.text();
    if (!text.trim()) return null;
    let json = JSON.parse(text);
    if (typeof json === 'string') json = JSON.parse(json);
    return json;
  } catch (e) {
    return null;
  }
}

async function getProfile(pin) {
  const schemes = [11, 9, 8]; // C24, C21, C16
  const sems = [1, 2, 3, 4, 5, 6];
  const examMonthKeys = [91, 90, 88]; // APR-2025, NOV-2024, APR-2024
  
  for (const scheme of schemes) {
    for (const sem of sems) {
      for (const month of examMonthKeys) {
        const url = `https://www.sbtet.telangana.gov.in/api/api/Results/GetStudentWiseReport?ExamMonthYearId=${month}&ExamTypeId=5&Pin=${pin}&SchemeId=${scheme}&SemYearId=${sem}&StudentTypeId=1`;
        const data = await fetchSBTET(url);
        
        let table = data?.Table || data?.table || (Array.isArray(data) ? data : []);
        if (table.length && table[0].studentInfo && table[0].studentInfo.length > 0) {
           const info = table[0].studentInfo[0];
           console.log(`FOUND PROFILE for ${pin} at Scheme=${scheme}, Sem=${sem}, Month=${month}`);
           console.log("Name:", info.StudentName);
           console.log("Branch:", info.BranchName || info.BranchCode);
           return info;
        }
      }
    }
  }
  console.log("Profile not found anywhere!");
  return null;
}

getProfile("23001-C-054");
