import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Users, FileText, Image as ImageIcon, Download, ArrowRight, ExternalLink } from 'lucide-react';
import { noDataIllustration } from '@/lib/illustrations';
import { eventsAPI, Event } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";

const EventsSection = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await eventsAPI.getAll();
                const normalizedData = data.map(e => ({
                    ...e,
                    status: e.status || 'upcoming'
                }));
                setEvents(normalizedData);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const upcomingEvents = events.filter(e => e.status === 'upcoming');
    const conductedEvents = events.filter(e => e.status === 'conducted');

    const handleEventAction = (event: Event) => {
        // For upcoming events with links, follow the link. For others, show details.
        if (event.status === 'upcoming' && event.registerLink && event.registerLink !== '#') {
            window.open(event.registerLink, '_blank');
        } else {
            setSelectedEvent(event);
        }
    };

    const handleModalSecondaryAction = (event: Event) => {
        if (event.status === 'conducted') {
            if (event.registerLink && event.registerLink !== '#') {
                window.open(event.registerLink, '_blank');
            } else {
                navigate('/celebrations');
            }
        } else if (event.status === 'upcoming' && event.registerLink && event.registerLink !== '#') {
            window.open(event.registerLink, '_blank');
        }
    };

    return (
        <section className="py-0 bg-background">
            <div className="container mx-auto px-6 lg:px-12">
                {/* Header */}
                <div className="text-left max-w-2xl mb-20 relative">
                    <div className="absolute -left-6 top-2 bottom-2 w-1 bg-primary/40 rounded-full hidden lg:block" />
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground mb-6 tracking-tighter uppercase leading-[0.9]">
                        CAMPUS <span className="text-primary">EVENTS.</span>
                    </h2>
                    <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                        Stay ahead with our latest workshops & academic updates. <br />
                        <span className="text-foreground/80 italic font-bold">Synchronized Growth.</span>
                    </p>
                </div>

                {/* Events Grid */}
                <div className="space-y-16">
                    {isLoading ? (
                        <div className="flex flex-col items-center text-center text-muted-foreground py-20 bg-white/[0.02] border border-dashed rounded-3xl">
                            <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Loading events...</p>
                        </div>
                    ) : (
                        <>
                            {/* Upcoming Events Section */}
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] mb-10">
                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live & Upcoming</span>
                                </div>
                                {upcomingEvents.length === 0 ? (
                                    <div className="flex flex-col items-center text-center text-muted-foreground py-16 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">No upcoming events scheduled yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {upcomingEvents.map((event) => (
                                            <EventCard key={event.id} event={event} onAction={() => handleEventAction(event)} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Conducted Events Section */}
                            {conductedEvents.length > 0 && (
                                <div className="pt-12">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] mb-10">
                                        <Users className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Previous Events</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {conductedEvents.map((event) => (
                                            <EventCard key={event.id} event={event} onAction={() => handleEventAction(event)} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {events.length === 0 && !isLoading && (
                                <div className="flex flex-col items-center text-center text-muted-foreground py-20 bg-white/[0.02] border border-dashed rounded-3xl space-y-4">
                                    <img src={noDataIllustration} alt="No events" className="w-full max-w-xs opacity-50 grayscale" />
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">No events posted yet.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Event Details Modal */}
            <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                <DialogContent className="max-w-3xl bg-background/95 backdrop-blur-xl border-white/10 p-0 overflow-hidden rounded-[32px] shadow-2xl focus:outline-none">
                    {selectedEvent && (
                        <div className="flex flex-col max-h-[90vh]">
                            {/* Header Image */}
                            <div className="relative h-64 sm:h-80 w-full overflow-hidden shrink-0">
                                <img
                                    src={getImageUrl(selectedEvent.image)}
                                    alt={selectedEvent.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                                <div className="absolute top-6 right-6">
                                    <div className={`px - 4 py - 1.5 rounded - full text - [10px] font - black uppercase tracking - [0.2em] backdrop - blur - md border ${selectedEvent.status === 'upcoming' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-white/10 text-muted-foreground border-white/20'} `}>
                                        {selectedEvent.status}
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-8 pb-10 -mt-20 relative z-10 flex flex-col overflow-y-auto custom-scrollbar">
                                <div className="mb-8">
                                    <h2 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase text-foreground mb-4 leading-tight">
                                        {selectedEvent.title}
                                    </h2>

                                    {/* Logistical Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-white/[0.03] border border-white/[0.05] border-dashed rounded-[24px]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <Calendar className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-black opacity-40">Date</span>
                                                <span className="text-xs font-bold">{selectedEvent.date}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <Clock className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-black opacity-40">Time</span>
                                                <span className="text-xs font-bold">{selectedEvent.time}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <MapPin className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-black opacity-40">Location</span>
                                                <span className="text-xs font-bold truncate">{selectedEvent.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-primary mb-3">Event Brief</h4>
                                        <p className="text-base text-muted-foreground leading-relaxed font-medium">
                                            {selectedEvent.description}
                                        </p>
                                    </div>

                                    {/* Action Buttons removed as requested */}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
};

const EventCard = ({ event, onAction }: { event: Event; onAction: () => void }) => (
    <div className="group bg-white/[0.02] border border-white/[0.05] rounded-[32px] overflow-hidden hover:border-primary/50 hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)] transition-all duration-500 p-2 flex flex-col h-full">
        <div className="relative aspect-[16/10] rounded-[24px] overflow-hidden mb-6 flex-shrink-0">
            <img
                src={event.image ? getImageUrl(event.image) : noDataIllustration}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
            />
            <div className="absolute top-4 right-4">
                <div className={`px - 3 py - 1 rounded - full text - [9px] font - black uppercase tracking - widest backdrop - blur - md border ${event.status === 'upcoming' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-white/10 text-muted-foreground border-white/20'} `}>
                    {event.status === 'upcoming' ? 'Upcoming' : 'Conducted'}
                </div>
            </div>
        </div>

        <div className="px-6 pb-6 pt-2 flex flex-col flex-grow">
            <div className="flex-grow">
                <h3 className="text-xl font-bold text-foreground mb-3 tracking-tight line-clamp-1 group-hover:text-primary transition-colors">{event.title}</h3>
                <p className="text-sm text-muted-foreground mb-8 line-clamp-2 leading-relaxed font-medium">{event.description}</p>

                <div className="space-y-4 mb-6">
                    {/* Event Details */}
                    <div className="space-y-2 border-t border-white/[0.05] pt-6">
                        <div className="flex items-center text-sm font-medium">
                            <Calendar className="w-4 h-4 mr-3 text-primary" />
                            {event.date === "Coming Soon" ? (
                                <span className="text-primary animate-pulse text-xs font-bold uppercase tracking-widest">Coming Soon</span>
                            ) : (
                                <span className="text-muted-foreground text-xs">{event.date}</span>
                            )}
                        </div>
                        <div className="flex items-center text-sm font-medium">
                            <Clock className="w-4 h-4 mr-3 text-primary" />
                            <span className="text-muted-foreground text-xs">{event.time}</span>
                        </div>
                        <div className="flex items-center text-sm font-medium text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-3 text-primary" />
                            <span className="text-xs">{event.location}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Button - Locked at Bottom */}
            <div className="mt-auto pt-4">
                {event.status === 'upcoming' ? (
                    <Button
                        className="w-full h-12 bg-primary text-white hover:bg-primary/90 transition-all rounded-xl font-bold text-xs uppercase tracking-widest shadow-glow focus-visible:ring-0 focus-visible:ring-offset-0"
                        onClick={onAction}
                    >
                        Register Now
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        className="w-full h-12 border-2 border-primary/50 hover:bg-primary/5 transition-all rounded-xl font-bold text-xs uppercase tracking-widest shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-primary/50 active:border-primary/50"
                        onClick={onAction}
                    >
                        View Details
                    </Button>
                )}
            </div>
        </div>
    </div>
);

export default EventsSection;
