"use client";

import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { useEffect, useState, useRef, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { X, Mic, MicOff } from 'lucide-react';
import 'regenerator-runtime/runtime';

interface Transcript {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: number;
}

const Transcription = ({ onClose }: { onClose: () => void }) => {
    const call = useCall();
    const { useLocalParticipant, useMicrophoneState } = useCallStateHooks();
    const localParticipant = useLocalParticipant();
    const { isMute } = useMicrophoneState(); // Get mute status

    const [transcripts, setTranscripts] = useState<Transcript[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isTracking, setIsTracking] = useState(false); // User's intent to transcribe
    const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const {
        transcript,
        resetTranscript,
        browserSupportsSpeechRecognition,
        listening
    } = useSpeechRecognition();

    // Auto-pause transcription when muted
    useEffect(() => {
        if (!isTracking) return;

        if (isMute && listening) {
            SpeechRecognition.stopListening();
        } else if (!isMute && !listening) {
            SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
        }
    }, [isMute, isTracking, listening]);

    // Scroll to bottom when transcripts update
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [transcripts, transcript]);

    const handleCommit = useCallback(async (text: string) => {
        if (!text.trim() || !call) return;

        const newTranscript: Transcript = {
            id: crypto.randomUUID(),
            senderId: localParticipant?.userId || 'unknown',
            senderName: localParticipant?.name || 'Unknown User',
            text: text,
            timestamp: Date.now(),
        };

        // Add locally
        setTranscripts(prev => [...prev, newTranscript]);

        // Broadcast
        try {
            await call.sendCustomEvent({
                type: 'transcription',
                data: newTranscript,
            });
        } catch (error) {
            console.error("Failed to broadcast transcript", error);
        }

        resetTranscript();
    }, [call, localParticipant, resetTranscript]);

    // Handle committing transcript after silence
    useEffect(() => {
        if (!transcript) return;

        // Output is accumulative. We wait for silence to commit.
        if (silenceTimer.current) clearTimeout(silenceTimer.current);

        silenceTimer.current = setTimeout(() => {
            handleCommit(transcript);
        }, 2000); // 2 seconds silence = commit

        return () => {
            if (silenceTimer.current) clearTimeout(silenceTimer.current);
        };
    }, [transcript, handleCommit]);

    // Listen for remote transcripts
    useEffect(() => {
        if (!call) return;

        const handleCustomEvent = (event: any) => {
            if (event.type === 'transcription') {
                // Stream SDK event structure might vary, sometimes it's event.custom
                const payload = event.custom?.data || event.data; // defensively check
                if (payload && payload.senderId !== call.currentUserId) {
                    setTranscripts(prev => [...prev, payload]);
                }
            }
        };

        call.on('custom', handleCustomEvent);

        return () => {
            call.off('custom', handleCustomEvent);
        };
    }, [call]);

    // Handle start/stop
    const toggleTracking = () => {
        if (isTracking) {
            setIsTracking(false);
            SpeechRecognition.stopListening();
            // specific logic: if there is pending transcript, commit it immediately
            if (transcript) {
                handleCommit(transcript);
            }
        } else {
            setIsTracking(true);
            // Only start if not muted. Effect will handle the rest.
            if (!isMute) {
                SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
            }
        }
    };

    if (!browserSupportsSpeechRecognition) {
        return <div className="p-4 text-white">Browser does not support speech recognition.</div>;
    }

    return (
        <div className="flex flex-col h-full bg-dark-1 text-white border-l border-dark-3 w-[350px]">
            <div className="flex items-center justify-between p-4 border-b border-dark-3 bg-dark-2">
                <div className="flex items-center gap-2">
                    {isTracking ? <Mic className="text-green-500 animate-pulse" size={20} /> : <MicOff className="text-red-500" size={20} />}
                    <h2 className="text-lg font-bold">Transcription</h2>
                </div>
                <button onClick={onClose} className="hover:bg-dark-3 p-1 rounded transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {transcripts.length === 0 && !transcript && (
                    <div className="flex flex-col items-center justify-center h-full opacity-50">
                        <p>No transcripts yet...</p>
                        <p className="text-sm">
                            {isTracking ? "Listening..." : "Click Start to transcribe."}
                        </p>
                    </div>
                )}

                {transcripts.map((t) => (
                    <div key={t.id} className={`flex flex-col ${t.senderId === call?.currentUserId ? 'items-end' : 'items-start'}`}>
                        <span className="text-xs text-gray-400 mb-1 px-1">
                            {t.senderId === call?.currentUserId ? 'Me' : t.senderName} • {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div
                            className={`p-3 rounded-2xl max-w-[85%] text-sm shadow-sm ${t.senderId === call?.currentUserId
                                ? 'bg-blue-600 rounded-tr-none'
                                : 'bg-dark-3 rounded-tl-none border border-dark-4'
                                }`}
                        >
                            <p>{t.text}</p>
                        </div>
                    </div>
                ))}

                {/* Live Preview */}
                {isTracking && transcript && (
                    <div className="flex flex-col items-end animate-pulse">
                        <span className="text-xs text-gray-400 mb-1 px-1">Me (Speaking...)</span>
                        <div className="p-3 rounded-2xl rounded-tr-none max-w-[85%] text-sm bg-blue-600/50 border border-blue-500/30">
                            <p>{transcript}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-dark-2 border-t border-dark-3">
                <button
                    onClick={toggleTracking}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2 ${isTracking
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                        }`}
                >
                    {isTracking ? 'Stop Transcription' : 'Start Transcription'}
                </button>
            </div>
        </div>
    );
};

export default Transcription;
