import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2, Crop } from "lucide-react";
import { getCroppedImg } from "@/lib/cropImage";

interface ImageCropperDialogProps {
    isOpen: boolean;
    imageSrc: string;
    aspectRatio?: number; // e.g. 16/9 for gallery, 1/1 for profile pics
    onCropComplete: (croppedFile: File) => Promise<void>;
    onCancel: () => void;
}

export default function ImageCropperDialog({
    isOpen,
    imageSrc,
    aspectRatio = 16 / 9,
    onCropComplete,
    onCancel
}: ImageCropperDialogProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const onCropCompleteLocal = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleConfirm = async () => {
        if (!croppedAreaPixels) return;
        setIsProcessing(true);
        try {
            const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, "cropped-image.jpg");
            await onCropComplete(croppedFile);
        } catch (error) {
            console.error("Failed to crop image", error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!isProcessing && !open) onCancel(); }}>
            <DialogContent className="sm:max-w-[600px] border-white/10 bg-slate-950 p-0 overflow-hidden shadow-2xl glass-card">
                <div className="p-6 bg-slate-900 border-b border-white/10">
                    <DialogTitle className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <Crop className="w-5 h-5 text-blue-400" />
                        Crop Image
                    </DialogTitle>
                    <p className="text-xs text-slate-400 mt-1 font-medium">Position and scale the image to fit perfectly without getting cut off.</p>
                </div>

                <div className="relative w-full h-[400px] bg-slate-950">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspectRatio}
                        onCropChange={setCrop}
                        onCropComplete={onCropCompleteLocal}
                        onZoomChange={setZoom}
                    />
                </div>

                <div className="p-6 bg-slate-900 border-t border-white/10 space-y-6">
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <span>Zoom</span>
                            <span>{Math.round(zoom * 100)}%</span>
                        </div>
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(val) => setZoom(val[0])}
                            className="w-full"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={onCancel} disabled={isProcessing} className="text-slate-400 hover:text-white hover:bg-white/10 transition-all font-bold">
                            Cancel
                        </Button>
                        <Button onClick={handleConfirm} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide transition-all shadow-lg hover:shadow-blue-500/20">
                            {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : "Confirm Crop"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
