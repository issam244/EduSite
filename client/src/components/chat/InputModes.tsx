import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Mic, 
  Image, 
  FileText, 
  Send, 
  MicOff,
  Upload,
  Languages
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InputModesProps {
  onSendMessage: (content: string, type: 'text', metadata?: any) => void;
  onProcessImage: (file: File, language: string) => Promise<void>;
  onProcessPDF: (file: File, language: string) => Promise<void>;
  onProcessAudio: (audioData: Blob, language: string) => Promise<void>;
  disabled?: boolean;
}

export function InputModes({ 
  onSendMessage, 
  onProcessImage, 
  onProcessPDF, 
  onProcessAudio,
  disabled = false 
}: InputModesProps) {
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState("fr");
  const [inputMode, setInputMode] = useState<'text' | 'image' | 'pdf' | 'audio'>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message, 'text');
      setMessage("");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (inputMode === 'image' && file.type.startsWith('image/')) {
        await onProcessImage(file, language);
      } else if (inputMode === 'pdf' && file.type === 'application/pdf') {
        await onProcessPDF(file, language);
      } else {
        toast({
          title: "Format non supporté",
          description: "Veuillez sélectionner le bon type de fichier",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de traiter le fichier",
        variant: "destructive"
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        await onProcessAudio(audioBlob, language);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Erreur d'enregistrement",
        description: "Impossible d'accéder au microphone",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const getModeIcon = () => {
    switch (inputMode) {
      case 'text': return <Send className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'audio': return isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />;
      default: return <Send className="h-4 w-4" />;
    }
  };

  const getModeLabel = () => {
    switch (inputMode) {
      case 'text': return 'Texte';
      case 'image': return 'Image';
      case 'pdf': return 'PDF';
      case 'audio': return 'Audio';
      default: return 'Texte';
    }
  };

  return (
    <div className="border-t bg-white dark:bg-gray-900 p-4 space-y-4">
      {/* Language and Mode Selection */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-medium-gray" />
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="ar">العربية</SelectItem>
              <SelectItem value="tn">Tunisien</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          {(['text', 'image', 'pdf', 'audio'] as const).map((mode) => (
            <Button
              key={mode}
              variant={inputMode === mode ? "default" : "outline"}
              size="sm"
              onClick={() => setInputMode(mode)}
              className="flex items-center gap-2"
            >
              {mode === 'text' && <Send className="h-4 w-4" />}
              {mode === 'image' && <Image className="h-4 w-4" />}
              {mode === 'pdf' && <FileText className="h-4 w-4" />}
              {mode === 'audio' && <Mic className="h-4 w-4" />}
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Input based on mode */}
      {inputMode === 'text' && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Posez votre question mathématique..."
            className="min-h-[60px] resize-none"
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button 
            type="submit" 
            disabled={!message.trim() || disabled}
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}

      {(inputMode === 'image' || inputMode === 'pdf') && (
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept={inputMode === 'image' ? 'image/*' : '.pdf'}
            onChange={handleFileUpload}
            className="hidden"
            disabled={disabled}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Télécharger {getModeLabel()}
          </Button>
          <span className="text-sm text-medium-gray">
            {inputMode === 'image' 
              ? 'Formats supportés: JPG, PNG, GIF' 
              : 'Format supporté: PDF'
            }
          </span>
        </div>
      )}

      {inputMode === 'audio' && (
        <div className="flex items-center gap-4">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled}
            variant={isRecording ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isRecording ? 'Arrêter l\'enregistrement' : 'Commencer l\'enregistrement'}
          </Button>
          {isRecording && (
            <span className="text-sm text-red-600 animate-pulse">
              Enregistrement en cours...
            </span>
          )}
        </div>
      )}
    </div>
  );
}