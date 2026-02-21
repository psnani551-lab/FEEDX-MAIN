import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    MapPin, Star, Share2, Download, Building,
    GraduationCap, Users, Calendar, ArrowLeft,
    ExternalLink, Mail, Phone, Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FACULTY_DATA, DEPARTMENTS } from '@/data/ioesData';

const IOESPage = () => {
    const [activeTab, setActiveTab] = useState("overview");

    const galleryImages = [
        "2d839e36-0991-49a8-88aa-b1bd002f0eec.jpg",
        "362f15d5-e1da-4563-8412-1ab8f1067f3b.jpg",
        "44bf578a-9013-44e4-8ca3-88c6a15d00b8.jpg",
        "537422c4-fa2d-4a37-986a-4468ee4c224a.jpg",
        "7229f92e-c61c-4c22-9705-5235a05dfa76.jpg",
        "83598784-aff9-46b0-b33d-d05486751359.jpg",
        "87de1f65-8006-41bc-9fc1-db7ac3c7cf04.jpg",
        "93e9ac10-f524-43a6-af6c-fe61b54038d4.jpg",
        "b8af2369-7938-4f19-a178-0ed6bab9787e.jpg",
        "cd96ad0e-d8eb-4ffe-8b51-783c4cd3b661.jpg",
        "dbff9a99-48ef-4442-8902-a40303bbe65e.jpg",
        "e3a637d5-3e5b-44de-8c1d-14bb58cf7d31.jpg",
        "f7525e12-3d26-4ef3-835c-df1111043f76.jpg",
        "f7b89bec-bf2c-4702-94bd-1b7965a1a6ab.jpg"
    ];

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Banner Section */}
            <div className="relative">
                {/* Banner Image Container */}
                <div className="relative h-48 sm:h-64 md:h-72 w-full mt-16 overflow-hidden">
                    <div className="absolute inset-0 bg-black/20 z-10" />
                    <img
                        src="/images/ioes_banner.jpg"
                        alt="IOES Banner"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Logo & Header Info Container */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-12 sm:-mt-16 mb-8">
                    <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-6">
                        {/* Logo */}
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-white p-2 shadow-lg border border-slate-100 flex-shrink-0">
                            <img
                                src="/images/gioe-logo.jpg"
                                alt="IOES Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>

                        {/* Title & Actions */}
                        <div className="flex-1 pt-2 sm:pt-16 md:pt-20">
                            <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                                <div className="space-y-2">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                                        Government Institute of Electronics, Secunderabad
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-sm">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            East Marredpally, Secunderabad
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            4.2 / 5 (84 Reviews)
                                        </div>
                                        <div className="flex items-center gap-1 text-foreground font-medium">
                                            <Building className="w-4 h-4" />
                                            Estd. 1981
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 w-full sm:w-auto mt-2 lg:mt-0">
                                    <div className="flex flex-wrap gap-2">
                                        <Button variant="outline" className="gap-2 h-9">
                                            <Share2 className="w-4 h-4" />
                                            Share
                                        </Button>
                                        <Button className="gap-2 bg-green-600 hover:bg-green-700 h-9">
                                            <Download className="w-4 h-4" />
                                            Brochure
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-4">
                                <Badge variant="secondary" className="bg-slate-100 text-slate-800 hover:bg-slate-200">Public/Government Institute</Badge>
                                <Badge variant="outline">Co-Ed</Badge>
                                <Badge variant="outline">AICTE Approved</Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <Separator className="my-6" />
                </div>
            </div>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                {/* Content Tabs */}
                <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="w-full justify-start h-auto flex-wrap gap-2 bg-transparent p-0 border-b rounded-none mb-6">
                        <TabsTrigger
                            value="overview"
                            className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-4 py-2"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="courses"
                            className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-4 py-2"
                        >
                            Courses
                        </TabsTrigger>
                        <TabsTrigger
                            value="faculty"
                            className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-4 py-2"
                        >
                            Faculty
                        </TabsTrigger>
                        <TabsTrigger
                            value="gallery"
                            className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-4 py-2"
                        >
                            Gallery
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-8 animate-in fade-in-0 duration-300">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* About Section */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>About College</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
                                        <p>
                                            The Government Institute of Electronics, Secunderabad was established in 1981 by the Government of Andhra Pradesh as a statewide Polytechnic approved by the All India Council for Technical Education (AICTE). Following the formation of the State of Telangana, the institution became part of Telangana's technical education system and continues to serve as a pioneering government polytechnic in the domain of Electronics and Emerging Technologies.
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Unique Features */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Unique Features</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
                                        <p>
                                            All diploma programs offered at the institute differ significantly from conventional diploma courses. Each program is of 3-year duration and includes a compulsory industrial training component during the final or pre-final semester. Core Electronics subjects are common across all specializations, supported by advanced branch-specific modules designed to meet the needs of modern industries and emerging technologies.
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Vision & Mission */}
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800">
                                        <CardHeader>
                                            <CardTitle className="text-blue-600 dark:text-blue-400">Vision</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">
                                                To be equipped with state-of-the-art technology, attract and retain talented human resources, and deliver a balanced education of rigorous theory and practical skills aligned with industry needs, thereby maturing into a world-class institute that empowers students to innovate, serve, and lead.
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-800">
                                        <CardHeader>
                                            <CardTitle className="text-green-600 dark:text-green-400">Mission</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">
                                                To achieve an educational environment where every enrolled student successfully completes the program with zero dropout rate, attains 100% academic success, and secures 100% placement through strong industry-oriented training and institutional support.
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Right Sidebar */}
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Contact Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                                            <span className="text-sm">East Marredpally, Secunderabad, Telangana - 500026</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Globe className="w-5 h-5 text-muted-foreground shrink-0" />
                                            <a href="https://gioescbd.dte.telangana.gov.in/" target="_blank" rel="noopener" className="text-sm hover:underline text-primary">gioescbd.dte.telangana.gov.in</a>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-muted-foreground shrink-0" />
                                            <a href="mailto:contact@ioes.in" className="text-sm hover:underline">principal.ioes@gmail.com</a>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Departments</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {DEPARTMENTS.map((dept, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                                    {dept}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Courses Tab */}
                    <TabsContent value="courses" className="space-y-6 animate-in fade-in-0 duration-300">
                        <Card>
                            <CardHeader>
                                <CardTitle>Diploma Programs Offered</CardTitle>
                                <CardDescription>3-year full-time diploma courses approved by AICTE</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {[
                                        "Diploma in Computer Science Engineering",
                                        "Diploma in Electronics and Communications Engineering",
                                        "Diploma in Biomedical Engineering",
                                        "Diploma in Electronics and Instrumentation Engineering",
                                        "Diploma in Electronics and Video Engineering",
                                        "Diploma in Embedded Systems Engineering",
                                        "Diploma in Cyber Physical Systems and Security",
                                        "Diploma in Artificial Intelligence and Machine Learning",
                                        "Diploma in Cloud Computing and Big Data"
                                    ].map((course, i) => (
                                        <div key={i} className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                                            <GraduationCap className="w-8 h-8 text-primary opacity-80" />
                                            <span className="font-medium">{course}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Faculty Tab */}
                    <TabsContent value="faculty" className="space-y-6 animate-in fade-in-0 duration-300">
                        <Card>
                            <CardHeader>
                                <CardTitle>Faculty Details</CardTitle>
                                <CardDescription>Meet our dedicated teaching staff</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-muted/50">
                                            <tr className="text-left">
                                                <th className="p-4 font-semibold">Faculty Name</th>
                                                <th className="p-4 font-semibold">Designation</th>
                                                <th className="p-4 font-semibold">Branch</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {FACULTY_DATA.map((faculty, i) => (
                                                <tr key={i} className="hover:bg-muted/50 transition-colors">
                                                    <td className="p-4 font-medium">{faculty.name}</td>
                                                    <td className="p-4 text-muted-foreground">{faculty.designation}</td>
                                                    <td className="p-4">
                                                        <Badge variant="outline" className="font-normal">
                                                            {faculty.branch}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Gallery Tab */}
                    <TabsContent value="gallery" className="space-y-6 animate-in fade-in-0 duration-300">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {galleryImages.map((img, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="relative group aspect-square overflow-hidden rounded-xl border bg-muted"
                                >
                                    <img
                                        src={`/images/ioes/${img}`}
                                        alt={`Gallery Image ${i + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                            View
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </main>

            <Footer />
        </div>
    );
};

export default IOESPage;
