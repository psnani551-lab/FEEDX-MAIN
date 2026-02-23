import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { getCroppedImg } from '@/lib/cropImage';
import { ZoomIn, ZoomOut, Scissors } from 'lucide-react';

interface ImageCropperDialogProps {
    image: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCropComplete: (croppedImage: Blob) => void;
    aspectRatio?: number;
}

export function ImageCropperDialog({
    image,
    open,
    onOpenChange,
    onCropComplete,
    aspectRatio = 16 / 9,
}: ImageCropperDialogProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteInternal = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCrop = async () => {
        if (!image || !croppedAreaPixels) return;

        try {
            const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
            if (croppedBlob) {
                onCropComplete(croppedBlob);
                onOpenChange(false);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] border-white/10 bg-card/95 backdrop-blur-xl shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
                        Adjust <span className="text-primary">Photo.</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="relative w-full h-[400px] bg-black/20">
                    {image && (
                        <Cropper
                            image={image}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspectRatio}
                            onCropChange={onCropChange}
                            onCropComplete={onCropCompleteInternal}
                            onZoomChange={onZoomChange}
                            classes={{
                                containerClassName: "bg-slate-900/50",
                            }}
                        />
                    )}
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        <ZoomOut className="w-4 h-4 text-muted-foreground" />
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(val: number[]) => setZoom(val[0])}
                            className="flex-1"
                        />
                        <ZoomIn className="w-4 h-4 text-muted-foreground" />
                    </div>

                    <DialogFooter className="flex sm:justify-between gap-4">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="font-bold border-white/10 hover:bg-white/5"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCrop}
                            className="gap-2 font-bold uppercase tracking-widest text-xs px-8 shadow-lg shadow-primary/20"
                        >
                            <Scissors className="w-4 h-4" /> Finish & Upload
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
