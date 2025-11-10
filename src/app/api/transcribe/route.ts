import { createClient } from '@deepgram/sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

    if (process.env.DEEPGRAM_ENV === "development") {
        return NextResponse.json({
            key: process.env.DEEPGRAM_API_KEY ?? "",
        });
    }

    try {
        const formData = await request.formData();
        const audioFile = formData.get('file') as File;

        if (!audioFile) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
        } 

        const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

        const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
            audioBuffer,
            {
                model: 'whisper',
                language: 'en-US',
                punctuate: true,
                smart_format: true,
                // profanity_filter: false,
                // redact: false,
                // paragraphs: false,
                // utterances: false,
                // utt_split: 0.8,
                // tier: 'enhanced',       
            }
        );

        if (error) {
            console.error('Deepgram error:', error);
            return NextResponse.json(
                { error: 'Transcription failed' },
                { status: 500 }
            );
        }

        const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';

        if (!transcript.trim()) {
            return NextResponse.json({ text: '[No speech detected - please try speaking louder]' });
        }

        return NextResponse.json({
            text: transcript,
            confidence: result.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0
        });

    } catch (error) {
        console.error('Transcription error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
};
