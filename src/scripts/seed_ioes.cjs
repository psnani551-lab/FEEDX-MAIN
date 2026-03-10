const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync(__dirname + '/../../.env.production', 'utf8');
const lines = envFile.split('\n');
const supabaseUrl = lines.find(l => l.startsWith('VITE_SUPABASE_URL=')).split('=')[1].replace(/'/g, "").trim();
const supabaseKey = lines.find(l => l.startsWith('SUPABASE_SERVICE_ROLE_KEY=')).split('=')[1].replace(/'/g, "").trim();

const supabase = createClient(supabaseUrl, supabaseKey);

const ioesData = {
    name: 'GOVT INSTITUTE OF ELECTRONICS',
    place: 'SECUNDERABAD',
    dist: 'HYD',
    region: 'OU',
    type: 'GOV',
    minority: 'NA',
    mode: 'COED',
    established: '1981',
    description: 'Government Institute of Electronics (GIOE) is a premier government polytechnic established in 1981, offering diploma courses in cutting-edge technology fields including AI/ML, Cloud Computing, Cyber Security, and traditional Electronics branches.',
    vision: 'To be equipped with state-of-the-art technology, attract and retain talented human resources, and deliver a balanced education of rigorous theory and practical skills aligned with industry needs, thereby maturing into a world-class institute that empowers students to innovate, serve, and lead.',
    mission: 'To achieve an educational environment where every enrolled student successfully completes the program with zero dropout rate, attains 100% academic success, and secures 100% placement through strong industry-oriented training and institutional support.',
    unique_features: 'All diploma programs offered at the institute differ significantly from conventional diploma courses. Each program is of 3-year duration and includes a compulsory industrial training component during the final or pre-final semester. Core Electronics subjects are common across all specializations, supported by advanced branch-specific modules designed to meet the needs of modern industries and emerging technologies.',
    address: 'EAST MARRED PALLY, SECUNDERABAD, 500026',
    phone: '4027730000',
    email: 'principalgioe@gmail.com',
    website: 'https://gioescbd.dte.telangana.gov.in/',
    principal: 'Sri. B. Ram Mohan Reddy, M.Tech., MISTE.',
    facilities: ['Computer Labs', 'Electronics Labs', 'Library', 'Auditorium', 'Sports Ground', 'Canteen', 'WiFi Campus'],
    banner_image: '/images/ioes_banner.jpg',
    logo_image: '/images/ioes_banner.jpg',
    bannerImage: '/images/ioes_banner.jpg',
    logoImage: '/images/ioes_banner.jpg',
    images: [
        '/images/ioes_banner.jpg',
        '/images/ioes/2d839e36-0991-49a8-88aa-b1bd002f0eec.jpg',
        '/images/ioes/362f15d5-e1da-4563-8412-1ab8f1067f3b.jpg',
        '/images/ioes/44bf578a-9013-44e4-8ca3-88c6a15d00b8.jpg',
        '/images/ioes/537422c4-fa2d-4a37-986a-4468ee4c224a.jpg',
        '/images/ioes/7229f92e-c61c-4c22-9705-5235a05dfa76.jpg',
        '/images/ioes/83598784-aff9-46b0-b33d-d05486751359.jpg',
        '/images/ioes/87de1f65-8006-41bc-9fc1-db7ac3c7cf04.jpg',
        '/images/ioes/93e9ac10-f524-43a6-af6c-fe61b54038d4.jpg',
        '/images/ioes/b8af2369-7938-4f19-a178-0ed6bab9787e.jpg',
        '/images/ioes/cd96ad0e-d8eb-4ffe-8b51-783c4cd3b661.jpg',
        '/images/ioes/dbff9a99-48ef-4442-8902-a40303bbe65e.jpg',
        '/images/ioes/e3a637d5-3e5b-44de-8c1d-14bb58cf7d31.jpg',
        '/images/ioes/f7525e12-3d26-4ef3-835c-df1111043f76.jpg',
        '/images/ioes/f7b89bec-bf2c-4702-94bd-1b7965a1a6ab.jpg',
        '/images/ioes/Screenshot 2025-12-19 235808.png'
    ],
    courses: [
        { id: '1', code: 'AI', name: 'DIPLOMA IN ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING', intake: 66, duration: '3 years' },
        { id: '2', code: 'BM', name: 'DIPLOMA IN BIOMEDICAL ENGINEERING', intake: 66, duration: '3 years' },
        { id: '3', code: 'CCB', name: 'DIPLOMA IN CLOUD COMPUTING AND BIG DATA', intake: 66, duration: '3 years' },
        { id: '4', code: 'CPS', name: 'DIPLOMA IN CYBER PHYSICAL SYSTEMS AND SECURITY', intake: 66, duration: '3 years' },
        { id: '5', code: 'CS', name: 'DIPLOMA IN COMPUTER SCIENCE AND ENGINEERING', intake: 66, duration: '3 years' },
        { id: '6', code: 'EC', name: 'DIPLOMA IN ELECTRONICS & COMMUNICATION ENGINEERING', intake: 66, duration: '3 years' },
        { id: '7', code: 'EI', name: 'DIPLOMA IN ELECTRONICS & INSTRUMENTATION ENGINEERING', intake: 66, duration: '3 years' },
        { id: '8', code: 'ES', name: 'DIPLOMA IN EMBEDDED SYSTEMS ENGINEERING', intake: 66, duration: '3 years' },
        { id: '9', code: 'EV', name: 'DIPLOMA IN ELECTRONICS AND VIDEO ENGINEERING', intake: 66, duration: '3 years' },
    ],
    departments: [
        { id: 'aiml', name: 'Artificial Intelligence & Machine Learning', code: 'AIML', hod: { id: 'f1', name: 'N Srinivasa Rao', designation: 'Head of Department', qualification: '', department: 'AIML' }, intake: 60 },
        { id: 'cse', name: 'Computer Science & Engineering', code: 'CSE', hod: { id: 'f6', name: 'G V Nagalakshmi', designation: 'Head of Department', qualification: '', department: 'CSE' }, intake: 60 },
        { id: 'eie', name: 'Electronics & Instrumentation Engineering', code: 'EIE', hod: { id: 'f11', name: 'G V Nagalakshmi', designation: 'Head of Department', qualification: '', department: 'EIE' }, intake: 60 },
        { id: 'eve', name: 'Electronics & Video Engineering', code: 'EVE', hod: { id: 'f16', name: 'B Laxmi Kantha', designation: 'Head of Department', qualification: '', department: 'EVE' }, intake: 40 },
        { id: 'bme', name: 'Biomedical Engineering', code: 'BME', hod: { id: 'f21', name: 'P Jyothi', designation: 'Head of Department', qualification: '', department: 'BME' }, intake: 40 },
        { id: 'ccbd', name: 'Cloud Computing & Big Data', code: 'CCBD', hod: { id: 'f27', name: 'S P Venkat Reddy', designation: 'Head of Department', qualification: '', department: 'CCBD' }, intake: 60 },
        { id: 'ece', name: 'Electronics & Communication Engineering', code: 'ECE', hod: { id: 'f31', name: 'N Srinivasa Rao', designation: 'Head of Department', qualification: '', department: 'ECE' }, intake: 60 },
        { id: 'ese', name: 'Embedded Systems Engineering', code: 'ESE', hod: { id: 'f36', name: 'B Ram Mohan Reddy', designation: 'Head of Department', qualification: '', department: 'ESE' }, intake: 40 },
        { id: 'cpss', name: 'Cyber Physical Systems & Security', code: 'CPSS', hod: { id: 'f41', name: 'Venkata Satish Kumar M', designation: 'Head of Department', qualification: '', department: 'CPSS' }, intake: 60 },
        { id: 'hs', name: 'Humanities & Sciences', code: 'H&S', hod: { id: 'f46', name: 'D Satyanandam', designation: 'Head of Department', qualification: '', department: 'H&S' }, intake: 0 },
    ],
    faculty: [
        { id: 'f1', name: 'N Srinivasa Rao', designation: 'Head of Department', qualification: '', department: 'Artificial Intelligence & Machine Learning' },
        { id: 'f2', name: 'Asheera Begum', designation: 'Lecturer', qualification: '', department: 'Artificial Intelligence & Machine Learning' },
        { id: 'f3', name: 'Sai Kumar', designation: 'Lecturer', qualification: '', department: 'Artificial Intelligence & Machine Learning' },
        { id: 'f4', name: 'A Vikram Chakravorthy', designation: 'Lecturer', qualification: '', department: 'Artificial Intelligence & Machine Learning' },
        { id: 'f5', name: 'K Pramil', designation: 'Lecturer', qualification: '', department: 'Artificial Intelligence & Machine Learning' },
        { id: 'f6', name: 'G V Nagalakshmi', designation: 'Head of Department', qualification: '', department: 'Computer Science & Engineering' },
        { id: 'f7', name: 'K Sunitha', designation: 'Lecturer', qualification: '', department: 'Computer Science & Engineering' },
        { id: 'f8', name: 'P Srikar', designation: 'Lecturer', qualification: '', department: 'Computer Science & Engineering' },
        { id: 'f9', name: 'B Devisree', designation: 'Lecturer', qualification: '', department: 'Computer Science & Engineering' },
        { id: 'f10', name: 'S Swati', designation: 'Lecturer', qualification: '', department: 'Computer Science & Engineering' },
        { id: 'f11', name: 'G V Nagalakshmi', designation: 'Head of Department', qualification: '', department: 'Electronics & Instrumentation Engineering' },
        { id: 'f12', name: 'U Sriram', designation: 'Senior Lecturer', qualification: '', department: 'Electronics & Instrumentation Engineering' },
        { id: 'f13', name: 'B Indira Priyadarshini', designation: 'Lecturer', qualification: '', department: 'Electronics & Instrumentation Engineering' },
        { id: 'f14', name: 'P Satya', designation: 'Lecturer', qualification: '', department: 'Electronics & Instrumentation Engineering' },
        { id: 'f15', name: 'B Padmalatha', designation: 'Lecturer', qualification: '', department: 'Electronics & Instrumentation Engineering' },
        { id: 'f16', name: 'B Laxmi Kantha', designation: 'Head of Department', qualification: '', department: 'Electronics & Video Engineering' },
        { id: 'f17', name: 'P Shiva Raju', designation: 'Lecturer', qualification: '', department: 'Electronics & Video Engineering' },
        { id: 'f18', name: 'M Phanidhar Kumar', designation: 'Lecturer', qualification: '', department: 'Electronics & Video Engineering' },
        { id: 'f19', name: 'P Ravi', designation: 'Lecturer', qualification: '', department: 'Electronics & Video Engineering' },
        { id: 'f20', name: 'E Vinayak', designation: 'Lecturer', qualification: '', department: 'Electronics & Video Engineering' },
        { id: 'f21', name: 'P Jyothi', designation: 'Head of Department', qualification: '', department: 'Biomedical Engineering' },
        { id: 'f22', name: 'P Kishen Chandrika', designation: 'Lecturer', qualification: '', department: 'Biomedical Engineering' },
        { id: 'f23', name: 'K Thirupathanna', designation: 'Lecturer', qualification: '', department: 'Biomedical Engineering' },
        { id: 'f24', name: 'Y Poornachandra Rao', designation: 'Lecturer', qualification: '', department: 'Biomedical Engineering' },
        { id: 'f25', name: 'R Rameshwar', designation: 'Lecturer', qualification: '', department: 'Biomedical Engineering' },
        { id: 'f26', name: 'A Ajay Teja', designation: 'Lecturer', qualification: '', department: 'Biomedical Engineering' },
        { id: 'f27', name: 'S P Venkat Reddy', designation: 'Head of Department', qualification: '', department: 'Cloud Computing & Big Data' },
        { id: 'f28', name: 'V Kalpana', designation: 'Lecturer', qualification: '', department: 'Cloud Computing & Big Data' },
        { id: 'f29', name: 'A Vani', designation: 'Lecturer', qualification: '', department: 'Cloud Computing & Big Data' },
        { id: 'f30', name: 'S Dattatri Reddy', designation: 'Lecturer', qualification: '', department: 'Cloud Computing & Big Data' },
        { id: 'f31', name: 'N Srinivasa Rao', designation: 'Head of Department', qualification: '', department: 'Electronics & Communication Engineering' },
        { id: 'f32', name: 'V Maheshwari', designation: 'Senior Lecturer', qualification: '', department: 'Electronics & Communication Engineering' },
        { id: 'f33', name: 'K M Arvind Kumar', designation: 'Senior Lecturer', qualification: '', department: 'Electronics & Communication Engineering' },
        { id: 'f34', name: 'M Narender', designation: 'Lecturer', qualification: '', department: 'Electronics & Communication Engineering' },
        { id: 'f35', name: 'B Pushyami', designation: 'Lecturer', qualification: '', department: 'Electronics & Communication Engineering' },
        { id: 'f36', name: 'B Ram Mohan Reddy', designation: 'Head of Department', qualification: '', department: 'Embedded Systems Engineering' },
        { id: 'f37', name: 'Dr T Krishna Manohar', designation: 'Senior Lecturer', qualification: '', department: 'Embedded Systems Engineering' },
        { id: 'f38', name: 'T P Lingswamy', designation: 'Senior Lecturer', qualification: '', department: 'Embedded Systems Engineering' },
        { id: 'f39', name: 'A Suresh', designation: 'Lecturer', qualification: '', department: 'Embedded Systems Engineering' },
        { id: 'f40', name: 'M Javid Ali', designation: 'Lecturer', qualification: '', department: 'Embedded Systems Engineering' },
        { id: 'f41', name: 'Venkata Satish Kumar M', designation: 'Head of Department', qualification: '', department: 'Cyber Physical Systems & Security' },
        { id: 'f42', name: 'K Sunitha', designation: 'Lecturer', qualification: '', department: 'Cyber Physical Systems & Security' },
        { id: 'f43', name: 'K M Sateesh Kumar', designation: 'Senior Lecturer', qualification: '', department: 'Cyber Physical Systems & Security' },
        { id: 'f44', name: 'T Bhargavi', designation: 'Lecturer', qualification: '', department: 'Cyber Physical Systems & Security' },
        { id: 'f45', name: 'A Satheesh Naik', designation: 'Lecturer', qualification: '', department: 'Cyber Physical Systems & Security' },
        { id: 'f46', name: 'D Satyanandam', designation: 'Head of Department', qualification: '', department: 'Humanities & Sciences' },
        { id: 'f47', name: 'P V V Ramanamurthy', designation: 'Lecturer', qualification: '', department: 'Humanities & Sciences' },
        { id: 'f48', name: 'M Vijaya Laxmi', designation: 'Lecturer', qualification: '', department: 'Humanities & Sciences' },
        { id: 'f49', name: 'G Prasad', designation: 'Senior Lecturer', qualification: '', department: 'Humanities & Sciences' },
        { id: 'f50', name: 'M Uma Rani', designation: 'Lecturer', qualification: '', department: 'Humanities & Sciences' },
        { id: 'f51', name: 'R Vijaya', designation: 'Lecturer', qualification: '', department: 'Humanities & Sciences' },
        { id: 'f52', name: 'M Radhika', designation: 'Lecturer', qualification: '', department: 'Humanities & Sciences' },
        { id: 'f53', name: 'G Madhubabu', designation: 'Lecturer', qualification: '', department: 'Humanities & Sciences' },
        { id: 'f54', name: 'M Manjula', designation: 'Librarian', qualification: '', department: 'Humanities & Sciences' },
        { id: 'f55', name: 'B Srikantha Chary', designation: 'Lecturer', qualification: '', department: 'Humanities & Sciences' },
    ]
};

async function run() {
    console.log("Updating IOES data in Supabase...");
    const { data, error } = await supabase.from('institutes').update(ioesData).eq('code', 'IOES').select();
    if (error) {
        console.error("Query Error:", error.message);
    } else {
        console.log("Successfully seeded IOES data!", data ? data.length : 0, "rows updated.");
    }
}
run();
