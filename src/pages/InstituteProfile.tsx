import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Search, GraduationCap, Users } from 'lucide-react';

const institutes = [
  { code: 'ADBP', name: 'S.G GOVT POLYTECHNIC', place: 'ADILABAD', dist: 'ADB', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'AITH', name: 'ANNAMACHARYA INST. OF TECHNOLOGY. AND SCI.', place: 'HAYATHNAGAR MANDAL', dist: 'RR', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'AIZA', name: 'AIZZA COLLEGE OF ENGG AND TECHNOLOGY', place: 'MANCHERIAL', dist: 'MNC', region: 'OU', type: 'PVT', minority: 'MUS', mode: 'COED' },
  { code: 'AKIT', name: 'ABDULKALAM INST. OF TECHNOLOGY AND SCI.', place: 'KOTHAGUDEM', dist: 'KGM', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'ANRK', name: 'ANURAG ENGINNERING COLLGE', place: 'KODAD', dist: 'SRP', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'ARJN', name: 'ARJUN COLLEGE OF TECHNOLOGY AND SCIENCE', place: 'BATASINGARAM', dist: 'RR', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'ASRA', name: 'AVANTHIS SCIENTIFIC TECH AND RESEARCH ACADEMY', place: 'HAYATHNAGAR', dist: 'RR', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'BLMP', name: 'GOVT POLYTECHNIC', place: 'BELLAMPALLI', dist: 'MNC', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'BOMA', name: 'BOMMA INST. OF TECHNOLOGY AND SCI.', place: 'KHAMMAM', dist: 'KHM', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'BOSE', name: 'ANU BOSE INSTT OF TECHNOLOGY', place: 'PALONCHA', dist: 'KGM', region: 'OU', type: 'PVT', minority: 'NA', mode: 'GIRLS' },
  { code: 'BRAW', name: 'B R AMBEDKAR GMR POLYTECHNIC FOR WOMEN', place: 'KARIMNAGAR', dist: 'KRM', region: 'OU', type: 'GOV', minority: 'NA', mode: 'GIRLS' },
  { code: 'BRIG', name: 'BRILLIANT GRAMMER SCHOOL EDNL SOC GRP OF INSTNS', place: 'HAYATHNAGAR', dist: 'RR', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'BRIL', name: 'BRILLIANT INSTT OF ENGG AND TECHNOLOGY', place: 'HAYATHNAGAR', dist: 'RR', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'CGNT', name: 'GOVERNMENT POLYTECHNIC', place: 'CHEGUNTA', dist: 'MED', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'CHET', name: 'SRI CHAITANYA TECHNICAL CAMPUS', place: 'IBRAHIMPATNAM', dist: 'RR', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'CJIT', name: 'CHRISTU JYOTHI INSTITUTE OF TECHNOLOGY AND SCI.', place: 'JANGAON', dist: 'JGN', region: 'OU', type: 'PVT', minority: 'CHR', mode: 'COED' },
  { code: 'CRYL', name: 'GOVT POLYTECHNIC', place: 'CHERIYAL', dist: 'SDP', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'DARE', name: 'DARIPALLY ANANTHA RAMULU COLLEGE OF ENGG. AND TECH', place: 'KHAMMAM', dist: 'KHM', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'DDHD', name: 'S D D TT I FOR WOMEN', place: 'HYDERABAD', dist: 'HYD', region: 'OU', type: 'GOV', minority: 'NA', mode: 'GIRLS' },
  { code: 'ELEN', name: 'ELLENKI COLLGE OF ENGG. AND TECHNOLOGY', place: 'PATANCHERU', dist: 'SRD', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'GDWL', name: 'GOVERNMENT POLYTECHNIC', place: 'GADWAL', dist: 'GDL', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'GNPR', name: 'GOVT.POLYTECHNIC', place: 'STATION GHANPUR', dist: 'JGN', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'GPWS', name: 'GOVT POLYTECHNIC FOR WOMEN', place: 'SECUNDERABAD', dist: 'HYD', region: 'OU', type: 'GOV', minority: 'NA', mode: 'GIRLS' },
  { code: 'GTSR', name: 'GAYATRI INST OF TECH AND SCI', place: 'WANAPARTHY', dist: 'WNP', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'GWMB', name: 'GOVT POLY. FOR WOMEN AND MINORITIES', place: 'BADANGPET', dist: 'RR', region: 'OU', type: 'GOV', minority: 'YES', mode: 'GIRLS' },
  { code: 'GWNZ', name: 'GOVT POLYTECHNIC FOR WOMEN', place: 'NIZAMABAD', dist: 'NZB', region: 'OU', type: 'GOV', minority: 'NA', mode: 'GIRLS' },
  { code: 'GZWL', name: 'GOVT MODEL RESIDENTIAL POLYTECHNIC', place: 'GAJWEL', dist: 'SDP', region: 'OU', type: 'GOV', minority: 'NA', mode: 'BOYS' },
  { code: 'HOLY', name: 'HOLY MARY INSTITUTE OF TECH. SCIENCE', place: 'KEESARA', dist: 'MDL', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'HSBD', name: 'GOVERNMENT POLYTECHNIC', place: 'HUSNABAD', dist: 'SDP', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'IITT', name: 'INDUR INSTITUTE OF ENGINEERING AND TECHNOLOGY', place: 'SIDDIPET', dist: 'SDP', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'IOEPH', name: 'GOVT INSTITUTE OF ELECTRONICS', place: 'SECUNDERABAD', dist: 'HYD', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'IOES', name: 'GOVT INSTITUTE OF ELECTRONICS', place: 'SECUNDERABAD', dist: 'HYD', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'JGPT', name: 'GOVT.POLYTECHNIC', place: 'JOGIPET', dist: 'SRD', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'JGPW', name: 'GOVERNMENT POLYTECHNIC FOR WOMEN', place: 'JOGIPET', dist: 'SRD', region: 'OU', type: 'GOV', minority: 'NA', mode: 'GIRLS' },
  { code: 'JMTS', name: 'JYOTHISHMATHI INSTITUTE OF TECHNOLOGY AND SCI.', place: 'KARIMNAGAR', dist: 'KRM', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'JNGP', name: 'J N GOVT POLYTECHNIC', place: 'RAMANTHAPUR', dist: 'MDL', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'JPNE', name: 'JAYAPRAKASH NARAYAN COLLEGE OF ENGINEERING', place: 'MAHABUBNAGAR', dist: 'MBN', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'KCEA', name: 'KSHATRIYA COLLEGE OF ENGINEERING', place: 'ARMOOR', dist: 'NZB', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'KDDW', name: 'KODADA INST OF TECHNOLOGY AND SCIENCE FOR WOMEN', place: 'KODADA', dist: 'SRP', region: 'OU', type: 'PVT', minority: 'NA', mode: 'GIRLS' },
  { code: 'KLRT', name: 'K.L.R.COLLEGE OF ENGG AND TECHNOLOGY PALONCHA', place: 'PALONCHA', dist: 'KGM', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'KNRR', name: 'KASIREDDY NARAYANAREDDY COLL ENGG RES.', place: 'HAYATHNAGAR', dist: 'RR', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'KRTL', name: 'GOVT.POLYTECHNIC', place: 'KORUTLA', dist: 'JTL', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'KSDM', name: 'GOVERNMENT POLYTECHNIC KESAMUDRAM', place: 'KESAMUDRAM', dist: 'MHB', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'KSGI', name: 'GOVERNMENT POLYTECHNIC', place: 'KOSGI', dist: 'NPT', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'KTGM', name: 'GOVT POLYTECHNIC', place: 'KOTHAGUDEM', dist: 'KGM', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'KTGR', name: 'GOVT.POLYTECHNIC', place: 'KOTAGIRI', dist: 'NZB', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'KTRM', name: 'GOVT.POLYTECHNIC', place: 'KATARAM', dist: 'JBP', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'LTHD', name: 'GOVT. INSTT OF LEATHER TECHNOLOGY', place: 'HYDERABAD', dist: 'HYD', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'MAHM', name: 'GOVERNMENT POLYTECHNIC', place: 'MAHESHWARAM', dist: 'RR', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'MASB', name: 'GOVT POLYTECHNIC', place: 'MASAB TANK', dist: 'HYD', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'MBNR', name: 'GOVT POLYTECHNIC', place: 'MAHABUB NAGAR', dist: 'MBN', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'MDCL', name: 'GOVERNMENT POLYTECHNIC', place: 'MEDCHAL', dist: 'MDL', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'MDKW', name: 'GOVT POLYTECHNIC FOR WOMEN', place: 'MEDAK', dist: 'MED', region: 'OU', type: 'GOV', minority: 'NA', mode: 'GIRLS' },
  { code: 'MDRA', name: 'GOVT.POLYTECHNIC', place: 'MADHIRA', dist: 'KHM', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'MDRK', name: 'MADHIRA INSTITUTE OF TECHNOLOGY AND SCI.', place: 'KODAD', dist: 'SRP', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'MGHA', name: 'MEGHA INST OF ENGG AND TECHNOLOGY FOR WOMEN', place: 'GHATKESAR', dist: 'MDL', region: 'OU', type: 'PVT', minority: 'NA', mode: 'GIRLS' },
  { code: 'MHVR', name: 'MAHAVEER INSTITUTE OF SCI. AND TECHNOLOGY', place: 'BANDLAGUDA', dist: 'HYD', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'MINA', name: 'MINA INST OF ENGG AND TECHNOLOGY FOR WOMEN', place: 'MIRYALAGUDA', dist: 'NLG', region: 'OU', type: 'PVT', minority: 'NA', mode: 'GIRLS' },
  { code: 'MNGR', name: 'GOVT MODEL RESIDENTIAL POLYTECHNIC', place: 'MANUGURU ASWAPURAM', dist: 'KGM', region: 'OU', type: 'GOV', minority: 'NA', mode: 'BOYS' },
  { code: 'MOTK', name: 'MOTHER TERESA INSTITUTE OF SCI. AND TECHNOLOGY', place: 'SATHUPALLY', dist: 'KHM', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'MTEC', name: 'MOTHER THERESA COLLEGE OF ENGG. AND TECHNOLOGY', place: 'PEDDAPALLY', dist: 'PDL', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'NALG', name: 'GOVT POLYTECHNIC', place: 'NALGONDA', dist: 'NLG', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'NAWB', name: 'NAWAB SHAH ALAM KHAN COLL OF ENGG AND TECH', place: 'NEW MALAKPET', dist: 'HYD', region: 'OU', type: 'PVT', minority: 'MUS', mode: 'COED' },
  { code: 'NDPT', name: 'GOVT.POLYTECHNIC', place: 'NANDIPET', dist: 'NZB', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'NGMA', name: 'NIGAMA ENGINEERING COLLEGE', place: 'MOQUDUMPOOR', dist: 'KRM', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'NKHD', name: 'GOVERNMENT POLYTECHNIC', place: 'NARAYANKHED', dist: 'SRD', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'NRML', name: 'GOVT.POLYTECHNIC', place: 'NIRMAL', dist: 'NRM', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'NSGR', name: 'GOVT POLYTECHNIC', place: 'NAGARJUNASAGAR', dist: 'NLG', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'NSPR', name: 'GOVT.POLYTECHNIC', place: 'GOMARAM Near NARSAPUR', dist: 'MED', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'NVPT', name: 'GOVERNMENT POLYTECHNIC', place: 'NAVIPET', dist: 'NZB', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'NZBD', name: 'GOVT POLYTECHNIC', place: 'NIZAMABAD', dist: 'NZB', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'PBRW', name: 'GOVERNMENT POLYTECHNIC FOR WOMEN', place: 'PEBBAIR', dist: 'WNP', region: 'OU', type: 'GOV', minority: 'NA', mode: 'GIRLS' },
  { code: 'PETW', name: 'PRINCETON INST OF ENGG TECH FOR WOMEN', place: 'GHATKESAR', dist: 'MDL', region: 'OU', type: 'PVT', minority: 'NA', mode: 'GIRLS' },
  { code: 'PRKL', name: 'GOVERNMENT POLYTECHNIC', place: 'PARKAL', dist: 'HNK', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'PTCR', name: 'GOVERNMENT POLYTECHNIC PATANCHERU', place: 'PATANCHERU', dist: 'SRD', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'QQHD', name: 'QQ GOVT POLYTECHNIC', place: 'CHENDULALBARADARI', dist: 'HYD', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'RITM', name: 'RATNAPURI INSTITUTE OF TECH. COLL. OF POLYTECHNIC', place: 'TURAKALA KHANAPUR', dist: 'SRD', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'SAIS', name: 'SAI SPURTI INSTITUTE OF TECHNOLOGY', place: 'SATHUPALLY', dist: 'KHM', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'SBIT', name: 'SWARNA BHARATHI INSTITUTE OF SCI. AND TECHNOLOGY', place: 'KHAMMAM', dist: 'KHM', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'SCCL', name: 'SINGARENI COLLIERIES POLYTECHNIC COLLEGE', place: 'NASPUR', dist: 'MNC', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'SCIT', name: 'SRI CHAITANYA INSTITUTE OF TECHNOLOGY AND RESEARCH', place: 'KHAMMAM', dist: 'KHM', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'SDES', name: 'SREE DATTHA INSTITUTE OF ENGINEERING AND SCIENCE', place: 'IBRAHIMPATAN', dist: 'RR', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'SDPT', name: 'GOVT.POLYTECHNIC', place: 'SIDDIPET', dist: 'SDP', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'SDPW', name: 'GOVERNMENT POLYTECHNIC FOR WOMEN', place: 'SIDDIPET', dist: 'SDP', region: 'OU', type: 'GOV', minority: 'NA', mode: 'GIRLS' },
  { code: 'SGMA', name: 'S G M GOVT POLYTECHNIC', place: 'ABDULLAPURMET', dist: 'RR', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'SGRD', name: 'GOVERNMENT POLYTECHNIC', place: 'SANGA REDDY', dist: 'SRD', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'SHAD', name: 'GOVERNMENT POLYTECHNIC SHADNAGAR', place: 'SHADNAGAR', dist: 'MBN', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'SISG', name: 'SIDDHARTHA INSTT OF TECHNOLOGY AND SCIENCES', place: 'GHATKESAR', dist: 'MDL', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'SMCD', name: 'ST MARYS ENGINEERING COLLEGE', place: 'DESHMUKHI', dist: 'YBG', region: 'OU', type: 'PVT', minority: 'CHR', mode: 'COED' },
  { code: 'SMED', name: 'ST.MARYS GROUP OF INSTITUTIONS', place: 'DESHMUKHI', dist: 'YBG', region: 'OU', type: 'PVT', minority: 'CHR', mode: 'COED' },
  { code: 'SMSK', name: 'SAMSKRUTI COLLEGE OF ENGG. AND TECHNOLOGY.', place: 'GHATKESAR', dist: 'MDL', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'SRPW', name: 'GOVT POLYTECHNIC FOR WOMEN', place: 'SURYAPET', dist: 'SRP', region: 'OU', type: 'GOV', minority: 'NA', mode: 'GIRLS' },
  { code: 'SRRS', name: 'SRRS GOVT POLYTECHNIC', place: 'SIRCILLA', dist: 'SRC', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'SVES', name: 'SRI VENKATESWARA ENGINEERING COLLEGE', place: 'SURYAPETA', dist: 'SRP', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'SVSE', name: 'SVS GRP OF INSTNS - SVS INST OF TECH.', place: 'HANAMKONDA', dist: 'HNK', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'TCEK', name: 'TRINITY COLLEGE OF ENGINEERING AND TECHNOLOGY', place: 'PEDDAPALLY', dist: 'PDL', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'TCTK', name: 'TRINITY COLLEGE OF ENGINEERING AND TECHNOLOGY', place: 'KARIMNAGAR', dist: 'KRM', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'TKEM', name: 'TEEGALA KRISHNA REDDY ENGINEERING COLLEGE', place: 'MIRPET', dist: 'RR', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'TKRC', name: 'T K R COLLEGE OF ENGG. AND TECHNOLOGY', place: 'MIRPET', dist: 'RR', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'TRMG', name: 'GOVT.POLYTECHNIC', place: 'TIRUMALAGIRI', dist: 'SRP', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'TRRM', name: 'TRR POLYTECHNIC', place: 'MEERPET', dist: 'RR', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'UTNR', name: 'GOVT MODEL RESIDENTIAL POLYTECHNIC', place: 'UTNOOR', dist: 'ADB', region: 'OU', type: 'GOV', minority: 'NA', mode: 'BOYS' },
  { code: 'VDPL', name: 'GOVERNMENT POLYTECHNIC', place: 'VADEPALLI', dist: 'GDL', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'VGSE', name: 'VAAGESHWARI COLL. OF ENGINEERING', place: 'KARIMNAGAR', dist: 'KRM', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'VGWL', name: 'VAAGDEVI ENGINEERING COLLEGE', place: 'WARANGAL', dist: 'WGL', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'VISA', name: 'VATHSALYA INSTITUTE OF SCI. AND TECHNOLOGY', place: 'BHONGIR', dist: 'YBG', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'VITS', name: 'SRI VISHWESWARAYA INST. OF TECHNOLOGY AND SCI.', place: 'MAHABUBNAGAR', dist: 'MBN', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'VKBD', name: 'GOVT.POLYTECHNIC', place: 'VIKARABAD', dist: 'VKB', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'VMRH', name: 'VMR PRADEEP KUMAR INSTITUTE OF ENGINEERING AND TECHNOLOGY', place: 'HANAMKONDA', dist: 'HNK', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'VREC', name: 'VIJAYA RURAL ENGINEERING COLLEGE', place: 'NIZAMABAD', dist: 'NZB', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'WITS', name: 'WARANGAL INST OF TECHNOLOGY SCIENCE', place: 'WARANGAL', dist: 'WGL', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'WLGW', name: 'GOVT POLYTECHNIC FOR WOMEN', place: 'WARANGAL', dist: 'WGL', region: 'OU', type: 'GOV', minority: 'NA', mode: 'GIRLS' },
  { code: 'WNPT', name: 'KDR GOVT POLYTECHNIC', place: 'WANAPARTHY', dist: 'WNP', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'Ydgr', name: 'GOVT.POLYTECHNIC', place: 'YADAGIRIGUTTA', dist: 'YBG', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'ZHBD', name: 'SS GOVT POLYTECHNIC', place: 'ZAHIRABAD', dist: 'SRD', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'BOMA2', name: 'BOMMA INST. OF TECHNOLOGY AND SCI.', place: 'HAYATHNAGAR', dist: 'RR', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'BRAW2', name: 'B R AMBEDKAR GMR POLYTECHNIC FOR WOMEN', place: 'HYDERABAD', dist: 'HYD', region: 'OU', type: 'GOV', minority: 'NA', mode: 'GIRLS' },
  { code: 'ELEN2', name: 'ELLENKI COLLGE OF ENGG. AND TECHNOLOGY', place: 'HYDERABAD', dist: 'HYD', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'HOLY2', name: 'HOLY MARY INSTITUTE OF TECH. SCIENCE', place: 'HYDERABAD', dist: 'HYD', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'MGHA2', name: 'MEGHA INST OF ENGG AND TECHNOLOGY FOR WOMEN', place: 'HYDERABAD', dist: 'HYD', region: 'OU', type: 'PVT', minority: 'NA', mode: 'GIRLS' },
  { code: 'NAWB2', name: 'NAWAB SHAH ALAM KHAN COLL OF ENGG AND TECH', place: 'HYDERABAD', dist: 'HYD', region: 'OU', type: 'PVT', minority: 'MUS', mode: 'COED' },
  { code: 'SMCD2', name: 'ST MARYS ENGINEERING COLLEGE', place: 'HYDERABAD', dist: 'HYD', region: 'OU', type: 'PVT', minority: 'CHR', mode: 'COED' },
  { code: 'SMED2', name: 'ST.MARYS GROUP OF INSTITUTIONS', place: 'HYDERABAD', dist: 'HYD', region: 'OU', type: 'PVT', minority: 'CHR', mode: 'COED' },
  { code: 'SMSK2', name: 'SAMSKRUTI COLLEGE OF ENGG. AND TECHNOLOGY.', place: 'HYDERABAD', dist: 'HYD', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'TKEM2', name: 'TEEGALA KRISHNA REDDY ENGINEERING COLLEGE', place: 'HYDERABAD', dist: 'HYD', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'TKRC2', name: 'T K R COLLEGE OF ENGG. AND TECHNOLOGY', place: 'HYDERABAD', dist: 'HYD', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'TRRM2', name: 'TRR POLYTECHNIC', place: 'HYDERABAD', dist: 'HYD', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'UTNR2', name: 'GOVT MODEL RESIDENTIAL POLYTECHNIC', place: 'HYDERABAD', dist: 'HYD', region: 'OU', type: 'GOV', minority: 'NA', mode: 'BOYS' }
];

const InstituteProfile = () => {
  const [query, setQuery] = useState('');

  const stats = useMemo(() => {
    const total = institutes.length;
    const government = institutes.filter((i) => i.type === 'GOV').length;
    const women = institutes.filter((i) => i.mode === 'GIRLS').length;
    return { total, government, women };
  }, []);

  const filtered = useMemo(() => {
    const term = query.toLowerCase().trim();
    if (!term) return institutes;
    return institutes.filter((inst) =>
      [inst.code, inst.name, inst.place, inst.dist, inst.region, inst.type, inst.mode]
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <header className="relative border-b border-border bg-background pt-16 pb-10 sm:pt-24 sm:pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 opacity-80 blur-2xl" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-4 text-left">
            <Badge className="bg-primary text-primary-foreground">Updated List</Badge>
            <h1 className="text-3xl sm:text-5xl font-bold text-gradient">Institute Profile</h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Browse all institutes under OU region with quick filters for type, mode, and location. Use the search to find a specific code or campus instantly.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card className="glass-card border-white/10">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total Institutes</p>
                  <p className="text-2xl font-bold text-primary">{stats.total}</p>
                </CardContent>
              </Card>
              <Card className="glass-card border-white/10">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Government</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.government}</p>
                </CardContent>
              </Card>
              <Card className="glass-card border-white/10">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Women-focused</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.women}</p>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-md bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-8 flex flex-col items-center justify-center border border-white/10">
              <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Institute Directory</h3>
              <p className="text-muted-foreground text-center text-sm">Browse {stats.total}+ polytechnic institutes across Telangana</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <Card className="glass-card border-white/10">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Institute Directory</h2>
                <p className="text-sm text-muted-foreground">Search by code, name, place, or district.</p>
              </div>
              <Input
                placeholder="Search institutes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full sm:w-64"
              />
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/60">
                  <tr className="text-left">
                    <th className="py-3 px-3 font-semibold text-foreground">#</th>
                    <th className="py-3 px-3 font-semibold text-foreground">Code</th>
                    <th className="py-3 px-3 font-semibold text-foreground">Institute</th>
                    <th className="py-3 px-3 font-semibold text-foreground">Place</th>
                    <th className="py-3 px-3 font-semibold text-foreground">Dist.</th>
                    <th className="py-3 px-3 font-semibold text-foreground">Region</th>
                    <th className="py-3 px-3 font-semibold text-foreground">Type</th>
                    <th className="py-3 px-3 font-semibold text-foreground">Minority</th>
                    <th className="py-3 px-3 font-semibold text-foreground">Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((inst, index) => (
                    <tr key={`${inst.code}-${index}`} className="hover:bg-muted/40">
                      <td className="py-3 px-3 text-foreground">{index + 1}</td>
                      <td className="py-3 px-3 font-semibold">
                        {inst.code === 'IOES' ? (
                          <Link to="/ioes" className="text-primary hover:underline cursor-pointer font-bold">
                            {inst.code}
                          </Link>
                        ) : (
                          <Link to={`/institute/${inst.code}`} className="text-primary hover:underline cursor-pointer">{inst.code}</Link>
                        )}
                      </td>
                      <td className="py-3 px-3 text-foreground">{inst.name}</td>
                      <td className="py-3 px-3 text-foreground">{inst.place}</td>
                      <td className="py-3 px-3 text-foreground">{inst.dist}</td>
                      <td className="py-3 px-3 text-foreground">{inst.region}</td>
                      <td className="py-3 px-3 text-foreground">{inst.type}</td>
                      <td className="py-3 px-3 text-foreground">{inst.minority}</td>
                      <td className="py-3 px-3 text-foreground">{inst.mode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted-foreground">Data provided as-is for quick reference. Use the search bar to jump to a code or institute name.</p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default InstituteProfile;
